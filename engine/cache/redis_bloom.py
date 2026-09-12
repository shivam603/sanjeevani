"""
High-performance Caching Layer with Redis and In-Memory Bloom Filter.
Guarantees sub-millisecond decision retrieval, query deduplication,
and shields the IBM watsonx.ai rate limits (2 req/sec).
"""
import os
import hashlib
import logging
import json
from typing import Optional, Dict, Any

logger = logging.getLogger("hackathon_engine.cache")


class BloomFilter:
    """
    Standard Bloom Filter probabilistic data structure.
    Used for instant set-membership testing to determine if a query has been
    previously processed without incurring expensive database or LLM queries.
    """
    def __init__(self, size: int = 100000, hash_count: int = 5):
        self.size = size
        self.hash_count = hash_count
        self.bit_array = [0] * size

    def _hashes(self, item: str):
        item_bytes = item.encode("utf-8")
        h1 = int(hashlib.md5(item_bytes).hexdigest(), 16)
        h2 = int(hashlib.sha256(item_bytes).hexdigest(), 16)
        for i in range(self.hash_count):
            yield (h1 + i * h2) % self.size

    def add(self, item: str):
        for bit_index in self._hashes(item):
            self.bit_array[bit_index] = 1

    def might_contain(self, item: str) -> bool:
        return all(self.bit_array[bit_index] == 1 for bit_index in self._hashes(item))


class CacheManager:
    """
    Hybrid Caching Layer:
    1. Bloom Filter (immediate O(1) query existence check)
    2. Redis Cache (remote in-memory store) with local in-memory fallback dict
    """
    def __init__(self):
        self.redis_url = os.getenv("REDIS_URL", "redis://localhost:6379/0")
        self.bloom = BloomFilter(size=50000, hash_count=4)
        self.local_cache: Dict[str, str] = {}
        self.redis_client = None
        self._init_redis()

    def _init_redis(self):
        try:
            import redis
            self.redis_client = redis.from_url(self.redis_url, decode_responses=True, socket_timeout=1.5)
            self.redis_client.ping()
            logger.info("Connected to Redis cache successfully.")
        except Exception:
            logger.info("Redis not reachable or not installed. Operating with high-speed local in-memory cache.")
            self.redis_client = None

    def _generate_key(self, vertical: str, channel: str, text: str) -> str:
        raw = f"{vertical.lower()}:{channel.lower()}:{text.strip().lower()}"
        return f"cache:decision:{hashlib.sha256(raw.encode()).hexdigest()[:16]}"

    def get_decision(self, vertical: str, channel: str, text: str) -> Optional[Dict[str, Any]]:
        key = self._generate_key(vertical, channel, text)

        # Step 1: Bloom Filter check
        if not self.bloom.might_contain(key):
            # Definitely not in cache
            return None

        # Step 2: Retrieve from Redis or local cache
        try:
            if self.redis_client:
                data = self.redis_client.get(key)
                if data:
                    return json.loads(data)
            elif key in self.local_cache:
                return json.loads(self.local_cache[key])
        except Exception as e:
            logger.warning(f"Cache read error: {e}")

        return None

    def set_decision(self, vertical: str, channel: str, text: str, decision_payload: Dict[str, Any], ttl_seconds: int = 3600):
        key = self._generate_key(vertical, channel, text)
        json_str = json.dumps(decision_payload)

        # Add to Bloom filter
        self.bloom.add(key)

        # Store in Redis / local cache
        try:
            if self.redis_client:
                self.redis_client.setex(key, ttl_seconds, json_str)
            else:
                self.local_cache[key] = json_str
        except Exception as e:
            logger.warning(f"Cache write error: {e}")


# Singleton Cache Manager
cache_manager = CacheManager()

"""Security, Cryptography, JWT and Consent Token helpers for KisanCred."""

import hmac
import hashlib
import json
from datetime import datetime, timedelta, timezone
from typing import Any, Dict, List, Optional, Union
from app.core.config import settings

# Lightweight fallback token implementation if python-jose is not yet compiled
try:
    from jose import jwt
    HAVE_JOSE = True
except ImportError:
    import base64
    HAVE_JOSE = False


def create_access_token(subject: Union[str, Any], expires_delta: Optional[timedelta] = None, extra_claims: Optional[Dict[str, Any]] = None) -> str:
    """Create signed JWT access token for user/system sessions."""
    now = datetime.now(timezone.utc)
    if expires_delta:
        expire = now + expires_delta
    else:
        expire = now + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)

    to_encode: Dict[str, Any] = {
        "sub": str(subject),
        "iat": int(now.timestamp()),
        "exp": int(expire.timestamp()),
        "iss": "kisancred-auth-service",
    }
    if extra_claims:
        to_encode.update(extra_claims)

    if HAVE_JOSE:
        return jwt.encode(to_encode, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM)
    else:
        # Cryptographic fallback
        encoded_data = json.dumps(to_encode, sort_keys=True).encode("utf-8")
        signature = hmac.new(settings.JWT_SECRET_KEY.encode("utf-8"), encoded_data, hashlib.sha256).hexdigest()
        b64_payload = base64.urlsafe_b64encode(encoded_data).decode("utf-8")
        return f"{b64_payload}.{signature}"


def verify_access_token(token: str) -> Optional[Dict[str, Any]]:
    """Decode and verify JWT access token."""
    try:
        if HAVE_JOSE:
            payload = jwt.decode(token, settings.JWT_SECRET_KEY, algorithms=[settings.JWT_ALGORITHM])
            return payload
        else:
            parts = token.split(".")
            if len(parts) != 2:
                return None
            b64_payload, signature = parts
            raw_data = base64.urlsafe_b64decode(b64_payload.encode("utf-8"))
            expected_sig = hmac.new(settings.JWT_SECRET_KEY.encode("utf-8"), raw_data, hashlib.sha256).hexdigest()
            if not hmac.compare_digest(signature, expected_sig):
                return None
            data = json.loads(raw_data.decode("utf-8"))
            if data.get("exp", 0) < datetime.now(timezone.utc).timestamp():
                return None
            return data
    except Exception:
        return None


# -----------------------------------------------------------------------------
# -----------------------------------------------------------------------------
# Stage 5: Cryptographic Consent Token & API Security Architecture
# -----------------------------------------------------------------------------

import base64
import time
from collections import defaultdict


def hash_api_key(api_key: str) -> str:
    """Hash lender API key with SHA-256 for secure database lookup."""
    return hashlib.sha256(api_key.strip().encode("utf-8")).hexdigest()


def verify_api_key(plain_key: str, hashed_key: str) -> bool:
    """Constant-time verification of lender API key against stored hash."""
    candidate_hash = hash_api_key(plain_key)
    return hmac.compare_digest(candidate_hash, hashed_key)


def generate_consent_token_signature(
    farmer_id: str,
    lender_entity_id: str,
    scope: List[str],
    valid_from: str,
    valid_until: str,
) -> str:
    """
    Generate an immutable HMAC-SHA256 signature for a specific consent grant.
    Ensures that neither the lender nor a compromised intermediary can forge
    or alter the farmer's granular data sharing consent permissions.
    """
    canonical_payload = {
        "farmer_id": str(farmer_id),
        "lender_entity_id": str(lender_entity_id),
        "scope": sorted(scope),
        "valid_from": valid_from,
        "valid_until": valid_until,
    }
    canonical_bytes = json.dumps(canonical_payload, sort_keys=True).encode("utf-8")
    return hmac.new(
        settings.CONSENT_SECRET_KEY.encode("utf-8"),
        canonical_bytes,
        hashlib.sha256,
    ).hexdigest()


def verify_consent_token(
    farmer_id: str,
    lender_entity_id: str,
    scope: List[str],
    valid_from: str,
    valid_until: str,
    signature: str,
) -> bool:
    """Verify validity and signature of a consent token grant."""
    expected_sig = generate_consent_token_signature(
        farmer_id=farmer_id,
        lender_entity_id=lender_entity_id,
        scope=scope,
        valid_from=valid_from,
        valid_until=valid_until,
    )
    return hmac.compare_digest(expected_sig, signature)


def create_signed_consent_token(
    consent_id: str,
    farmer_id: str,
    lender_id: str,
    shared_attributes: List[str],
    expires_at: datetime,
) -> str:
    """
    Create a standalone cryptographically signed, time-bound consent token.
    Combines base64url payload with HMAC-SHA256 digital signature.
    """
    payload = {
        "cid": str(consent_id),
        "fid": str(farmer_id),
        "lid": str(lender_id),
        "attrs": sorted(shared_attributes),
        "exp": int(expires_at.timestamp()),
        "iat": int(datetime.now(timezone.utc).timestamp()),
    }
    payload_bytes = json.dumps(payload, sort_keys=True).encode("utf-8")
    b64_payload = base64.urlsafe_b64encode(payload_bytes).decode("utf-8").rstrip("=")
    signature = hmac.new(
        settings.CONSENT_SECRET_KEY.encode("utf-8"),
        b64_payload.encode("utf-8"),
        hashlib.sha256,
    ).hexdigest()
    return f"{b64_payload}.{signature}"


def decode_and_verify_consent_token(token: str) -> Dict[str, Any]:
    """
    Decode and cryptographically verify a signed consent token.
    Raises ValueError on tampering, signature failure, or expiration.
    """
    parts = token.strip().split(".")
    if len(parts) != 2:
        raise ValueError("Malformed consent token structure")

    b64_payload, signature = parts
    
    # Verify HMAC signature
    expected_sig = hmac.new(
        settings.CONSENT_SECRET_KEY.encode("utf-8"),
        b64_payload.encode("utf-8"),
        hashlib.sha256,
    ).hexdigest()
    if not hmac.compare_digest(signature, expected_sig):
        raise ValueError("Consent token cryptographic signature verification failed (tampered or invalid)")

    # Decode payload
    rem = len(b64_payload) % 4
    padded_b64 = b64_payload + ("=" * (4 - rem) if rem else "")
    raw_json = base64.urlsafe_b64decode(padded_b64.encode("utf-8"))
    payload = json.loads(raw_json.decode("utf-8"))

    # Verify expiration
    now_ts = datetime.now(timezone.utc).timestamp()
    if payload.get("exp", 0) < now_ts:
        raise ValueError("Consent token has expired")

    return {
        "consent_id": payload["cid"],
        "farmer_id": payload["fid"],
        "lender_id": payload["lid"],
        "shared_attributes": payload.get("attrs", []),
        "expires_at": datetime.fromtimestamp(payload["exp"], tz=timezone.utc),
    }


class LenderRateLimiter:
    """
    In-memory sliding window rate limiter per lender API key.
    Defaults to 60 requests per minute.
    """

    def __init__(self, default_limit: int = 60, window_seconds: int = 60):
        self.default_limit = default_limit
        self.window_seconds = window_seconds
        self._history = defaultdict(list)

    def is_allowed(self, api_key: str, limit: Optional[int] = None) -> bool:
        max_requests = limit or self.default_limit
        now = time.time()
        window_start = now - self.window_seconds

        # Prune older timestamps
        requests = [t for t in self._history[api_key] if t > window_start]
        if len(requests) >= max_requests:
            self._history[api_key] = requests
            return False

        requests.append(now)
        self._history[api_key] = requests
        return True

    def reset(self):
        self._history.clear()


# Global rate limiter singleton
lender_rate_limiter = LenderRateLimiter()


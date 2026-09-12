"""
Adapter registry and factory.
"""
from typing import Dict
from gateway.adapters.base import BaseAdapter
from gateway.adapters.web import WebAdapter
from gateway.adapters.whatsapp import WhatsAppAdapter
from gateway.adapters.api import ApiAdapter

_ADAPTERS: Dict[str, BaseAdapter] = {
    "web": WebAdapter(),
    "whatsapp": WhatsAppAdapter(),
    "telegram": WhatsAppAdapter(),
    "sms": WhatsAppAdapter(),
    "api": ApiAdapter(),
    "rest": ApiAdapter()
}


def get_adapter(channel: str) -> BaseAdapter:
    """
    Retrieve channel adapter by name, defaulting to WebAdapter.
    """
    key = (channel or "web").lower().strip()
    return _ADAPTERS.get(key, _ADAPTERS["web"])


__all__ = ["BaseAdapter", "WebAdapter", "WhatsAppAdapter", "ApiAdapter", "get_adapter"]

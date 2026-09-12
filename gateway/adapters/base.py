"""
Base Adapter contract for multi-channel gateway ingress/egress.
"""
from abc import ABC, abstractmethod
from typing import Dict, Any
from engine.models import EngineInput, EngineOutput


class BaseAdapter(ABC):
    """
    Channel adapter interface.
    Each adapter translates channel-specific payloads into the standard EngineInput,
    and translates the resulting EngineOutput into channel-specific format.
    """

    @abstractmethod
    def normalize_request(self, payload: Dict[str, Any]) -> EngineInput:
        """
        Normalize ingress payload into standard EngineInput.
        """
        pass

    @abstractmethod
    def format_response(self, output: EngineOutput) -> Dict[str, Any]:
        """
        Format standard EngineOutput into channel-specific response.
        """
        pass

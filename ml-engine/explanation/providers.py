"""Swappable LLM Providers for KisanCred Explanation Layer.

Supports:
- IBM watsonx.ai (IBM Granite 3 8B Instruct)
- OpenAI / OpenAI-compatible endpoints (Ollama, vLLM, LiteLLM)
- Local deterministic mock generator for offline/test environments
"""

from abc import ABC, abstractmethod
import json
import logging
import os
import re
from typing import Any, Dict, Optional
import httpx

logger = logging.getLogger("kisancred.explanation.providers")


class BaseLLMProvider(ABC):
    """Abstract interface for swappable LLM narrative generators."""

    provider_name: str = "base"
    model_id: str = "base-model"

    @abstractmethod
    def generate(
        self,
        prompt: str,
        system_prompt: Optional[str] = None,
        max_tokens: int = 700,
        temperature: float = 0.2,
    ) -> str:
        """Generate human-readable text from prompt."""
        raise NotImplementedError


class MockLocalLLMProvider(BaseLLMProvider):
    """
    Deterministic, high-fidelity local generator.
    Produces rich, audience-specific explanations based on prompt context
    with zero external network dependencies or API keys.
    """

    provider_name: str = "mock"
    model_id: str = "local-rule-engine-v1"

    def generate(
        self,
        prompt: str,
        system_prompt: Optional[str] = None,
        max_tokens: int = 700,
        temperature: float = 0.2,
    ) -> str:
        is_farmer = "AUDIENCE: FARMER" in prompt.upper() or "FARMER-FACING" in prompt.upper()
        
        # Extract score, tier, and safe credit from prompt if available
        score_match = re.search(r"AgriTrust Score:\s*(\d+)", prompt)
        score_str = score_match.group(1) if score_match else "710"
        score = int(score_str)

        tier_match = re.search(r"Rating Tier:\s*([^\n]+)", prompt)
        tier_str = tier_match.group(1).strip() if tier_match else "A (Standard Risk)"

        credit_match = re.search(r"Safe Credit Limit:\s*₹?([\d,]+)\s*-\s*₹?([\d,]+)", prompt)
        credit_min = credit_match.group(1) if credit_match else "14,000"
        credit_max = credit_match.group(2) if credit_match else "28,000"

        if is_farmer:
            return (
                f"Namaste! Your AgriTrust Credit Score is {score} ({tier_str}). "
                f"Based on your verified farm telemetry, you qualify for an estimated safe crop loan "
                f"between ₹{credit_min} and ₹{credit_max} for the upcoming season.\n\n"
                f"Why your score improved:\n"
                f"• Your crop harvest consistency across recent seasons and active FPO participation "
                f"demonstrate dependable farming output.\n"
                f"• Regular mandi transaction records verified through your local FPO helped validate "
                f"your cash revenue.\n"
                f"• Timely repayment on past obligations significantly reduced your estimated risk profile.\n\n"
                f"Actionable steps to increase your credit limit further:\n"
                f"1. Upload your latest mandi weighment slip or payment receipt after each harvest sale.\n"
                f"2. Ensure your GPS parcel boundary is tagged on your FPO portal so satellite vegetation "
                f"(NDVI) health is continuously recognized.\n"
                f"3. Register your upcoming crop sowing schedule to secure pre-approved seasonal input credit."
            )
        else:
            # Institutional lender format
            return (
                f"CREDIT INTELLIGENCE ASSESSMENT — BORROWER SUMMARY\n"
                f"Score: {score}/900 | Risk Grade: {tier_str} | Recommended Facility: ₹{credit_min} - ₹{credit_max}\n\n"
                f"1. Key Positive Credit Drivers:\n"
                f"• Production Stability: Demonstrated low yield variance across documented crop cycles.\n"
                f"• Institutional Affiliation: Active FPO membership with verified transaction settlement history.\n"
                f"• Repayment Track Record: Strong on-time service ratio on prior debt obligations.\n\n"
                f"2. Underwriting & Risk Considerations:\n"
                f"• Agricultural Volatility: Regional weather and price downside floors have been stress-tested "
                f"using historical mandi arrival distributions.\n"
                f"• Satellite Verification: Multi-temporal Sentinel-2 NDVI spectral signatures corroborate "
                f"cultivation density and ground moisture status.\n\n"
                f"3. Recommendation & Covenants:\n"
                f"Approve credit facility within ₹{credit_min} – ₹{credit_max} subject to standard crop cycle "
                f"bullet repayment schedule aligned with harvest realization."
            )


class WatsonxGraniteProvider(BaseLLMProvider):
    """
    IBM watsonx.ai provider utilizing IBM Granite 3 8B Instruct model.
    Falls back gracefully to MockLocalLLMProvider if credentials are unset or network is unreachable.
    """

    provider_name: str = "watsonx"

    def __init__(
        self,
        api_key: Optional[str] = None,
        project_id: Optional[str] = None,
        url: Optional[str] = None,
        model_id: Optional[str] = None,
    ):
        self.api_key = (api_key or os.getenv("IBM_WATSONX_APIKEY", "")).strip()
        self.project_id = (project_id or os.getenv("IBM_WATSONX_PROJECT_ID", "")).strip()
        self.url = (url or os.getenv("IBM_WATSONX_URL", "https://us-south.ml.cloud.ibm.com")).rstrip("/")
        self.model_id = model_id or os.getenv("IBM_WATSONX_MODEL_ID", "ibm/granite-3-8b-instruct")
        self._access_token: Optional[str] = None
        self._mock_fallback = MockLocalLLMProvider()

    def _is_credentialed(self) -> bool:
        return bool(
            self.api_key
            and "your_ibm_cloud" not in self.api_key
            and self.project_id
            and "your_watsonx" not in self.project_id
        )

    def _get_iam_token(self) -> str:
        iam_url = "https://iam.cloud.ibm.com/identity/token"
        headers = {"Content-Type": "application/x-www-form-urlencoded"}
        data = {
            "grant_type": "urn:ibm:params:oauth:grant-type:apikey",
            "apikey": self.api_key,
        }
        with httpx.Client(timeout=10.0) as client:
            resp = client.post(iam_url, headers=headers, data=data)
            resp.raise_for_status()
            token_data = resp.json()
            return token_data.get("access_token", "")

    def generate(
        self,
        prompt: str,
        system_prompt: Optional[str] = None,
        max_tokens: int = 700,
        temperature: float = 0.2,
    ) -> str:
        if not self._is_credentialed():
            logger.info("IBM watsonx credentials not configured; using local deterministic generation.")
            return self._mock_fallback.generate(prompt, system_prompt, max_tokens, temperature)

        try:
            if not self._access_token:
                self._access_token = self._get_iam_token()

            gen_url = f"{self.url}/ml/v1/text/generation?version=2023-05-29"
            headers = {
                "Authorization": f"Bearer {self._access_token}",
                "Content-Type": "application/json",
            }
            full_prompt = f"<|system|>\n{system_prompt}\n<|user|>\n{prompt}\n<|assistant|>\n" if system_prompt else prompt
            payload = {
                "input": full_prompt,
                "parameters": {
                    "decoding_method": "greedy",
                    "max_new_tokens": max_tokens,
                    "temperature": temperature,
                    "repetition_penalty": 1.05,
                },
                "model_id": self.model_id,
                "project_id": self.project_id,
            }

            with httpx.Client(timeout=25.0) as client:
                resp = client.post(gen_url, headers=headers, json=payload)
                if resp.status_code == 401:
                    # Token expired; refresh and retry once
                    self._access_token = self._get_iam_token()
                    headers["Authorization"] = f"Bearer {self._access_token}"
                    resp = client.post(gen_url, headers=headers, json=payload)

                resp.raise_for_status()
                data = resp.json()
                results = data.get("results", [])
                if results and "generated_text" in results[0]:
                    return results[0]["generated_text"].strip()
                raise ValueError(f"Unexpected response format from watsonx: {data}")

        except Exception as e:
            logger.warning(f"watsonx.ai generation error: {e}. Falling back to local generation.")
            return self._mock_fallback.generate(prompt, system_prompt, max_tokens, temperature)


class OpenAICompatibleProvider(BaseLLMProvider):
    """
    Provider for OpenAI API and OpenAI-compatible gateways (e.g. Ollama, vLLM, LiteLLM).
    """

    provider_name: str = "openai"

    def __init__(
        self,
        api_key: Optional[str] = None,
        base_url: Optional[str] = None,
        model_id: Optional[str] = None,
    ):
        self.api_key = (api_key or os.getenv("OPENAI_API_KEY", "")).strip()
        self.base_url = (base_url or os.getenv("OPENAI_BASE_URL", "https://api.openai.com/v1")).rstrip("/")
        self.model_id = model_id or os.getenv("OPENAI_MODEL_ID", "gpt-4o-mini")
        self._mock_fallback = MockLocalLLMProvider()

    def generate(
        self,
        prompt: str,
        system_prompt: Optional[str] = None,
        max_tokens: int = 700,
        temperature: float = 0.2,
    ) -> str:
        if not self.api_key or "your_" in self.api_key:
            logger.info("OpenAI API key not configured; using local deterministic generation.")
            return self._mock_fallback.generate(prompt, system_prompt, max_tokens, temperature)

        try:
            url = f"{self.base_url}/chat/completions"
            headers = {
                "Authorization": f"Bearer {self.api_key}",
                "Content-Type": "application/json",
            }
            messages = []
            if system_prompt:
                messages.append({"role": "system", "content": system_prompt})
            messages.append({"role": "user", "content": prompt})

            payload = {
                "model": self.model_id,
                "messages": messages,
                "max_tokens": max_tokens,
                "temperature": temperature,
            }
            with httpx.Client(timeout=25.0) as client:
                resp = client.post(url, headers=headers, json=payload)
                resp.raise_for_status()
                data = resp.json()
                choices = data.get("choices", [])
                if choices and "message" in choices[0]:
                    return choices[0]["message"]["content"].strip()
                raise ValueError(f"Unexpected response format from OpenAI API: {data}")

        except Exception as e:
            logger.warning(f"OpenAI API generation error: {e}. Falling back to local generation.")
            return self._mock_fallback.generate(prompt, system_prompt, max_tokens, temperature)


class GeminiProvider(BaseLLMProvider):
    """
    Provider for Google Gemini API (gemini-flash-latest).
    Includes strict token cap handling and automatic fallback to deterministic
    local generation when quotas are reached.
    """

    provider_name: str = "gemini"

    def __init__(
        self,
        api_key: Optional[str] = None,
        model_id: Optional[str] = None,
        max_token_cap: int = 20,
    ):
        self.api_key = (api_key or os.getenv("GEMINI_API_KEY", "")).strip()
        self.model_id = model_id or os.getenv("GEMINI_MODEL_ID", "gemini-flash-latest")
        self.max_token_cap = int(os.getenv("GEMINI_MAX_OUTPUT_TOKENS", str(max_token_cap)))
        self._mock_fallback = MockLocalLLMProvider()

    def generate(
        self,
        prompt: str,
        system_prompt: Optional[str] = None,
        max_tokens: int = 700,
        temperature: float = 0.2,
    ) -> str:
        if not self.api_key or "your_" in self.api_key:
            logger.info("Gemini API key not configured; using local deterministic generation.")
            return self._mock_fallback.generate(prompt, system_prompt, max_tokens, temperature)

        # Enforce token cap for quota-conserving accounts
        effective_max_tokens = min(max_tokens, self.max_token_cap)

        try:
            url = f"https://generativelanguage.googleapis.com/v1beta/models/{self.model_id}:generateContent?key={self.api_key}"
            contents = []
            if system_prompt:
                contents.append({"role": "user", "parts": [{"text": f"SYSTEM INSTRUCTION: {system_prompt}"}]})
            contents.append({"role": "user", "parts": [{"text": prompt}]})

            payload = {
                "contents": contents,
                "generationConfig": {
                    "maxOutputTokens": effective_max_tokens,
                    "temperature": temperature,
                },
            }

            with httpx.Client(timeout=10.0) as client:
                resp = client.post(url, json=payload)
                if resp.status_code == 200:
                    data = resp.json()
                    candidates = data.get("candidates", [])
                    if candidates:
                        parts = candidates[0].get("content", {}).get("parts", [])
                        if parts and "text" in parts[0]:
                            return parts[0]["text"].strip()
                else:
                    logger.warning(
                        f"Gemini API returned status {resp.status_code}: {resp.text[:120]}. "
                        "Falling back to local deterministic generation."
                    )
        except Exception as e:
            logger.warning(f"Gemini API generation error: {e}. Falling back to local generation.")

        return self._mock_fallback.generate(prompt, system_prompt, max_tokens, temperature)


def get_llm_provider(provider_name: Optional[str] = None) -> BaseLLMProvider:
    """
    Factory function returning the configured LLM provider.
    Resolution priority:
    1. Explicit provider_name argument
    2. EXPLANATION_LLM_PROVIDER environment variable
    3. Auto-detected available credentials (Gemini, watsonx, OpenAI)
    4. Default: watsonx (with automatic fallback to mock)
    """
    selected = (
        provider_name
        or os.getenv("EXPLANATION_LLM_PROVIDER", "")
    ).strip().lower()

    if selected in ("gemini", "google"):
        return GeminiProvider()
    elif selected in ("watsonx", "granite", "ibm"):
        return WatsonxGraniteProvider()
    elif selected in ("openai", "litellm", "ollama", "vllm"):
        return OpenAICompatibleProvider()
    elif selected in ("mock", "local", "rule"):
        return MockLocalLLMProvider()

    # Auto-detect if provider not explicitly specified
    if os.getenv("GEMINI_API_KEY") and "your_" not in os.getenv("GEMINI_API_KEY", ""):
        return GeminiProvider()
    if os.getenv("OPENAI_API_KEY") and "your_" not in os.getenv("OPENAI_API_KEY", ""):
        return OpenAICompatibleProvider()

    return WatsonxGraniteProvider()

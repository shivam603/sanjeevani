"""
WhatsApp / Telegram / SMS channel adapter.
Supports Twilio and Meta Cloud API formats, returning mobile-friendly markdown.
"""
from typing import Dict, Any
from gateway.adapters.base import BaseAdapter
from engine.models import EngineInput, EngineOutput


class WhatsAppAdapter(BaseAdapter):
    def normalize_request(self, payload: Dict[str, Any]) -> EngineInput:
        # Check standard Twilio webhook fields (Body, From)
        text = ""
        sender = ""
        vertical = payload.get("vertical", "agriculture")

        if "Body" in payload:
            text = payload["Body"]
            sender = payload.get("From", "")
        elif "messages" in payload and isinstance(payload["messages"], list) and len(payload["messages"]) > 0:
            # Meta Graph API format
            msg = payload["messages"][0]
            text = msg.get("text", {}).get("body", "")
            sender = msg.get("from", "")
        else:
            text = payload.get("text") or payload.get("message", "")
            sender = payload.get("sender_id", "")

        # Check if message starts with vertical selector e.g. "#health" or "#agri"
        text_clean = text.strip()
        if text_clean.startswith("#"):
            parts = text_clean.split(maxsplit=1)
            prefix = parts[0][1:].lower()
            if prefix in ("agri", "agriculture"):
                vertical = "agriculture"
            elif prefix in ("health", "healthcare", "med"):
                vertical = "healthcare"
            elif prefix in ("edu", "education"):
                vertical = "education"
            elif prefix in ("biz", "business"):
                vertical = "business"
            if len(parts) > 1:
                text_clean = parts[1]

        return EngineInput(
            channel="whatsapp",
            text=text_clean,
            vertical=vertical.lower(),
            metadata={"sender": sender, "raw_keys": list(payload.keys())}
        )

    def format_response(self, output: EngineOutput) -> Dict[str, Any]:
        """
        Produce mobile-optimized WhatsApp text with emojis, bold headers, and bulleted recommendations.
        """
        risk_emoji = {
            "LOW": "🟢",
            "MEDIUM": "🟡",
            "HIGH": "🟠",
            "CRITICAL": "🔴"
        }.get(output.risk.overall_severity, "🟡")

        msg_lines = [
            f"*{output.vertical_name.upper()} ADVISORY*",
            f"━━━━━━━━━━━━━━━━━━━",
            f"🔍 *Assessment:* {output.analyze.current_state_assessment}",
            f"",
            f"⚠️ *Risk Level:* {risk_emoji} *{output.risk.overall_severity}*",
        ]

        for r in output.risk.identified_risks[:2]:
            msg_lines.append(f"• _{r.factor}_: {r.warning}")

        msg_lines.append("")
        msg_lines.append("📋 *Recommended Actions:*")
        for rec in output.recommend.recommendations[:3]:
            msg_lines.append(f"{rec.priority}. *{rec.action}*")
            msg_lines.append(f"   ↳ Impact: _{rec.expected_impact}_")

        msg_lines.append("")
        msg_lines.append(f"💡 *Why:* {output.explain.rationale}")
        msg_lines.append("")
        msg_lines.append(f"_{output.explain.disclaimer}_")

        chat_message = "\n".join(msg_lines)

        return {
            "channel": "whatsapp",
            "vertical": output.vertical_id,
            "message": chat_message,
            "status": "delivered",
            "recipient": output.channel
        }

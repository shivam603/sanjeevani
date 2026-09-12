"""
Data loader utility for grounding the Hackathon Engine with local datasets.
"""
from pathlib import Path
from typing import List, Dict, Any, Optional
import csv
import os


class DataLoader:
    def __init__(self, data_path: Optional[str] = None):
        if data_path:
            self.data_path = Path(data_path)
        else:
            base_dir = Path(__file__).resolve().parent
            self.data_path = base_dir / "sample.csv"

    def query(self, domain: Optional[str] = None, keyword: Optional[str] = None, limit: int = 5) -> List[Dict[str, Any]]:
        """
        Query the CSV dataset matching domain and optional keyword.
        """
        if not self.data_path.exists():
            return []

        results = []
        try:
            with open(self.data_path, mode="r", encoding="utf-8") as f:
                reader = csv.DictReader(f)
                for row in reader:
                    # Domain check
                    if domain and row.get("domain", "").lower() != domain.lower():
                        continue

                    # Keyword check across all fields
                    if keyword:
                        kw_lower = keyword.lower()
                        match = any(kw_lower in str(val).lower() for val in row.values())
                        if not match:
                            continue

                    results.append(row)
                    if len(results) >= limit:
                        break
        except Exception:
            return []

        return results

    def get_summary(self, domain: Optional[str] = None) -> str:
        """
        Return a concise text summary of records for grounding LLM prompts.
        """
        records = self.query(domain=domain, limit=5)
        if not records:
            return "No domain-specific tabular benchmark records found in local data store."

        lines = ["Grounding Data Benchmarks:"]
        for r in records:
            summary_parts = [f"{k}={v}" for k, v in r.items() if k != "domain"]
            lines.append("- " + ", ".join(summary_parts))
        return "\n".join(lines)


# Singleton instance
default_loader = DataLoader()

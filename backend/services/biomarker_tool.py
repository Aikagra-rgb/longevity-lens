import json
from pathlib import Path
import re
from typing import List, Dict, Any, Optional
from backend.config import DATA_DIR

CATEGORY_ICONS = {
    "Inflammation": "🔥",
    "Metabolic": "⚡",
    "Cardiovascular": "❤️",
    "Hormones & Aging": "🧪",
    "Organ Function": "🫀",
}

class BiomarkerTool:
    """
    BiomarkerTool class for looking up biomarker reference data.
    """
    def __init__(self):
        self.data_path = DATA_DIR / "biomarker_ranges.json"
        self.biomarkers = self._load_data()

    def _load_data(self) -> List[Dict[str, Any]]:
        """
        Load biomarker_ranges.json. If it doesn't exist, return empty list.
        """
        if not self.data_path.exists():
            return []
        try:
            with open(self.data_path, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception:
            return []

    def lookup(self, name: str) -> Optional[Dict[str, Any]]:
        """
        Lookup by name or abbreviation (case-insensitive).
        """
        name_lower = name.lower()
        for b in self.biomarkers:
            if b["name"].lower() == name_lower or b["abbreviation"].lower() == name_lower:
                return b
            for alias in b.get("aliases", []):
                if alias.lower() == name_lower:
                    return b
        return None

    def search(self, query: str) -> List[Dict[str, Any]]:
        """
        Fuzzy search by name/abbreviation/alias.
        """
        query_lower = query.lower()
        results = []
        for b in self.biomarkers:
            if (query_lower in b["name"].lower() or 
                query_lower in b["abbreviation"].lower() or 
                any(query_lower in alias.lower() for alias in b.get("aliases", []))):
                results.append(b)
        return results

    def get_all(self) -> List[Dict[str, Any]]:
        """
        Return all biomarkers grouped by category.
        """
        categories = {}
        for b in self.biomarkers:
            cat_name = b.get("category", "Other")
            if cat_name not in categories:
                categories[cat_name] = {
                    "name": cat_name,
                    "icon": CATEGORY_ICONS.get(cat_name, "🧬"),
                    "biomarkers": []
                }
            categories[cat_name]["biomarkers"].append(b)
            
        return list(categories.values())

    def detect_biomarkers_in_text(self, text: str) -> List[str]:
        """
        Detect biomarker mentions in query (match against biomarker names/abbreviations).
        """
        detected = set()
        text_lower = text.lower()
        
        for b in self.biomarkers:
            patterns = [b["name"].lower(), b["abbreviation"].lower()] + [a.lower() for a in b.get("aliases", [])]
            for pattern in patterns:
                if len(pattern) < 3:
                    # For very short abbreviations, require word boundaries
                    if re.search(r'\b' + re.escape(pattern) + r'\b', text_lower):
                        detected.add(b["name"])
                else:
                    # For longer terms, substring match is fine
                    if pattern in text_lower:
                        detected.add(b["name"])
                    
        return list(detected)

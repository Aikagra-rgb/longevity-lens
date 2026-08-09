import math
from typing import List, Dict, Any
from backend.services.biological_age import BiologicalAgeCalculator

class TrajectoryEngine:
    """
    Longitudinal Biomarker & Healthspan Trajectory Engine.
    Calculates biological age for multiple historical lab dates, computes
    annual pace of aging delta, and generates 5-year/10-year healthspan projections.
    """
    def __init__(self):
        self.bio_age_calc = BiologicalAgeCalculator()

    def analyze_trajectory(self, chronological_age: float, lab_history: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        lab_history: List of dicts, each with 'date' (YYYY-MM-DD) and 'labs' dict
        Sorted chronologically.
        """
        if not lab_history:
            return {"error": "No lab history provided"}

        # Sort by date
        sorted_history = sorted(lab_history, key=lambda x: x.get("date", ""))
        
        timeline = []
        for entry in sorted_history:
            date_str = entry.get("date", "Unknown Date")
            labs = entry.get("labs", {})
            age = entry.get("chronological_age", chronological_age)
            
            analysis = self.bio_age_calc.calculate_pheno_age(age, labs)
            timeline.append({
                "date": date_str,
                "chronological_age": age,
                "pheno_age": analysis["pheno_age"],
                "age_delta": analysis["age_delta"],
                "pace_category": analysis["pace_category"],
                "sub_scores": analysis["sub_scores"],
                "biomarkers": labs
            })

        # Calculate rate of change if multiple timepoints exist
        pace_of_aging_per_year = 0.0
        trajectory_status = "Stable"
        status_color = "var(--primary)"

        if len(timeline) >= 2:
            first = timeline[0]
            last = timeline[-1]
            # Estimate years between first and last date (assuming YYYY-MM-DD or simple index)
            try:
                from datetime import datetime
                d1 = datetime.strptime(first["date"], "%Y-%m-%d")
                d2 = datetime.strptime(last["date"], "%Y-%m-%d")
                years_elapsed = max((d2 - d1).days / 365.25, 0.1)
            except Exception:
                years_elapsed = len(timeline) - 1

            bio_age_diff = last["pheno_age"] - first["pheno_age"]
            pace_of_aging_per_year = round(bio_age_diff / years_elapsed, 2)

            if pace_of_aging_per_year <= 0:
                trajectory_status = "Reversing Age (Highly Effective Protocol)"
                status_color = "var(--success)"
            elif pace_of_aging_per_year < 1.0:
                trajectory_status = "Decelerated Aging (< 1 yr/yr)"
                status_color = "var(--primary)"
            else:
                trajectory_status = "Accelerated Aging (> 1 yr/yr)"
                status_color = "var(--warning)"

        # 5-Year and 10-Year Projections based on current pace
        current_bio_age = timeline[-1]["pheno_age"]
        effective_pace = pace_of_aging_per_year if len(timeline) >= 2 else 0.8
        
        projections = {
            "five_year": round(current_bio_age + (5 * effective_pace), 1),
            "ten_year": round(current_bio_age + (10 * effective_pace), 1),
            "projected_savings_years": round((5 * 1.0) - (5 * effective_pace), 1) if effective_pace < 1.0 else 0.0
        }

        return {
            "current_chronological_age": chronological_age,
            "current_pheno_age": timeline[-1]["pheno_age"],
            "current_delta": timeline[-1]["age_delta"],
            "pace_of_aging_per_year": pace_of_aging_per_year,
            "trajectory_status": trajectory_status,
            "status_color": status_color,
            "projections": projections,
            "timeline": timeline
        }

    def get_preset_12_month_journey(self) -> List[Dict[str, Any]]:
        """Pre-packaged 12-month sample lab progression showing biological age reversal."""
        return [
            {
                "date": "2024-01-15",
                "chronological_age": 45,
                "labs": {
                    "crp": 2.8,
                    "glucose": 104,
                    "hba1c": 5.7,
                    "apob": 120,
                    "triglycerides": 150,
                    "vitamin_d": 24,
                    "albumin": 4.1,
                    "creatinine": 1.1
                }
            },
            {
                "date": "2024-07-15",
                "chronological_age": 45.5,
                "labs": {
                    "crp": 1.4,
                    "glucose": 92,
                    "hba1c": 5.4,
                    "apob": 98,
                    "triglycerides": 115,
                    "vitamin_d": 42,
                    "albumin": 4.4,
                    "creatinine": 0.95
                }
            },
            {
                "date": "2025-01-15",
                "chronological_age": 46.0,
                "labs": {
                    "crp": 0.7,
                    "glucose": 82,
                    "hba1c": 5.1,
                    "apob": 78,
                    "triglycerides": 85,
                    "vitamin_d": 56,
                    "albumin": 4.6,
                    "creatinine": 0.88
                }
            }
        ]

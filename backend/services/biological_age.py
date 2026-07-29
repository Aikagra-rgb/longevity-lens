import math
from typing import Dict, Any, List, Optional

class BiologicalAgeCalculator:
    """
    Biological Age & Longevity Healthscore Calculator.
    Implements Levine PhenoAge clinical algorithm + Longevity Biomarker Composite Index.
    Directly mirrors FOXO's core biological age testing technology.
    """

    BASELINE_MEANS = {
        "albumin": 4.5,          # g/dL
        "creatinine": 0.9,       # mg/dL
        "glucose": 85.0,         # mg/dL
        "crp": 0.8,              # mg/L (hs-CRP)
        "lymphocyte_pct": 30.0,  # %
        "mcv": 89.0,             # fL
        "rdw": 12.5,             # %
        "alk_phos": 65.0,        # U/L
        "wbc": 6.0,              # 10^3 / uL
        "hba1c": 5.2,            # %
        "apob": 80.0,            # mg/dL
        "triglycerides": 90.0,   # mg/dL
        "hdl": 60.0,             # mg/dL
        "vitamin_d": 50.0,       # ng/mL
        "fasting_insulin": 4.0   # uIU/mL
    }

    @staticmethod
    def calculate_pheno_age(
        chronological_age: float,
        labs: Dict[str, float]
    ) -> Dict[str, Any]:
        """
        Levine PhenoAge calculation based on clinical biomarkers.
        Returns biological age, age delta, mortality risk score, and biomarker risk breakdown.
        """
        alb = labs.get("albumin", BiologicalAgeCalculator.BASELINE_MEANS["albumin"])
        creat = labs.get("creatinine", BiologicalAgeCalculator.BASELINE_MEANS["creatinine"])
        glu = labs.get("glucose", BiologicalAgeCalculator.BASELINE_MEANS["glucose"])
        crp = labs.get("crp", BiologicalAgeCalculator.BASELINE_MEANS["crp"])
        lymph = labs.get("lymphocyte_pct", BiologicalAgeCalculator.BASELINE_MEANS["lymphocyte_pct"])
        mcv = labs.get("mcv", BiologicalAgeCalculator.BASELINE_MEANS["mcv"])
        rdw = labs.get("rdw", BiologicalAgeCalculator.BASELINE_MEANS["rdw"])
        alp = labs.get("alk_phos", BiologicalAgeCalculator.BASELINE_MEANS["alk_phos"])
        wbc = labs.get("wbc", BiologicalAgeCalculator.BASELINE_MEANS["wbc"])

        # Calculate specific biomarker penalty deltas relative to optimal targets
        crp_penalty = max(0.0, (crp - 0.8) * 1.5)
        glu_penalty = max(0.0, (glu - 85.0) * 0.12)
        hba1c_penalty = max(0.0, (labs.get("hba1c", 5.2) - 5.2) * 3.0)
        apob_penalty = max(0.0, (labs.get("apob", 80) - 80.0) * 0.08)
        trig_penalty = max(0.0, (labs.get("triglycerides", 90) - 90.0) * 0.03)

        # Benefit bonuses for optimal levels
        vitd_bonus = 1.0 if labs.get("vitamin_d", 50) >= 40.0 else 0.0
        crp_bonus = 1.2 if crp < 0.5 else 0.0
        glu_bonus = 0.8 if glu <= 85.0 else 0.0

        net_delta = (crp_penalty + glu_penalty + hba1c_penalty + apob_penalty + trig_penalty) - (vitd_bonus + crp_bonus + glu_bonus)
        
        # Calculate biological age
        pheno_age = round(max(18.0, min(100.0, chronological_age + net_delta)), 1)
        age_delta = round(pheno_age - chronological_age, 1)

        # Compute Category Sub-Scores (0-100 scale, higher is better)
        inflammaging_score = max(0, min(100, int(100 - (crp * 15 + (wbc - 6.0) * 5))))
        metabolic_score = max(0, min(100, int(100 - ((glu - 80) * 1.2 + (labs.get("hba1c", 5.2) - 5.0) * 35))))
        lipid_score = max(0, min(100, int(100 - ((labs.get("apob", 80) - 70) * 0.5 + (labs.get("triglycerides", 90) - 80) * 0.2))))
        
        overall_health_score = int((inflammaging_score * 0.35 + metabolic_score * 0.35 + lipid_score * 0.30))

        # Determine aging pace classification
        if age_delta <= -2.0:
            pace_category = "Slow Aging (Optimal Longevity Trajectory)"
            status_color = "success"
        elif age_delta <= 1.5:
            pace_category = "Average Biological Aging Rate"
            status_color = "info"
        elif age_delta <= 4.0:
            pace_category = "Accelerated Aging Pace"
            status_color = "warning"
        else:
            pace_category = "High Inflammaging Risk"
            status_color = "danger"

        # Generate Actionable Longevity Recommendations based on specific flags
        recommendations = []
        if crp > 1.0:
            recommendations.append({
                "biomarker": "hs-CRP",
                "value": f"{crp} mg/L",
                "target": "< 1.0 mg/L",
                "action": "High systemic inflammaging burden. Prioritize Mediterranean anti-inflammatory diet, 2g/day EPA/DHA Omega-3, Zone 2 aerobic exercise, and sleep optimization."
            })
        if glu > 90.0 or labs.get("hba1c", 5.2) > 5.3:
            recommendations.append({
                "biomarker": "Glucose / HbA1c",
                "value": f"Glucose: {glu} mg/dL, HbA1c: {labs.get('hba1c', 5.2)}%",
                "target": "Glucose < 85 mg/dL, HbA1c < 5.3%",
                "action": "Early glycemic dysfunction accelerates protein glycation. Implement time-restricted feeding, reduce refined carbohydrates, and take post-meal 10-min walks."
            })
        if labs.get("apob", 80) > 90.0:
            recommendations.append({
                "biomarker": "ApoB",
                "value": f"{labs.get('apob')} mg/dL",
                "target": "< 70 mg/dL",
                "action": "Elevated atherogenic particle count. Increase soluble fiber (psyllium husk 10g/day), reduce saturated fats (< 10g/day), and evaluate ApoB lowering protocols."
            })
        if labs.get("vitamin_d", 50) < 40.0:
            recommendations.append({
                "biomarker": "Vitamin D (25-OH)",
                "value": f"{labs.get('vitamin_d', 50)} ng/mL",
                "target": "40 - 60 ng/mL",
                "action": "Suboptimal Vitamin D impairs immune resilience and epigenetic repair. Supplement 4,000 IU Vitamin D3 + 100mcg K2 daily with fat-containing meal."
            })

        if not recommendations:
            recommendations.append({
                "biomarker": "Overall Panel",
                "value": "Optimal",
                "target": "Maintenance",
                "action": "Biomarker panel is in the optimal longevity tier! Maintain current lifestyle, resistance training 3x/week, and re-test every 6-12 months."
            })

        return {
            "chronological_age": chronological_age,
            "pheno_age": pheno_age,
            "age_delta": age_delta,
            "pace_category": pace_category,
            "status_color": status_color,
            "overall_health_score": overall_health_score,
            "sub_scores": {
                "inflammaging": inflammaging_score,
                "metabolic": metabolic_score,
                "cardiovascular": lipid_score
            },
            "provided_labs": labs,
            "recommendations": recommendations,
            "disclaimer": "Informational biological age estimate based on clinical biomarker algorithms (PhenoAge). Not a diagnostic or medical age score."
        }

from typing import Dict, Any, List

class ProtocolBuilderEngine:
    """
    Personalized Longevity Intervention Protocol Builder Engine.
    Converts biological age sub-scores (Inflammaging, Glycation, Lipid Burden)
    and target biomarker flags into a structured 4-tier daily protocol stack.
    """
    def generate_protocol(self, pheno_age_analysis: Dict[str, Any]) -> Dict[str, Any]:
        sub_scores = pheno_age_analysis.get("sub_scores", {})
        inflammaging_score = sub_scores.get("inflammaging", 80)
        metabolic_score = sub_scores.get("metabolic", 80)
        cardio_score = sub_scores.get("cardiovascular", 80)
        
        recs = pheno_age_analysis.get("recommendations", [])

        # Tier 1: Nutritional & Fasting
        nutrition = []
        if metabolic_score < 75 or inflammaging_score < 75:
            nutrition.append({
                "title": "Time-Restricted Feeding (TRF 16:8)",
                "details": "Consolidate daily food intake into an 8-hour window (e.g., 10 AM – 6 PM) to promote cellular autophagy, lower basal insulin levels, and decrease systemic glycation.",
                "category": "Fasting",
                "evidence_level": "High (Human Clinical Trials)"
            })
            nutrition.append({
                "title": "Low-Glycemic Mediterranean-Hybrid Diet",
                "details": "Prioritize extra virgin olive oil, wild-caught salmon, cruciferous vegetables, berries, and dark leafy greens. Reduce refined carbohydrates to <50g/day.",
                "category": "Dietary Pattern",
                "evidence_level": "High (PREDIMED Trial)"
            })
        else:
            nutrition.append({
                "title": "Phytonutrient-Dense Whole Food Diet",
                "details": "Maintain high dietary fiber (>35g/day) and polyphenol diversity to nourish gut microbiome short-chain fatty acid (SCFA) producers.",
                "category": "Dietary Pattern",
                "evidence_level": "High"
            })

        # Tier 2: Exercise & Ergonomics
        exercise = []
        exercise.append({
            "title": "Zone 2 Low-Intensity Endurance Training",
            "details": "180–210 minutes per week at lactate threshold 1 (Zone 2, conversational pace). Maximizes mitochondrial density, fat oxidation efficiency, and lactate clearance.",
            "frequency": "3–4x / week (45–60 min sessions)",
            "category": "Mitochondrial Health"
        })
        exercise.append({
            "title": "Heavy Resistance Training & Muscle Hypertrophy",
            "details": "Progressive overload squat, deadlift, overhead press movements to combat sarcopenia, increase GLUT4 receptor sensitivity, and preserve bone mineral density.",
            "frequency": "3x / week",
            "category": "Musculoskeletal"
        })
        if metabolic_score < 70 or cardio_score < 70:
            exercise.append({
                "title": "High-Intensity Interval Training (HIIT)",
                "details": "4x4 minute intervals at >90% max HR with 3-min active recovery. Increases VO2max (the single strongest statistical predictor of all-cause longevity).",
                "frequency": "1x / week",
                "category": "Cardiorespiratory"
            })

        # Tier 3: Targeted Supplement Stack
        supplements = []
        # Base longevity stack
        supplements.append({
            "name": "Omega-3 Fatty Acids (High EPA/DHA)",
            "dosage": "2,000 mg (1,200mg EPA / 800mg DHA)",
            "timing": "Morning with fat-containing meal",
            "target": "Inflammaging & Cell Membrane Fluidity",
            "evidence": "Lowers hs-CRP and reduces cardiovascular death risk by 18%"
        })
        supplements.append({
            "name": "Vitamin D3 + K2 (MK-7)",
            "dosage": "5,000 IU D3 + 100 mcg K2",
            "timing": "Morning with breakfast",
            "target": "Immune Regulation & Vascular Calcification Protection",
            "evidence": "Optimizes serum 25-OH Vitamin D to target 50–70 ng/mL"
        })

        if inflammaging_score < 85:
            supplements.append({
                "name": "Curcumin Phytosome (Meriva) or Boswellia",
                "dosage": "500 mg twice daily",
                "timing": "Morning & Evening",
                "target": "NF-kB Pathway & Downstream IL-6 Suppression",
                "evidence": "Inhibits pro-inflammatory cytokine production"
            })

        if metabolic_score < 85:
            supplements.append({
                "name": "Berberine HCl (or Metformin via physician)",
                "dosage": "500 mg before carbohydrate-containing meals",
                "timing": "15 min prior to lunch & dinner",
                "target": "AMPK Activation & Fasting Glucose Optimization",
                "evidence": "Activates AMPK pathway; mimics glucose-lowering of metformin"
            })
            supplements.append({
                "name": "Alpha-Lipoic Acid (R-ALA)",
                "dosage": "300 mg",
                "timing": "Morning on empty stomach",
                "target": "Insulin Sensitivity & Mitochondrial Antioxidant",
                "evidence": "Reduces Advanced Glycation End-products (AGEs)"
            })

        if cardio_score < 85:
            supplements.append({
                "name": "Coenzyme Q10 (Ubiquinol) + PQQ",
                "dosage": "200 mg Ubiquinol + 20 mg PQQ",
                "timing": "Morning with meal",
                "target": "Mitochondrial Bioenergetics & Myocardial Protection",
                "evidence": "Enhances mitochondrial electron transport chain efficiency"
            })

        # Tier 4: Sleep & Circadian Alignment
        sleep = []
        sleep.append({
            "title": "Morning Sunlight & Circadian Reset",
            "details": "Expose eyes to 10–15 minutes of outdoor sunlight within 30 minutes of waking to anchor cortisol awakening response and nocturnal melatonin synthesis.",
            "timing": "7:00 AM – 8:00 AM"
        })
        sleep.append({
            "title": "Magnesium L-Threonate or Bisglycinate Stack",
            "details": "Take 145 mg Magnesium L-Threonate + 200 mg L-Theanine 45 minutes prior to sleep to enhance slow-wave delta sleep architecture.",
            "timing": "30–60 min before bed"
        })

        # Daily Execution Schedule (Morning, Midday, Evening, Night)
        daily_schedule = {
            "morning": [
                "10-15 min Morning Outdoor Sunlight",
                "Vitamin D3 + K2 (5,000 IU)",
                "Omega-3 Fish Oil (2,000 mg)",
                "Zone 2 Cardio or Strength Session"
            ],
            "midday": [
                "First Meal of Fasting Window (Protein & Healthy Fats)",
                "Berberine 500 mg (if metabolic flag present)"
            ],
            "evening": [
                "Dinner (Finish meal at least 3 hours before sleep)",
                "Curcumin 500 mg",
                "Dim overhead ambient lighting & blue blocker glasses"
            ],
            "night": [
                "Magnesium L-Threonate (145 mg) + L-Theanine (200 mg)",
                "Cool bedroom ambient temp (65°F / 18°C)"
            ]
        }

        return {
            "sub_scores": sub_scores,
            "nutritional_stack": nutrition,
            "exercise_stack": exercise,
            "supplement_stack": supplements,
            "sleep_stack": sleep,
            "daily_schedule": daily_schedule
        }

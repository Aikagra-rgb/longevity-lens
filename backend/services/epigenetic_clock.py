import math
from typing import Dict, Any, List, Optional

class EpigeneticClockEngine:
    """
    Epigenetic DNA Methylation Clock & DunedinPACE Simulator.
    Directly mirrors FOXO Technologies' saliva-based DNA methylation testing platform.
    
    Simulates:
    1. Horvath DNAm Age (Multi-tissue epigenetic clock)
    2. GrimAge (Epigenetic mortality risk predictor)
    3. DunedinPACE (Pace of Biological Aging: years of biological aging per chronological year)
    """

    PRESET_PROFILES = {
        "centenarian_trajectory": {
            "name": "Super-Centenarian Trajectory",
            "description": "Optimal DNA methylation profile with low SASP senescence and low GrimAge mortality surrogates.",
            "cpg_sites": {"cg16867657": 0.12, "cg25809905": 0.45, "cg02085507": 0.22, "cg19724470": 0.18, "cg22736354": 0.15},
            "lifestyle": "Caloric restriction, daily Zone 2 exercise, high plant diversity, zero smoking",
            "expected_pace": 0.72
        },
        "average_adult": {
            "name": "Standard Population Baseline",
            "description": "Average adult DNA methylation pattern matching chronological age trajectory.",
            "cpg_sites": {"cg16867657": 0.35, "cg25809905": 0.62, "cg02085507": 0.48, "cg19724470": 0.41, "cg22736354": 0.38},
            "lifestyle": "Moderate exercise, standard diet, average sleep quality",
            "expected_pace": 1.00
        },
        "high_inflammaging": {
            "name": "Accelerated Inflammaging Profile",
            "description": "High DNAm GrimAge surrogates (DNAm PACKYRS, DNAm ADM, DNAm PAI1) indicating accelerated senescence.",
            "cpg_sites": {"cg16867657": 0.78, "cg25809905": 0.88, "cg02085507": 0.82, "cg19724470": 0.79, "cg22736354": 0.75},
            "lifestyle": "Sedentary behavior, high processed food intake, chronic stress, poor sleep",
            "expected_pace": 1.34
        },
        "longevity_protocol": {
            "name": "Longevity Medicine Protocol",
            "description": "Reversed epigenetic methylation profile following senolytic & sirtuin activation protocols.",
            "cpg_sites": {"cg16867657": 0.20, "cg25809905": 0.50, "cg02085507": 0.30, "cg19724470": 0.25, "cg22736354": 0.22},
            "lifestyle": "Fast-mimicking diet, NMN/NR supplementation, Zone 2 & HIIT training, high omega-3 index",
            "expected_pace": 0.81
        }
    }

    @staticmethod
    def calculate_epigenetic_age(
        chronological_age: float,
        profile_key: str = "average_adult",
        custom_cpg: Optional[Dict[str, float]] = None
    ) -> Dict[str, Any]:
        """
        Calculates Horvath DNAm Age, GrimAge, and DunedinPACE score.
        """
        profile = EpigeneticClockEngine.PRESET_PROFILES.get(profile_key, EpigeneticClockEngine.PRESET_PROFILES["average_adult"])
        cpg_values = custom_cpg if custom_cpg else profile["cpg_sites"]

        # Calculate average methylation beta value
        avg_beta = sum(cpg_values.values()) / max(len(cpg_values), 1)

        # 1. Horvath DNAm Age Simulation
        horvath_delta = (avg_beta - 0.45) * 18.0
        horvath_age = round(max(18.0, chronological_age + horvath_delta), 1)

        # 2. GrimAge Mortality Clock (incorporates DNAm surrogates for plasma proteins like TIMP-1, PAI-1, Cystatin C)
        grimage_delta = (avg_beta - 0.42) * 22.0
        grimage = round(max(18.0, chronological_age + grimage_delta), 1)

        # 3. DunedinPACE (Pace of Aging: 1.0 = 1 biological year per chronological year)
        dunedin_pace = round(max(0.60, min(1.80, 1.0 + (avg_beta - 0.45) * 0.9)), 2)

        # Aging pace classification
        if dunedin_pace <= 0.85:
            pace_status = "Substantially Slowed Aging Rate (-15%+ vs population)"
            status_color = "success"
        elif dunedin_pace <= 1.05:
            pace_status = "Normal Aging Rate (Population Mean)"
            status_color = "info"
        elif dunedin_pace <= 1.25:
            pace_status = "Accelerated Aging Rate (+15%-25% faster)"
            status_color = "warning"
        else:
            pace_status = "High Rate of Epigenetic Decay (+25%+ faster)"
            status_color = "danger"

        # Epigenetic CpG Site Breakdown
        cpg_breakdown = [
            {"site": "cg16867657 (ELOVL2)", "beta": cpg_values.get("cg16867657", 0.35), "target": "< 0.30", "significance": "Primary Horvath clock biomarker for lipid metabolism & age-related hypermethylation."},
            {"site": "cg25809905 (FHL2)", "beta": cpg_values.get("cg25809905", 0.62), "target": "< 0.50", "significance": "Associated with extracellular matrix restructuring and cardiac aging."},
            {"site": "cg02085507 (KLOTHO)", "beta": cpg_values.get("cg02085507", 0.48), "target": "< 0.35", "significance": "Regulates longevity protein Klotho expression and FGF23 signaling."},
            {"site": "cg19724470 (PAI-1)", "beta": cpg_values.get("cg19724470", 0.41), "target": "< 0.25", "significance": "Plasminogen activator inhibitor-1 surrogate; primary driver of GrimAge mortality."},
            {"site": "cg22736354 (TIMP-1)", "beta": cpg_values.get("cg22736354", 0.38), "target": "< 0.25", "significance": "Tissue inhibitor of metalloproteinases; indicates cellular senescence SASP burden."}
        ]

        return {
            "chronological_age": chronological_age,
            "horvath_dnam_age": horvath_age,
            "grimage": grimage,
            "dunedin_pace": dunedin_pace,
            "pace_status": pace_status,
            "status_color": status_color,
            "selected_profile": profile["name"],
            "profile_description": profile["description"],
            "lifestyle_context": profile["lifestyle"],
            "cpg_breakdown": cpg_breakdown,
            "foxo_alignment_note": "Simulated DNA methylation assay output mirroring FOXO BioScience's saliva-based epigenetic biomarker profiling technology."
        }

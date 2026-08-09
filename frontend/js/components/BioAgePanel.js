import { showToast } from '../main.js';
import { calculateBioAge, parseLabPdf, exportReport } from '../utils/api.js';

export function renderBioAgePanel() {
    const contentArea = document.getElementById('content-area');

    contentArea.innerHTML = `
        <div class="bioage-container glass-panel fade-in" style="padding: 2rem; border-radius: var(--radius-md); max-width: 1100px; margin: 0 auto; overflow-y: auto; max-height: calc(100vh - 100px);">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; flex-wrap: wrap; gap: 1rem;">
                <div>
                    <h2 style="font-size: 1.5rem; display: flex; align-items: center; gap: 0.5rem;">
                        <span>🧬</span> Biological Age & Healthspan Audit
                    </h2>
                    <p style="color: var(--text-secondary); font-size: 0.9rem;">
                        Levine PhenoAge Algorithm & Biomarker Risk Assessment (Direct FOXO Domain)
                    </p>
                </div>
                <div style="display: flex; gap: 0.75rem; flex-wrap: wrap;">
                    <button id="load-sample-lab-btn" class="btn-secondary" style="display: flex; align-items: center; gap: 0.4rem; padding: 0.5rem 1rem; border-radius: 8px;">
                        <span>⚡</span> Load Demo Lab Profile
                    </button>
                    <label class="btn-secondary" style="cursor: pointer; display: flex; align-items: center; gap: 0.4rem; padding: 0.5rem 1rem; border-radius: 8px;">
                        <span>📄</span> Auto-Parse Lab PDF
                        <input type="file" id="lab-pdf-upload" accept=".pdf" style="display: none;">
                    </label>
                    <button id="export-bioage-report" class="btn-primary" style="display: flex; align-items: center; gap: 0.4rem; padding: 0.5rem 1rem; border-radius: 8px;">
                        <span>📥</span> Export Longevity Report
                    </button>
                </div>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 2rem;" class="bioage-grid">
                <!-- Left Column: Input Form -->
                <div class="glass-panel" style="padding: 1.5rem; border-radius: 12px; background: rgba(0,0,0,0.2);">
                    <h3 style="font-size: 1.1rem; margin-bottom: 1rem; color: var(--primary);">1. Biomarker Lab Input</h3>
                    
                    <div style="margin-bottom: 1rem;">
                        <label style="display: block; font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 0.3rem;">Chronological Age (Years)</label>
                        <input type="number" id="input-age" class="input" value="45" min="18" max="100" style="width: 100%;">
                    </div>

                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                        <div>
                            <label style="display: block; font-size: 0.8rem; color: var(--text-secondary);">hs-CRP (mg/L)</label>
                            <input type="number" step="0.1" id="input-crp" class="input" value="0.8" style="width: 100%;">
                        </div>
                        <div>
                            <label style="display: block; font-size: 0.8rem; color: var(--text-secondary);">Fasting Glucose (mg/dL)</label>
                            <input type="number" id="input-glucose" class="input" value="85" style="width: 100%;">
                        </div>
                        <div>
                            <label style="display: block; font-size: 0.8rem; color: var(--text-secondary);">HbA1c (%)</label>
                            <input type="number" step="0.1" id="input-hba1c" class="input" value="5.2" style="width: 100%;">
                        </div>
                        <div>
                            <label style="display: block; font-size: 0.8rem; color: var(--text-secondary);">ApoB (mg/dL)</label>
                            <input type="number" id="input-apob" class="input" value="80" style="width: 100%;">
                        </div>
                        <div>
                            <label style="display: block; font-size: 0.8rem; color: var(--text-secondary);">Triglycerides (mg/dL)</label>
                            <input type="number" id="input-trig" class="input" value="90" style="width: 100%;">
                        </div>
                        <div>
                            <label style="display: block; font-size: 0.8rem; color: var(--text-secondary);">Vitamin D (ng/mL)</label>
                            <input type="number" id="input-vitd" class="input" value="50" style="width: 100%;">
                        </div>
                        <div>
                            <label style="display: block; font-size: 0.8rem; color: var(--text-secondary);">Albumin (g/dL)</label>
                            <input type="number" step="0.1" id="input-alb" class="input" value="4.5" style="width: 100%;">
                        </div>
                        <div>
                            <label style="display: block; font-size: 0.8rem; color: var(--text-secondary);">Creatinine (mg/dL)</label>
                            <input type="number" step="0.1" id="input-creat" class="input" value="0.9" style="width: 100%;">
                        </div>
                    </div>

                    <button id="calc-bioage-btn" class="btn-primary" style="width: 100%; margin-top: 1.5rem; border-radius: 8px; padding: 0.75rem;">
                        ⚡ Calculate Biological Age Score
                    </button>
                </div>

                <!-- Right Column: Results & Score Gauge -->
                <div id="bioage-results-panel" class="glass-panel" style="padding: 1.5rem; border-radius: 12px; background: rgba(0,0,0,0.2); display: flex; flex-direction: column; justify-content: center; align-items: center; text-align: center;">
                    <div style="font-size: 3rem; margin-bottom: 0.5rem;">🧬</div>
                    <h3 style="color: var(--text-secondary); font-size: 1rem;">Click "Calculate" to generate Biological Age</h3>
                    <p style="font-size: 0.85rem; color: var(--text-muted); max-width: 320px; margin-top: 0.5rem;">
                        Evaluates systemic inflammation, glycation, lipid burden, and cellular senescence markers against Levine PhenoAge data.
                    </p>
                </div>
            </div>

            <!-- Interventions Section -->
            <div id="interventions-panel" style="margin-top: 2rem; display: none;">
                <h3 style="font-size: 1.2rem; margin-bottom: 1rem; color: var(--primary); display: flex; align-items: center; gap: 0.5rem;">
                    <span>🎯</span> Targeted Longevity Interventions
                </h3>
                <div id="interventions-list" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1rem;"></div>
            </div>
        </div>
    `;

    let currentBioAgeData = null;

    // Helper to run calculation
    const runCalculation = async () => {
        const chronological_age = parseFloat(document.getElementById('input-age').value) || 45;
        const labs = {
            crp: parseFloat(document.getElementById('input-crp').value) || 0.8,
            glucose: parseFloat(document.getElementById('input-glucose').value) || 85,
            hba1c: parseFloat(document.getElementById('input-hba1c').value) || 5.2,
            apob: parseFloat(document.getElementById('input-apob').value) || 80,
            triglycerides: parseFloat(document.getElementById('input-trig').value) || 90,
            vitamin_d: parseFloat(document.getElementById('input-vitd').value) || 50,
            albumin: parseFloat(document.getElementById('input-alb').value) || 4.5,
            creatinine: parseFloat(document.getElementById('input-creat').value) || 0.9,
        };

        try {
            const res = await calculateBioAge(chronological_age, labs);
            currentBioAgeData = res;
            renderResults(res);
        } catch (e) {
            showToast("Calculation error: " + e.message, "error");
        }
    };

    document.getElementById('calc-bioage-btn').addEventListener('click', runCalculation);

    // One-click demo lab profile button
    document.getElementById('load-sample-lab-btn').addEventListener('click', () => {
        document.getElementById('input-crp').value = 2.8;
        document.getElementById('input-glucose').value = 104;
        document.getElementById('input-hba1c').value = 5.7;
        document.getElementById('input-apob').value = 115;
        document.getElementById('input-trig').value = 145;
        document.getElementById('input-vitd').value = 26;
        document.getElementById('input-alb').value = 4.2;
        document.getElementById('input-creat').value = 1.1;

        showToast("Demo Clinical Lab Profile Loaded!", "success");
        runCalculation();
    });

    // Auto-parse PDF upload
    document.getElementById('lab-pdf-upload').addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        showToast("Parsing lab report PDF...", "info");

        try {
            const chronological_age = parseFloat(document.getElementById('input-age').value) || 45;
            const res = await parseLabPdf(file, chronological_age);
            
            showToast(`Extracted ${res.extracted_count} biomarkers from lab report!`, "success");

            // Fill form fields
            const labs = res.extracted_biomarkers;
            if (labs.crp) document.getElementById('input-crp').value = labs.crp;
            if (labs.glucose) document.getElementById('input-glucose').value = labs.glucose;
            if (labs.hba1c) document.getElementById('input-hba1c').value = labs.hba1c;
            if (labs.apob) document.getElementById('input-apob').value = labs.apob;
            if (labs.triglycerides) document.getElementById('input-trig').value = labs.triglycerides;
            if (labs.vitamin_d) document.getElementById('input-vitd').value = labs.vitamin_d;
            if (labs.albumin) document.getElementById('input-alb').value = labs.albumin;
            if (labs.creatinine) document.getElementById('input-creat').value = labs.creatinine;

            currentBioAgeData = res.biological_age_analysis;
            renderResults(res.biological_age_analysis);
        } catch (err) {
            showToast("Error parsing PDF: " + err.message, "error");
        }
    });

    // Export report handler
    document.getElementById('export-bioage-report').addEventListener('click', async () => {
        if (!currentBioAgeData) {
            await runCalculation();
        }
        try {
            showToast("Generating Longevity Report...", "info");
            const blob = await exportReport(currentBioAgeData, [], []);
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = "LongevityLens_Healthspan_Report.md";
            document.body.appendChild(a);
            a.click();
            a.remove();
            showToast("Report exported successfully!", "success");
        } catch (err) {
            showToast("Export error: " + err.message, "error");
        }
    });

    // Run initial calculation
    runCalculation();
}

function renderResults(data) {
    const resultsPanel = document.getElementById('bioage-results-panel');
    const deltaSign = data.age_delta > 0 ? `+${data.age_delta}` : `${data.age_delta}`;
    const deltaColor = data.age_delta <= 0 ? 'var(--success)' : 'var(--warning)';

    resultsPanel.innerHTML = `
        <div style="width: 100%;">
            <div style="font-size: 0.8rem; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 0.5rem;">PhenoAge Biological Age</div>
            <div style="font-size: 3.5rem; font-weight: 700; color: var(--primary); line-height: 1;">
                ${data.pheno_age} <span style="font-size: 1.2rem; font-weight: 400; color: var(--text-secondary);">yrs</span>
            </div>
            
            <div style="display: inline-block; margin-top: 0.75rem; padding: 0.4rem 1rem; border-radius: 20px; font-weight: 600; font-size: 0.9rem; background: rgba(0,0,0,0.3); border: 1px solid ${deltaColor}; color: ${deltaColor};">
                ${deltaSign} Years Age Delta (${data.chronological_age} Chronological)
            </div>

            <div style="margin-top: 1rem; font-size: 0.85rem; color: var(--text-primary); font-weight: 500;">
                ${data.pace_category}
            </div>

            <div style="margin-top: 1.5rem; width: 100%; border-top: 1px solid var(--border); padding-top: 1rem;">
                <div style="display: flex; justify-content: space-between; font-size: 0.8rem; margin-bottom: 0.4rem;">
                    <span>Inflammaging Score:</span>
                    <strong>${data.sub_scores.inflammaging} / 100</strong>
                </div>
                <div style="display: flex; justify-content: space-between; font-size: 0.8rem; margin-bottom: 0.4rem;">
                    <span>Metabolic Health Score:</span>
                    <strong>${data.sub_scores.metabolic} / 100</strong>
                </div>
                <div style="display: flex; justify-content: space-between; font-size: 0.8rem;">
                    <span>Cardiovascular Score:</span>
                    <strong>${data.sub_scores.cardiovascular} / 100</strong>
                </div>
            </div>
        </div>
    `;

    // Render interventions list
    const interventionsPanel = document.getElementById('interventions-panel');
    const interventionsList = document.getElementById('interventions-list');
    interventionsPanel.style.display = 'block';
    interventionsList.innerHTML = '';

    data.recommendations.forEach(rec => {
        const card = document.createElement('div');
        card.className = 'glass-panel';
        card.style.cssText = 'padding: 1rem; border-radius: 10px; border-left: 4px solid var(--primary); background: rgba(0,212,170,0.03);';
        card.innerHTML = `
            <div style="display: flex; justify-content: space-between; font-weight: 600; font-size: 0.9rem; margin-bottom: 0.3rem;">
                <span>${rec.biomarker}</span>
                <span style="color: var(--warning); font-size: 0.8rem;">${rec.value}</span>
            </div>
            <div style="font-size: 0.75rem; color: var(--text-secondary); margin-bottom: 0.5rem;">Target: ${rec.target}</div>
            <div style="font-size: 0.8rem; color: var(--text-primary); line-height: 1.4;">${rec.action}</div>
        `;
        interventionsList.appendChild(card);
    });
}

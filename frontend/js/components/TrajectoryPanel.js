import { showToast } from '../main.js';
import { calculateTrajectory, getPresetJourney } from '../utils/api.js';

export function renderTrajectoryPanel() {
    const contentArea = document.getElementById('content-area');

    contentArea.innerHTML = `
        <div class="glass-panel fade-in" style="padding: 2rem; border-radius: var(--radius-md); max-width: 1100px; margin: 0 auto; overflow-y: auto; max-height: calc(100vh - 100px);">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; flex-wrap: wrap; gap: 1rem;">
                <div>
                    <h2 style="font-size: 1.5rem; display: flex; align-items: center; gap: 0.5rem;">
                        <span>📊</span> Longitudinal Biomarker & Healthspan Trajectory
                    </h2>
                    <p style="color: var(--text-secondary); font-size: 0.9rem;">
                        Track multi-date blood panels, visualize biological age trend lines, and compute annual pace of aging ($\Delta \\text{BioAge} / \\text{Year}$).
                    </p>
                </div>
                <div style="display: flex; gap: 0.75rem;">
                    <button id="load-preset-journey-btn" class="btn-secondary" style="display: flex; align-items: center; gap: 0.4rem; padding: 0.5rem 1rem; border-radius: 8px;">
                        <span>⚡</span> Load 12-Month Reversal Journey
                    </button>
                </div>
            </div>

            <!-- Main Grid -->
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 2rem;" class="bioage-grid">
                
                <!-- Left: Multi-date entry list -->
                <div class="glass-panel" style="padding: 1.5rem; border-radius: 12px; background: rgba(0,0,0,0.2);">
                    <h3 style="font-size: 1.1rem; margin-bottom: 1rem; color: var(--primary);">Lab Entry History</h3>
                    <div id="lab-entries-list" style="display: flex; flex-direction: column; gap: 0.75rem; margin-bottom: 1rem;">
                        <!-- Entries added dynamically -->
                    </div>

                    <button id="add-lab-entry-btn" class="btn-ghost" style="width: 100%; border: 1px dashed var(--border-primary); padding: 0.6rem; border-radius: 8px;">
                        + Add Historical Blood Panel Date
                    </button>

                    <button id="calc-trajectory-btn" class="btn-primary" style="width: 100%; margin-top: 1.5rem; border-radius: 8px; padding: 0.75rem;">
                        ⚡ Calculate Healthspan Trajectory
                    </button>
                </div>

                <!-- Right: Results & Trajectory Metrics -->
                <div id="trajectory-results-panel" class="glass-panel" style="padding: 1.5rem; border-radius: 12px; background: rgba(0,0,0,0.2); display: flex; flex-direction: column; justify-content: center; align-items: center; text-align: center;">
                    <div style="font-size: 3rem; margin-bottom: 0.5rem;">📊</div>
                    <h3 style="color: var(--text-secondary); font-size: 1rem;">Click "Calculate" or "Load 12-Month Journey"</h3>
                    <p style="font-size: 0.85rem; color: var(--text-muted); max-width: 320px; margin-top: 0.5rem;">
                        Computes historical biological age deltas and annual pace of aging across your blood panels.
                    </p>
                </div>
            </div>

            <!-- SVG Trend Charts Container -->
            <div id="trajectory-chart-panel" style="margin-top: 2rem; display: none;">
                <h3 style="font-size: 1.2rem; margin-bottom: 1rem; color: var(--primary); display: flex; align-items: center; gap: 0.5rem;">
                    <span>📈</span> Biological Age Trend Line
                </h3>
                <div class="glass-panel" style="padding: 1.5rem; background: rgba(0,0,0,0.3); border-radius: 12px;" id="chart-container">
                    <!-- SVG rendered dynamically -->
                </div>
            </div>

        </div>
    `;

    let currentLabHistory = [];

    const renderEntriesForm = () => {
        const listDiv = document.getElementById('lab-entries-list');
        listDiv.innerHTML = '';

        currentLabHistory.forEach((entry, idx) => {
            const card = document.createElement('div');
            card.className = 'glass-panel';
            card.style.cssText = 'padding: 1rem; border-radius: 8px; background: rgba(0,0,0,0.15);';
            card.innerHTML = `
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
                    <strong style="color: var(--primary); font-size: 0.85rem;">Timepoint ${idx + 1}</strong>
                    <input type="date" value="${entry.date}" class="input" style="width: 150px; padding: 0.2rem 0.5rem; font-size: 0.8rem;" data-idx="${idx}" class="entry-date">
                </div>
                <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 0.5rem; font-size: 0.75rem;">
                    <div><span style="color:var(--text-secondary)">hs-CRP:</span> <strong>${entry.labs.crp}</strong></div>
                    <div><span style="color:var(--text-secondary)">Glucose:</span> <strong>${entry.labs.glucose}</strong></div>
                    <div><span style="color:var(--text-secondary)">HbA1c:</span> <strong>${entry.labs.hba1c}</strong></div>
                    <div><span style="color:var(--text-secondary)">ApoB:</span> <strong>${entry.labs.apob}</strong></div>
                </div>
            `;
            listDiv.appendChild(card);
        });
    };

    const runTrajectoryCalculation = async () => {
        if (currentLabHistory.length === 0) {
            showToast("Please add at least 1 lab entry", "warning");
            return;
        }

        try {
            const res = await calculateTrajectory(45.0, currentLabHistory);
            renderTrajectoryResults(res);
        } catch (e) {
            showToast("Trajectory error: " + e.message, "error");
        }
    };

    // Load preset 12-month journey
    document.getElementById('load-preset-journey-btn').addEventListener('click', async () => {
        try {
            const preset = await getPresetJourney();
            currentLabHistory = preset;
            renderEntriesForm();
            showToast("Loaded 12-Month Longevity Journey Preset!", "success");
            await runTrajectoryCalculation();
        } catch (e) {
            showToast("Error loading preset: " + e.message, "error");
        }
    });

    document.getElementById('calc-trajectory-btn').addEventListener('click', runTrajectoryCalculation);

    // Initial default state
    getPresetJourney().then(preset => {
        currentLabHistory = preset;
        renderEntriesForm();
        runTrajectoryCalculation();
    });
}

function renderTrajectoryResults(data) {
    const resultsPanel = document.getElementById('trajectory-results-panel');
    const chartPanel = document.getElementById('trajectory-chart-panel');
    const chartContainer = document.getElementById('chart-container');

    const paceColor = data.status_color;

    resultsPanel.innerHTML = `
        <div style="width: 100%;">
            <div style="font-size: 0.8rem; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 0.5rem;">Annual Pace of Aging Rate</div>
            <div style="font-size: 3.5rem; font-weight: 700; color: ${paceColor}; line-height: 1;">
                ${data.pace_of_aging_per_year} <span style="font-size: 1.2rem; font-weight: 400; color: var(--text-secondary);">yrs/yr</span>
            </div>
            
            <div style="display: inline-block; margin-top: 0.75rem; padding: 0.4rem 1rem; border-radius: 20px; font-weight: 600; font-size: 0.85rem; background: rgba(0,0,0,0.3); border: 1px solid ${paceColor}; color: ${paceColor};">
                ${data.trajectory_status}
            </div>

            <div style="margin-top: 1.5rem; width: 100%; border-top: 1px solid var(--border); padding-top: 1rem;">
                <div style="font-size: 0.8rem; color: var(--text-secondary); margin-bottom: 0.5rem;">Healthspan Projections:</div>
                <div style="display: flex; justify-content: space-between; font-size: 0.85rem; margin-bottom: 0.4rem;">
                    <span>5-Year Biological Age:</span>
                    <strong style="color: var(--primary);">${data.projections.five_year} yrs</strong>
                </div>
                <div style="display: flex; justify-content: space-between; font-size: 0.85rem;">
                    <span>10-Year Biological Age:</span>
                    <strong style="color: var(--primary);">${data.projections.ten_year} yrs</strong>
                </div>
            </div>
        </div>
    `;

    // Render SVG Trend Chart
    chartPanel.style.display = 'block';
    const timeline = data.timeline;

    if (timeline.length < 2) {
        chartContainer.innerHTML = '<p style="color:var(--text-muted);">Add 2+ lab timepoints to generate trend lines.</p>';
        return;
    }

    // Build SVG path for biological age points
    const width = 600;
    const height = 180;
    const padding = 30;

    const minAge = Math.min(...timeline.map(t => t.pheno_age)) - 2;
    const maxAge = Math.max(...timeline.map(t => t.pheno_age)) + 2;

    const points = timeline.map((t, i) => {
        const x = padding + (i / (timeline.length - 1)) * (width - 2 * padding);
        const y = height - padding - ((t.pheno_age - minAge) / (maxAge - minAge)) * (height - 2 * padding);
        return { x, y, pheno_age: t.pheno_age, date: t.date };
    });

    const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');

    chartContainer.innerHTML = `
        <svg viewBox="0 0 ${width} ${height}" style="width: 100%; height: 200px; overflow: visible;">
            <!-- Grid lines -->
            <line x1="${padding}" y1="${padding}" x2="${width - padding}" y2="${padding}" stroke="rgba(255,255,255,0.08)" stroke-dasharray="4"/>
            <line x1="${padding}" y1="${height / 2}" x2="${width - padding}" y2="${height / 2}" stroke="rgba(255,255,255,0.08)" stroke-dasharray="4"/>
            <line x1="${padding}" y1="${height - padding}" x2="${width - padding}" y2="${height - padding}" stroke="rgba(255,255,255,0.08)" stroke-dasharray="4"/>

            <!-- Trend Path -->
            <path d="${pathD}" fill="none" stroke="var(--primary)" stroke-width="3" stroke-linecap="round"/>

            <!-- Points & Labels -->
            ${points.map(p => `
                <circle cx="${p.x}" cy="${p.y}" r="6" fill="var(--primary)" stroke="#000" stroke-width="2"/>
                <text x="${p.x}" y="${p.y - 12}" fill="var(--text-primary)" font-size="12" font-weight="bold" text-anchor="middle">${p.pheno_age} yrs</text>
                <text x="${p.x}" y="${height - 8}" fill="var(--text-secondary)" font-size="10" text-anchor="middle">${p.date}</text>
            `).join('')}
        </svg>
    `;
}

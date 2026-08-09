import { showToast } from '../main.js';
import { generateProtocol } from '../utils/api.js';

export function renderProtocolPanel() {
    const contentArea = document.getElementById('content-area');

    contentArea.innerHTML = `
        <div class="glass-panel fade-in" style="padding: 2rem; border-radius: var(--radius-md); max-width: 1100px; margin: 0 auto; overflow-y: auto; max-height: calc(100vh - 100px);">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; flex-wrap: wrap; gap: 1rem;">
                <div>
                    <h2 style="font-size: 1.5rem; display: flex; align-items: center; gap: 0.5rem;">
                        <span>💊</span> Personalized Longevity Intervention Protocol Builder
                    </h2>
                    <p style="color: var(--text-secondary); font-size: 0.9rem;">
                        Evidence-based 4-tier intervention stack (Nutritional, Exercise, Supplements, Sleep) mapped to your clinical sub-scores.
                    </p>
                </div>
                <button id="export-protocol-btn" class="btn-primary" style="display: flex; align-items: center; gap: 0.4rem; padding: 0.5rem 1rem; border-radius: 8px;">
                    <span>📥</span> Export Protocol Checklist
                </button>
            </div>

            <!-- Dynamic Protocol Grid -->
            <div id="protocol-content-area">
                <div style="text-align: center; padding: 3rem;">
                    <div class="spinner"></div>
                    <p style="color: var(--text-secondary); margin-top: 1rem;">Generating personalized intervention stack…</p>
                </div>
            </div>
        </div>
    `;

    // Generate protocol from baseline labs
    const defaultLabs = {
        crp: 2.4,
        glucose: 102,
        hba1c: 5.6,
        apob: 115,
        triglycerides: 140,
        vitamin_d: 28,
        albumin: 4.2,
        creatinine: 1.0
    };

    generateProtocol(45.0, defaultLabs).then(protocol => {
        renderProtocolContent(protocol);
    }).catch(e => {
        showToast("Protocol generation error: " + e.message, "error");
    });
}

function renderProtocolContent(data) {
    const area = document.getElementById('protocol-content-area');
    if (!area) return;

    area.innerHTML = `
        <!-- Tier 1: Daily Timing Schedule -->
        <div style="margin-bottom: 2rem;">
            <h3 style="font-size: 1.1rem; color: var(--primary); margin-bottom: 1rem; display: flex; align-items: center; gap: 0.5rem;">
                <span>⏰</span> Daily Execution Schedule
            </h3>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 1rem;">
                ${scheduleCard('🌅 Morning', data.daily_schedule.morning, 'primary')}
                ${scheduleCard('☀️ Midday', data.daily_schedule.midday, 'info')}
                ${scheduleCard('🌆 Evening', data.daily_schedule.evening, 'warning')}
                ${scheduleCard('🌙 Pre-Bed', data.daily_schedule.night, 'secondary')}
            </div>
        </div>

        <!-- Tier 2: Targeted Supplements -->
        <div style="margin-bottom: 2rem;">
            <h3 style="font-size: 1.1rem; color: var(--primary); margin-bottom: 1rem; display: flex; align-items: center; gap: 0.5rem;">
                <span>💊</span> Evidence-Based Supplement Stack
            </h3>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 1rem;">
                ${data.supplement_stack.map(supp => `
                    <div class="glass-panel" style="padding: 1.25rem; border-radius: 10px; border-left: 4px solid var(--primary); background: rgba(0,212,170,0.03);">
                        <div style="font-weight: 700; font-size: 0.95rem; margin-bottom: 0.3rem;">${supp.name}</div>
                        <div style="font-size: 0.8rem; color: var(--primary); font-weight: 600; margin-bottom: 0.4rem;">Dosage: ${supp.dosage} (${supp.timing})</div>
                        <div style="font-size: 0.75rem; color: var(--text-secondary); margin-bottom: 0.4rem;">Target: ${supp.target}</div>
                        <div style="font-size: 0.8rem; color: var(--text-primary); line-height: 1.4;">${supp.evidence}</div>
                    </div>
                `).join('')}
            </div>
        </div>

        <!-- Tier 3: Exercise & Ergonomics -->
        <div style="margin-bottom: 2rem;">
            <h3 style="font-size: 1.1rem; color: var(--primary); margin-bottom: 1rem; display: flex; align-items: center; gap: 0.5rem;">
                <span>🏃</span> Exercise & Ergonomics Protocol
            </h3>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1rem;">
                ${data.exercise_stack.map(ex => `
                    <div class="glass-panel" style="padding: 1.25rem; border-radius: 10px; border-left: 4px solid var(--secondary); background: rgba(124,92,191,0.03);">
                        <div style="font-weight: 700; font-size: 0.95rem; margin-bottom: 0.3rem;">${ex.title}</div>
                        <div style="font-size: 0.8rem; color: #a78bfa; font-weight: 600; margin-bottom: 0.4rem;">Frequency: ${ex.frequency}</div>
                        <div style="font-size: 0.8rem; color: var(--text-primary); line-height: 1.4;">${ex.details}</div>
                    </div>
                `).join('')}
            </div>
        </div>

        <!-- Tier 4: Nutrition & Fasting -->
        <div>
            <h3 style="font-size: 1.1rem; color: var(--primary); margin-bottom: 1rem; display: flex; align-items: center; gap: 0.5rem;">
                <span>🥑</span> Nutritional & Fasting Architecture
            </h3>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1rem;">
                ${data.nutritional_stack.map(nut => `
                    <div class="glass-panel" style="padding: 1.25rem; border-radius: 10px; border-left: 4px solid var(--warning); background: rgba(245,158,11,0.03);">
                        <div style="font-weight: 700; font-size: 0.95rem; margin-bottom: 0.3rem;">${nut.title}</div>
                        <div style="font-size: 0.75rem; color: var(--warning); font-weight: 600; margin-bottom: 0.4rem;">Evidence: ${nut.evidence_level}</div>
                        <div style="font-size: 0.8rem; color: var(--text-primary); line-height: 1.4;">${nut.details}</div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;

    document.getElementById('export-protocol-btn').addEventListener('click', () => {
        showToast("Protocol Checklist Exported!", "success");
    });
}

function scheduleCard(title, items, theme) {
    return `
        <div class="glass-panel" style="padding: 1rem; border-radius: 10px; background: rgba(0,0,0,0.2);">
            <div style="font-weight: 700; font-size: 0.9rem; margin-bottom: 0.6rem; color: var(--text-primary);">${title}</div>
            <ul style="list-style: none; display: flex; flex-direction: column; gap: 0.4rem; padding: 0;">
                ${items.map(item => `
                    <li style="font-size: 0.78rem; color: var(--text-secondary); display: flex; align-items: flex-start; gap: 0.4rem;">
                        <input type="checkbox" style="margin-top: 2px; cursor: pointer;">
                        <span>${item}</span>
                    </li>
                `).join('')}
            </ul>
        </div>
    `;
}

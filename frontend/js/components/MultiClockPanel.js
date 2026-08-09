import { showToast } from '../main.js';
import { calculateBioAge } from '../utils/api.js';

export function renderMultiClockPanel() {
    const contentArea = document.getElementById('content-area');

    contentArea.innerHTML = `
        <div class="glass-panel fade-in" style="padding: 2rem; border-radius: var(--radius-md); max-width: 1100px; margin: 0 auto; overflow-y: auto; max-height: calc(100vh - 100px);">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; flex-wrap: wrap; gap: 1rem;">
                <div>
                    <h2 style="font-size: 1.5rem; display: flex; align-items: center; gap: 0.5rem;">
                        <span>⚖️</span> Multi-Clock Biological Age Matrix
                    </h2>
                    <p style="color: var(--text-secondary); font-size: 0.9rem;">
                        Side-by-side comparative matrix of 4 premier biological age clocks (Levine PhenoAge, Horvath DNAm, GrimAge, DunedinPACE) + Composite Index.
                    </p>
                </div>
            </div>

            <!-- Composite Gauge Hero -->
            <div class="glass-panel" style="padding: 1.5rem; border-radius: 12px; margin-bottom: 2rem; background: rgba(0,212,170,0.03); border-color: var(--border-primary); text-align: center;">
                <div style="font-size: 0.8rem; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 0.5rem;">Composite Biological Age Index</div>
                <div style="font-size: 4rem; font-weight: 800; color: var(--primary); line-height: 1;" id="composite-age-display">
                    42.8 <span style="font-size: 1.3rem; font-weight: 400; color: var(--text-secondary);">yrs</span>
                </div>
                <div style="display: inline-block; margin-top: 0.75rem; padding: 0.35rem 1rem; border-radius: 20px; font-weight: 600; font-size: 0.85rem; background: rgba(16,217,138,0.12); color: var(--success); border: 1px solid rgba(16,217,138,0.3);">
                    -2.2 Years Younger than Chronological Age (45.0)
                </div>
            </div>

            <!-- 4-Clock Grid -->
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 1.25rem;">
                ${clockCard('🧬 Levine PhenoAge', '42.0', 'Clinical Blood Panel', 'High sensitivity for systemic glycation & inflammaging', 'var(--primary)')}
                ${clockCard('🔬 Horvath DNAm Age', '43.2', 'Multi-Tissue Epigenetic', '353 CpG methylation sites across organ systems', '#a78bfa')}
                ${clockCard('💀 GrimAge Predictor', '41.5', 'Mortality & Plasma Surrogates', 'Incorporate PAI-1, Cystatin C & smoking surrogates', 'var(--success)')}
                ${clockCard('⚡ DunedinPACE', '0.81 yrs/yr', 'Pace of Aging Speedometer', 'Decelerated pace of biological decline (< 1.0)', 'var(--info)')}
            </div>

            <!-- Detailed Explanation Card -->
            <div class="glass-panel" style="margin-top: 2rem; padding: 1.25rem; background: rgba(0,0,0,0.2);">
                <h4 style="font-size: 0.95rem; margin-bottom: 0.5rem; color: var(--primary);">Understanding the Multi-Clock Matrix</h4>
                <p style="font-size: 0.82rem; color: var(--text-secondary); line-height: 1.6;">
                    Different biological age clocks evaluate distinct cellular layers. <strong>PhenoAge</strong> reflects functional clinical organ health from blood panel chemistry; <strong>Horvath DNAm Age</strong> measures multi-tissue epigenetic methylation drift; <strong>GrimAge</strong> predicts time-to-disease and mortality surrogates; while <strong>DunedinPACE</strong> acts as a speedometer measuring your current rate of biological decline.
                </p>
            </div>
        </div>
    `;
}

function clockCard(title, value, sub, desc, color) {
    return `
        <div class="glass-panel" style="padding: 1.25rem; border-radius: 12px; background: rgba(0,0,0,0.2); border-top: 3px solid ${color};">
            <div style="font-weight: 700; font-size: 0.95rem; margin-bottom: 0.3rem;">${title}</div>
            <div style="font-size: 0.72rem; color: var(--text-muted); margin-bottom: 0.75rem;">${sub}</div>
            <div style="font-size: 2.2rem; font-weight: 800; color: ${color}; margin-bottom: 0.5rem;">${value}</div>
            <div style="font-size: 0.78rem; color: var(--text-secondary); line-height: 1.4;">${desc}</div>
        </div>
    `;
}

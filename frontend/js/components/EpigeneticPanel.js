import { showToast } from '../main.js';

export function renderEpigeneticPanel() {
    const contentArea = document.getElementById('content-area');

    contentArea.innerHTML = `
        <div class="epigenetic-container glass-panel fade-in" style="padding: 2rem; border-radius: var(--radius-md); max-width: 1100px; margin: 0 auto; overflow-y: auto; max-height: calc(100vh - 100px);">
            <div style="margin-bottom: 1.5rem;">
                <h2 style="font-size: 1.5rem; display: flex; align-items: center; gap: 0.5rem;">
                    <span>🧬</span> Epigenetic Methylation Clock Simulator
                </h2>
                <p style="color: var(--text-secondary); font-size: 0.9rem;">
                    Directly mirrors FOXO's core saliva-based DNA methylation profiling technology (Horvath Clock, GrimAge, DunedinPACE).
                </p>
            </div>

            <!-- Profile Preset Selector -->
            <div class="glass-panel" style="padding: 1rem; border-radius: 12px; margin-bottom: 1.5rem; background: rgba(0,0,0,0.2);">
                <div style="font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 0.5rem; font-weight: 500;">Select DNA Methylation Profile Preset:</div>
                <div style="display: flex; gap: 0.75rem; flex-wrap: wrap;" id="preset-buttons">
                    <button class="btn-secondary preset-btn active" data-preset="centenarian_trajectory">🌟 Super-Centenarian</button>
                    <button class="btn-secondary preset-btn" data-preset="longevity_protocol">⚡ Longevity Medicine Protocol</button>
                    <button class="btn-secondary preset-btn" data-preset="average_adult">📊 Population Baseline</button>
                    <button class="btn-secondary preset-btn" data-preset="high_inflammaging">🔥 High Inflammaging</button>
                </div>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 2rem;" class="epi-grid">
                <!-- Left: CpG Site Sliders & Age Input -->
                <div class="glass-panel" style="padding: 1.5rem; border-radius: 12px; background: rgba(0,0,0,0.2);">
                    <h3 style="font-size: 1.1rem; margin-bottom: 1rem; color: var(--primary);">1. CpG Site DNA Methylation Levels (Beta Values)</h3>
                    
                    <div style="margin-bottom: 1rem;">
                        <label style="display: block; font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 0.3rem;">Chronological Age</label>
                        <input type="number" id="epi-age" class="input" value="45" min="18" max="100" style="width: 100%;">
                    </div>

                    <div style="display: flex; flex-direction: column; gap: 1rem;">
                        <div>
                            <div style="display: flex; justify-content: space-between; font-size: 0.8rem;">
                                <span>cg16867657 (ELOVL2 Hypermethylation)</span>
                                <strong id="val-cpg1">0.12</strong>
                            </div>
                            <input type="range" id="cpg1" min="0" max="1" step="0.01" value="0.12" style="width: 100%;">
                        </div>
                        <div>
                            <div style="display: flex; justify-content: space-between; font-size: 0.8rem;">
                                <span>cg25809905 (FHL2 Matrix Restructuring)</span>
                                <strong id="val-cpg2">0.45</strong>
                            </div>
                            <input type="range" id="cpg2" min="0" max="1" step="0.01" value="0.45" style="width: 100%;">
                        </div>
                        <div>
                            <div style="display: flex; justify-content: space-between; font-size: 0.8rem;">
                                <span>cg02085507 (KLOTHO Expressional Decay)</span>
                                <strong id="val-cpg3">0.22</strong>
                            </div>
                            <input type="range" id="cpg3" min="0" max="1" step="0.01" value="0.22" style="width: 100%;">
                        </div>
                        <div>
                            <div style="display: flex; justify-content: space-between; font-size: 0.8rem;">
                                <span>cg19724470 (PAI-1 GrimAge Surrogate)</span>
                                <strong id="val-cpg4">0.18</strong>
                            </div>
                            <input type="range" id="cpg4" min="0" max="1" step="0.01" value="0.18" style="width: 100%;">
                        </div>
                        <div>
                            <div style="display: flex; justify-content: space-between; font-size: 0.8rem;">
                                <span>cg22736354 (TIMP-1 SASP Senescence)</span>
                                <strong id="val-cpg5">0.15</strong>
                            </div>
                            <input type="range" id="cpg5" min="0" max="1" step="0.01" value="0.15" style="width: 100%;">
                        </div>
                    </div>
                </div>

                <!-- Right: Epigenetic Clock Metrics & Heatmap -->
                <div id="epi-results-panel" class="glass-panel" style="padding: 1.5rem; border-radius: 12px; background: rgba(0,0,0,0.2);">
                    <!-- Results dynamically rendered -->
                </div>
            </div>

            <!-- Genome Heatmap Panel -->
            <div style="margin-top: 1.5rem;" class="glass-panel" style="padding: 1.5rem; border-radius: 12px; background: rgba(0,0,0,0.2);">
                <h3 style="font-size: 1rem; margin-bottom: 0.75rem; color: var(--primary);">Simulated Saliva Epigenomic CpG Methylation Profile</h3>
                <div id="cpg-heatmap" style="display: flex; gap: 0.5rem; align-items: center; justify-content: space-around;"></div>
            </div>
        </div>
    `;

    let activePreset = "centenarian_trajectory";

    const fetchCalculation = async () => {
        const chronological_age = parseFloat(document.getElementById('epi-age').value) || 45;
        const custom_cpg = {
            cg16867657: parseFloat(document.getElementById('cpg1').value),
            cg25809905: parseFloat(document.getElementById('cpg2').value),
            cg02085507: parseFloat(document.getElementById('cpg3').value),
            cg19724470: parseFloat(document.getElementById('cpg4').value),
            cg22736354: parseFloat(document.getElementById('cpg5').value),
        };

        try {
            const res = await fetch('/api/epigenetics/calculate-clock', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ chronological_age, profile_key: activePreset, custom_cpg })
            }).then(r => r.json());

            renderEpiResults(res);
        } catch (e) {
            showToast("Epigenetic calculation error: " + e.message, "error");
        }
    };

    // Attach slider handlers
    ['cpg1', 'cpg2', 'cpg3', 'cpg4', 'cpg5'].forEach((id, idx) => {
        const slider = document.getElementById(id);
        const valSpan = document.getElementById(`val-cpg${idx+1}`);
        slider.addEventListener('input', (e) => {
            valSpan.textContent = parseFloat(e.target.value).toFixed(2);
            fetchCalculation();
        });
    });

    document.getElementById('epi-age').addEventListener('input', fetchCalculation);

    // Preset button handlers
    document.querySelectorAll('.preset-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.preset-btn').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            activePreset = e.target.dataset.preset;

            // Set sliders according to preset defaults
            if (activePreset === 'centenarian_trajectory') {
                setSliders(0.12, 0.45, 0.22, 0.18, 0.15);
            } else if (activePreset === 'longevity_protocol') {
                setSliders(0.20, 0.50, 0.30, 0.25, 0.22);
            } else if (activePreset === 'average_adult') {
                setSliders(0.35, 0.62, 0.48, 0.41, 0.38);
            } else if (activePreset === 'high_inflammaging') {
                setSliders(0.78, 0.88, 0.82, 0.79, 0.75);
            }
            fetchCalculation();
        });
    });

    function setSliders(v1, v2, v3, v4, v5) {
        document.getElementById('cpg1').value = v1; document.getElementById('val-cpg1').textContent = v1;
        document.getElementById('cpg2').value = v2; document.getElementById('val-cpg2').textContent = v2;
        document.getElementById('cpg3').value = v3; document.getElementById('val-cpg3').textContent = v3;
        document.getElementById('cpg4').value = v4; document.getElementById('val-cpg4').textContent = v4;
        document.getElementById('cpg5').value = v5; document.getElementById('val-cpg5').textContent = v5;
    }

    fetchCalculation();
}

function renderEpiResults(data) {
    const panel = document.getElementById('epi-results-panel');
    panel.innerHTML = `
        <div>
            <div style="font-size: 0.8rem; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 0.5rem;">DunedinPACE (Pace of Aging)</div>
            <div style="font-size: 3rem; font-weight: 700; color: var(--primary); line-height: 1;">
                ${data.dunedin_pace} <span style="font-size: 1rem; font-weight: 400; color: var(--text-secondary);">yrs/yr</span>
            </div>
            
            <div style="margin-top: 0.5rem; font-size: 0.85rem; font-weight: 600; color: ${data.dunedin_pace <= 0.95 ? 'var(--success)' : 'var(--warning)'};">
                ${data.pace_status}
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-top: 1.5rem; text-align: left;">
                <div class="glass-panel" style="padding: 0.75rem; border-radius: 8px; background: rgba(0,0,0,0.2);">
                    <div style="font-size: 0.75rem; color: var(--text-secondary);">Horvath DNAm Age</div>
                    <div style="font-size: 1.4rem; font-weight: 700; color: var(--primary);">${data.horvath_dnam_age} <span style="font-size: 0.8rem;">yrs</span></div>
                </div>
                <div class="glass-panel" style="padding: 0.75rem; border-radius: 8px; background: rgba(0,0,0,0.2);">
                    <div style="font-size: 0.75rem; color: var(--text-secondary);">GrimAge Mortality Clock</div>
                    <div style="font-size: 1.4rem; font-weight: 700; color: var(--warning);">${data.grimage} <span style="font-size: 0.8rem;">yrs</span></div>
                </div>
            </div>

            <div style="margin-top: 1rem; font-size: 0.75rem; color: var(--text-muted); line-height: 1.4; text-align: left;">
                ℹ️ <em>${data.foxo_alignment_note}</em>
            </div>
        </div>
    `;

    // Render Genome Heatmap
    const heatmap = document.getElementById('cpg-heatmap');
    heatmap.innerHTML = '';
    data.cpg_breakdown.forEach(item => {
        const intensity = Math.min(100, Math.max(0, intVal(item.beta * 100)));
        const color = `hsl(${120 - intensity * 1.2}, 80%, 45%)`;
        
        const cell = document.createElement('div');
        cell.style.cssText = 'flex: 1; text-align: center; padding: 0.75rem; border-radius: 8px; background: rgba(0,0,0,0.3); border-top: 4px solid ' + color;
        cell.innerHTML = `
            <div style="font-size: 0.7rem; font-weight: 600;">${item.site.split(' ')[0]}</div>
            <div style="font-size: 1.1rem; font-weight: 700; color: ${color}; margin: 0.2rem 0;">${item.beta.toFixed(2)}</div>
            <div style="font-size: 0.65rem; color: var(--text-secondary);">${item.site.split(' ')[1]}</div>
        `;
        heatmap.appendChild(cell);
    });
}

function intVal(v) { return Math.round(v); }

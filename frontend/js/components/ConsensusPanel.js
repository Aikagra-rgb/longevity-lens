import { showToast } from '../main.js';
import { analyzeConsensus, getConsensusTopics } from '../utils/api.js';

export function renderConsensusPanel() {
    const contentArea = document.getElementById('content-area');

    contentArea.innerHTML = `
        <div class="glass-panel fade-in" style="padding: 2rem; border-radius: var(--radius-md); max-width: 1100px; margin: 0 auto; overflow-y: auto; max-height: calc(100vh - 100px);">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; flex-wrap: wrap; gap: 1rem;">
                <div>
                    <h2 style="font-size: 1.5rem; display: flex; align-items: center; gap: 0.5rem;">
                        <span>🔬</span> Multi-Paper Literature Consensus Engine
                    </h2>
                    <p style="color: var(--text-secondary); font-size: 0.9rem;">
                        Synthesize conflicting longevity literature across indexed papers to build structured scientific consensus tables.
                    </p>
                </div>
            </div>

            <!-- Topic Presets -->
            <div style="margin-bottom: 1.5rem;">
                <div style="font-size: 0.8rem; color: var(--text-secondary); margin-bottom: 0.5rem; font-weight: 500;">Select Preset Research Topic:</div>
                <div style="display: flex; gap: 0.6rem; flex-wrap: wrap;" id="consensus-presets">
                    <button class="btn-secondary topic-btn active" data-topic="nmn_vs_nr">NMN vs. NR for NAD+ Elevation</button>
                    <button class="btn-secondary topic-btn" data-topic="metformin_vs_berberine">Metformin vs. Berberine for HOMA-IR</button>
                    <button class="btn-secondary topic-btn" data-topic="zone2_vs_hiit">Zone 2 vs. HIIT for All-Cause Mortality</button>
                    <button class="btn-secondary topic-btn" data-topic="senolytics_fisetin">Fisetin Senolytic Protocols</button>
                </div>
            </div>

            <!-- Results Output Area -->
            <div id="consensus-output">
                <div style="text-align: center; padding: 2rem;">
                    <div class="spinner"></div>
                    <p style="color: var(--text-secondary); margin-top: 1rem;">Synthesizing literature consensus…</p>
                </div>
            </div>
        </div>
    `;

    const loadConsensusTopic = async (query) => {
        try {
            const res = await analyzeConsensus(query);
            renderConsensusResults(res);
        } catch (e) {
            showToast("Consensus error: " + e.message, "error");
        }
    };

    document.querySelectorAll('.topic-btn').forEach(btn => {
        btn.addEventListener('click', e => {
            document.querySelectorAll('.topic-btn').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            const topic = e.target.dataset.topic;
            let q = "Compare NMN vs NR nicotinamide riboside efficacy in human aging studies.";
            if (topic === 'metformin_vs_berberine') q = "Compare Metformin vs Berberine mechanism of action, AMPK activation, HOMA-IR reduction.";
            if (topic === 'zone2_vs_hiit') q = "Compare Zone 2 mitochondrial lactate clearance vs HIIT VO2max improvements.";
            if (topic === 'senolytics_fisetin') q = "What is the clinical evidence for senolytics like fisetin in clearing senescent SASP cells?";
            loadConsensusTopic(q);
        });
    });

    // Default load
    loadConsensusTopic("Compare NMN vs NR nicotinamide riboside efficacy in human aging studies.");
}

function renderConsensusResults(data) {
    const out = document.getElementById('consensus-output');
    if (!out) return;

    out.innerHTML = `
        <!-- Consensus Summary Card -->
        <div class="glass-panel" style="padding: 1.5rem; border-radius: 12px; margin-bottom: 1.5rem; background: rgba(0,0,0,0.2);">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
                <h3 style="font-size: 1.1rem; color: var(--primary);">Synthesis: ${data.topic_query}</h3>
                <span class="badge badge-primary">${data.literature_sources_count} Literature Sources</span>
            </div>

            <!-- Agreement Points -->
            <div style="margin-bottom: 1rem;">
                <div style="font-weight: 700; font-size: 0.85rem; color: var(--success); margin-bottom: 0.4rem;">✓ Areas of Scientific Agreement:</div>
                <ul style="padding-left: 1.2rem; color: var(--text-primary); font-size: 0.85rem; line-height: 1.5;">
                    ${data.agreements.map(a => `<li>${a}</li>`).join('')}
                </ul>
            </div>

            <!-- Debates & Nuances -->
            <div style="margin-bottom: 1rem;">
                <div style="font-weight: 700; font-size: 0.85rem; color: var(--warning); margin-bottom: 0.4rem;">⚠️ Debates & Dosage Nuances:</div>
                <ul style="padding-left: 1.2rem; color: var(--text-secondary); font-size: 0.85rem; line-height: 1.5;">
                    ${data.debates_and_nuances.map(d => `<li>${d}</li>`).join('')}
                </ul>
            </div>

            <div style="font-size: 0.8rem; color: var(--text-muted); padding-top: 0.75rem; border-top: 1px solid var(--border);">
                Recommendation Strength: <strong style="color: var(--primary);">${data.recommendation_strength}</strong>
            </div>
        </div>

        <!-- Retrieved Passages -->
        <h4 style="font-size: 0.95rem; color: var(--text-secondary); margin-bottom: 0.75rem;">Retrieved Literature Evidence:</h4>
        <div style="display: flex; flex-direction: column; gap: 0.75rem;">
            ${data.context_chunks.map((c, i) => `
                <div class="glass-panel" style="padding: 1rem; border-radius: 8px; border-left: 3px solid var(--primary); background: rgba(0,0,0,0.15);">
                    <div style="font-size: 0.8rem; font-weight: 700; color: var(--primary); margin-bottom: 0.3rem;">
                        [${i+1}] ${c.metadata.source || 'Research Paper'} (${c.metadata.section || 'Main'})
                    </div>
                    <div style="font-size: 0.82rem; color: var(--text-primary); line-height: 1.5; font-style: italic;">
                        "${c.text}"
                    </div>
                </div>
            `).join('')}
        </div>
    `;
}

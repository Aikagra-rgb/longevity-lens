import { navigateTo } from '../main.js';
import { checkHealth } from '../utils/api.js';

export function renderDashboardPanel() {
    const contentArea = document.getElementById('content-area');
    contentArea.innerHTML = `
        <div class="fade-in" style="padding:2rem; max-width:1200px; margin:0 auto; overflow-y:auto; max-height:calc(100vh - 64px);">
            
            <!-- Hero -->
            <div style="margin-bottom:2rem;">
                <div style="display:flex; align-items:center; gap:1rem; margin-bottom:0.5rem;">
                    <div style="font-size:2.5rem; filter:drop-shadow(0 0 16px rgba(0,229,180,0.4)); animation:floatLogo 4s ease-in-out infinite;">🧬</div>
                    <div>
                        <h2 style="font-size:1.8rem; font-weight:800; letter-spacing:-0.03em; background:linear-gradient(135deg, var(--primary) 0%, #a78bfa 60%, var(--accent) 100%); -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text;">LongevityLens</h2>
                        <p style="color:var(--text-secondary); font-size:0.9rem;">AI-powered health research platform · Powered by Gemini 3.6-flash</p>
                    </div>
                </div>
            </div>

            <!-- Metric Cards -->
            <div id="metric-cards" style="display:grid; grid-template-columns:repeat(auto-fit, minmax(180px, 1fr)); gap:1rem; margin-bottom:2rem;">
                ${metricCard('📄', 'Research Papers', '8', 'Indexed & searchable', 'primary')}
                ${metricCard('🧪', 'Biomarkers', '20+', 'With clinical ranges', 'secondary')}
                ${metricCard('🔬', 'Epigenetic Clocks', '3', 'Horvath · GrimAge · DunedinPACE', 'accent')}
                ${metricCard('🤖', 'AI Engine', 'Gemini 3.6', 'Flash — latest model', 'success')}
            </div>

            <!-- Quick Action Cards -->
            <div style="margin-bottom:2rem;">
                <h3 style="font-size:0.75rem; font-weight:600; text-transform:uppercase; letter-spacing:0.1em; color:var(--text-muted); margin-bottom:1rem;">⚡ Quick Actions</h3>
                <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(260px, 1fr)); gap:1rem;">
                    ${actionCard('chat',        '💬', 'Research Chat',         'gemini-3.6-flash',     'Ask anything about longevity, biomarkers, or research papers using RAG-powered AI.', 'primary')}
                    ${actionCard('bioage',       '🧬', 'Biological Age Audit',  'Levine PhenoAge',       'Calculate your biological age delta using 8 clinical biomarkers and the PhenoAge algorithm.', 'secondary')}
                    ${actionCard('epigenetics',  '🔬', 'Epigenetic DNA Clocks', 'Horvath · GrimAge',    'Simulate DNA methylation age using Horvath, GrimAge & DunedinPACE clocks.', 'accent')}
                    ${actionCard('biomarkers',   '🧪', 'Biomarker Reference',   '20+ markers',           'Browse optimal & clinical ranges for 20+ longevity biomarkers across 6 categories.', 'info')}
                    ${actionCard('documents',    '📄', 'Document Library',      'Semantic RAG index',    'Upload & index your own PDFs — they\'ll be searched by the AI copilot automatically.', 'warning')}
                </div>
            </div>

            <!-- Architecture Overview -->
            <div style="margin-bottom:2rem;">
                <h3 style="font-size:0.75rem; font-weight:600; text-transform:uppercase; letter-spacing:0.1em; color:var(--text-muted); margin-bottom:1rem;">🏗️ Technical Architecture</h3>
                <div class="glass-panel" style="padding:1.5rem;">
                    <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(200px, 1fr)); gap:1.5rem;">
                        ${techCard('🔄', 'RAG Pipeline', ['Gemini text-embedding-2', 'Pure-Python vector store', 'Top-K semantic retrieval', 'SSE streaming responses'])}
                        ${techCard('🧠', 'AI Models', ['Gemini 3.6-flash (chat)', 'gemini-embedding-2 (3072-dim)', 'Offline hash fallback', 'Streaming token output'])}
                        ${techCard('⚙️', 'Backend', ['FastAPI + Python', 'PyMuPDF PDF parsing', 'Levine PhenoAge engine', 'Epigenetic clock simulator'])}
                        ${techCard('🎨', 'Frontend', ['Vanilla JS SPA', 'ES6 modules', 'SSE stream parsing', 'localStorage persistence'])}
                    </div>
                </div>
            </div>

            <!-- Health / Status Row -->
            <div>
                <h3 style="font-size:0.75rem; font-weight:600; text-transform:uppercase; letter-spacing:0.1em; color:var(--text-muted); margin-bottom:1rem;">📡 System Status</h3>
                <div id="status-row" class="glass-panel" style="padding:1.25rem; display:flex; align-items:center; gap:1.5rem; flex-wrap:wrap;">
                    <div style="display:flex; align-items:center; gap:0.5rem; font-size:0.85rem;">
                        <span id="status-dot" style="width:8px; height:8px; background:var(--warning); border-radius:50%; animation:pulse 2s infinite;"></span>
                        <span id="status-text" style="color:var(--text-secondary);">Checking backend…</span>
                    </div>
                    <div id="status-details" style="display:flex; gap:1rem; flex-wrap:wrap;"></div>
                </div>
            </div>

        </div>
    `;

    // Animate metric numbers
    animateCounters();

    // Load health
    checkHealth().then(health => {
        const dot = document.getElementById('status-dot');
        const text = document.getElementById('status-text');
        const details = document.getElementById('status-details');
        if (!dot || !text || !details) return;

        if (health && health.status === 'ok') {
            dot.style.background = 'var(--success)';
            text.textContent = 'Backend online';
            text.style.color = 'var(--success)';
            details.innerHTML = `
                ${statusPill('📄 Papers', health.documents_indexed || 8)}
                ${statusPill('🔢 Chunks', health.total_chunks || '150+')}
                ${statusPill('🔑 API Key', health.has_api_key ? 'Active' : 'Offline')}
                ${statusPill('🤖 Model', 'gemini-3.6-flash')}
            `;
        } else {
            dot.style.background = 'var(--error)';
            text.textContent = 'Backend unreachable';
            text.style.color = 'var(--error)';
        }
    }).catch(() => {
        const dot = document.getElementById('status-dot');
        const text = document.getElementById('status-text');
        if (dot) dot.style.background = 'var(--error)';
        if (text) { text.textContent = 'Backend unreachable'; text.style.color = 'var(--error)'; }
    });

    // Inject floatLogo keyframe
    if (!document.getElementById('dashboard-keyframes')) {
        const s = document.createElement('style');
        s.id = 'dashboard-keyframes';
        s.textContent = `
            @keyframes floatLogo {
                0%,100% { transform:translateY(0) scale(1); }
                50% { transform:translateY(-8px) scale(1.04); }
            }
            .action-card { transition: all 240ms cubic-bezier(0.4,0,0.2,1); cursor:pointer; }
            .action-card:hover { transform:translateY(-4px); border-color: var(--border-hover); box-shadow: 0 16px 40px rgba(0,0,0,0.35); }
        `;
        document.head.appendChild(s);
    }

    // Wire action card clicks
    document.querySelectorAll('.action-card[data-view]').forEach(card => {
        card.addEventListener('click', () => navigateTo(card.dataset.view));
    });
}

function metricCard(icon, label, value, sub, color) {
    const colors = {
        primary:   ['var(--primary)',    'var(--primary-dim)',    'rgba(0,229,180,0.2)'],
        secondary: ['#a78bfa',           'var(--secondary-dim)',  'rgba(124,92,191,0.2)'],
        accent:    ['var(--accent)',      'var(--accent-dim)',     'rgba(59,130,246,0.2)'],
        success:   ['var(--success)',     'rgba(16,217,138,0.1)', 'rgba(16,217,138,0.2)'],
    };
    const [c, bg, border] = colors[color] || colors.primary;
    return `
        <div class="glass-panel" style="padding:1.25rem; border-color:${border}; background:${bg};">
            <div style="font-size:1.6rem; margin-bottom:0.5rem;">${icon}</div>
            <div class="metric-value" data-target="${value}" style="font-size:1.5rem; font-weight:800; color:${c}; font-family:var(--font-mono); letter-spacing:-0.03em;">${value}</div>
            <div style="font-weight:600; font-size:0.85rem; margin:0.15rem 0;">${label}</div>
            <div style="font-size:0.72rem; color:var(--text-muted);">${sub}</div>
        </div>
    `;
}

function actionCard(view, icon, title, tag, desc, color) {
    const tagColors = {
        primary:   'badge-primary',
        secondary: 'badge-secondary',
        accent:    'badge badge-secondary',
        info:      'badge-primary',
        warning:   'badge-warning',
    };
    return `
        <div class="glass-panel action-card" data-view="${view}" style="padding:1.25rem; cursor:pointer; position:relative; overflow:hidden;">
            <div style="display:flex; align-items:flex-start; justify-content:space-between; margin-bottom:0.75rem;">
                <span style="font-size:1.5rem;">${icon}</span>
                <span class="badge ${tagColors[color] || 'badge-primary'}" style="font-size:0.65rem;">${tag}</span>
            </div>
            <div style="font-weight:700; font-size:0.95rem; margin-bottom:0.35rem;">${title}</div>
            <div style="font-size:0.8rem; color:var(--text-secondary); line-height:1.5;">${desc}</div>
            <div style="margin-top:0.9rem; font-size:0.78rem; color:var(--primary); font-weight:600; display:flex; align-items:center; gap:0.3rem;">
                Open <span>→</span>
            </div>
        </div>
    `;
}

function techCard(icon, title, items) {
    return `
        <div>
            <div style="display:flex; align-items:center; gap:0.5rem; margin-bottom:0.75rem;">
                <span style="font-size:1.1rem;">${icon}</span>
                <span style="font-weight:700; font-size:0.9rem;">${title}</span>
            </div>
            <ul style="list-style:none; display:flex; flex-direction:column; gap:0.4rem;">
                ${items.map(item => `
                    <li style="font-size:0.8rem; color:var(--text-secondary); display:flex; align-items:center; gap:0.4rem;">
                        <span style="width:4px; height:4px; background:var(--primary); border-radius:50%; flex-shrink:0;"></span>
                        ${item}
                    </li>
                `).join('')}
            </ul>
        </div>
    `;
}

function statusPill(label, value) {
    return `
        <div style="display:flex; align-items:center; gap:0.4rem; font-size:0.78rem;">
            <span style="color:var(--text-muted);">${label}:</span>
            <span style="color:var(--text-primary); font-weight:600; font-family:var(--font-mono);">${value}</span>
        </div>
    `;
}

function animateCounters() {
    // Simple number count-up for pure numeric metric values
    document.querySelectorAll('.metric-value').forEach(el => {
        const raw = el.dataset.target;
        const num = parseInt(raw);
        if (isNaN(num)) return;
        let current = 0;
        const step = Math.ceil(num / 30);
        const timer = setInterval(() => {
            current = Math.min(current + step, num);
            el.textContent = current + (raw.includes('+') ? '+' : '');
            if (current >= num) clearInterval(timer);
        }, 40);
    });
}

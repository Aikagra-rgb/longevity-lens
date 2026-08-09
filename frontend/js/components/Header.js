import { showSettingsModal, toggleSidebar, state } from '../main.js';

export function renderHeader() {
    const header = document.getElementById('header');

    const hasKey = state.apiKey || state.hasServerKey;
    const keyLabel  = state.apiKey ? 'Personal Key' : (state.hasServerKey ? 'Server Key' : 'Offline RAG');
    const keyColor  = state.apiKey ? '#a78bfa' : (state.hasServerKey ? 'var(--primary)' : 'var(--warning)');
    const keyBg     = state.apiKey ? 'rgba(124,92,191,0.12)' : (state.hasServerKey ? 'var(--primary-dim)' : 'rgba(245,158,11,0.12)');
    const dotColor  = hasKey ? 'var(--success)' : 'var(--warning)';

    header.innerHTML = `
        <div style="display:flex; align-items:center; gap:0.75rem;">
            <!-- Mobile menu toggle -->
            <button id="mobile-menu-btn" class="icon-btn" style="${window.innerWidth <= 768 ? '' : 'display:none;'}">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
                </svg>
            </button>

            <!-- Logo + Title (mobile only) -->
            <div style="${window.innerWidth > 768 ? 'display:none;' : 'display:flex; align-items:center; gap:0.5rem;'}">
                <span style="font-size:1.4rem; filter:drop-shadow(0 0 8px rgba(0,229,180,0.4));">🧬</span>
                <span style="font-weight:800; font-size:1rem; letter-spacing:-0.02em;">LongevityLens</span>
            </div>

            <!-- Page title (desktop) -->
            <div id="header-page-title" style="${window.innerWidth <= 768 ? 'display:none;' : ''}">
                <h1 style="font-size:1rem; font-weight:700; letter-spacing:-0.02em; color:var(--text-primary);">
                    ${getPageTitle(state.currentView)}
                </h1>
                <p style="font-size:0.72rem; color:var(--text-muted); margin-top:1px;">
                    ${getPageSubtitle(state.currentView)}
                </p>
            </div>
        </div>

        <!-- Right side controls -->
        <div style="display:flex; align-items:center; gap:0.6rem; flex-wrap:wrap;">
            <!-- Gemini model badge -->
            <div class="badge badge-primary" style="font-family:var(--font-mono); font-size:0.68rem; gap:0.4rem;">
                <span style="width:6px; height:6px; background:var(--primary); border-radius:50%; animation:pulse 2s infinite;"></span>
                gemini-3.6-flash
            </div>

            <!-- Key status -->
            <div style="display:flex; align-items:center; gap:0.35rem; padding: 0.25rem 0.7rem; border-radius:99px; font-size:0.72rem; font-weight:600; background:${keyBg}; color:${keyColor}; border: 1px solid ${keyColor}; opacity:0.85;">
                <span style="width:5px; height:5px; background:${dotColor}; border-radius:50%;"></span>
                ${keyLabel}
            </div>

            <!-- Disclaimer -->
            <div style="display:flex; align-items:center; gap:0.3rem; padding:0.25rem 0.7rem; border-radius:99px; font-size:0.7rem; color:var(--warning); background:rgba(245,158,11,0.08); border:1px solid rgba(245,158,11,0.2);" title="This tool provides educational information only — not medical advice.">
                ⚠️ <span style="display:none; display:${window.innerWidth > 900 ? 'inline' : 'none'}">Not Medical Advice</span>
            </div>

            <!-- Settings button -->
            <button id="header-settings-btn" class="icon-btn" title="Settings" style="font-size:1rem;">⚙️</button>
        </div>
    `;

    document.getElementById('header-settings-btn').addEventListener('click', showSettingsModal);
    const mobileBtn = document.getElementById('mobile-menu-btn');
    if (mobileBtn) mobileBtn.addEventListener('click', toggleSidebar);
}

function getPageTitle(view) {
    const titles = {
        dashboard:   'Dashboard',
        chat:        'Research Chat',
        epigenetics: 'Epigenetic DNA Clocks',
        bioage:      'Biological Age Audit',
        documents:   'Document Library',
        biomarkers:  'Biomarker Reference',
    };
    return titles[view] || 'LongevityLens';
}

function getPageSubtitle(view) {
    const subs = {
        dashboard:   'Overview · Research platform powered by Gemini 3.6',
        chat:        'RAG-powered longevity research assistant',
        epigenetics: 'Horvath · GrimAge · DunedinPACE methylation simulators',
        bioage:      'Levine PhenoAge algorithm · clinical biomarker analysis',
        documents:   'Index & search research papers via semantic embeddings',
        biomarkers:  '20+ longevity biomarkers with clinical & optimal ranges',
    };
    return subs[view] || '';
}

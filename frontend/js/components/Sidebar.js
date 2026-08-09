import { state, navigateTo, toggleSidebar, showSettingsModal } from '../main.js';

export function renderSidebar() {
    const sidebar = document.getElementById('sidebar');
    
    if (state.sidebarOpen) sidebar.classList.add('open');
    else sidebar.classList.remove('open');

    const navItems = [
        { category: 'OVERVIEW', items: [
            { view: 'dashboard',   icon: '🏠', label: 'Dashboard' }
        ]},
        { category: 'AI RESEARCH', items: [
            { view: 'chat',        icon: '💬', label: 'Research Chat' },
            { view: 'consensus',   icon: '🔬', label: 'Consensus Engine' }
        ]},
        { category: 'DIAGNOSTICS', items: [
            { view: 'multiclock',  icon: '⚖️', label: 'Multi-Clock Matrix' },
            { view: 'bioage',      icon: '🧬', label: 'PhenoAge Audit' },
            { view: 'epigenetics', icon: '🧪', label: 'Epigenetic Clocks' }
        ]},
        { category: 'TRACKING & PROTOCOLS', items: [
            { view: 'trajectory', icon: '📊', label: 'Healthspan Trajectory' },
            { view: 'protocol',   icon: '💊', label: 'Protocol Builder' }
        ]},
        { category: 'DATA & LIBRARY', items: [
            { view: 'documents',   icon: '📄', label: 'Document Library' },
            { view: 'biomarkers',  icon: '📚', label: 'Biomarker Reference' }
        ]}
    ];

    sidebar.innerHTML = `
        <div style="display:flex; flex-direction:column; height:100%; padding: 1rem 0.75rem; overflow-y: auto;">

            <!-- Brand -->
            <div style="display:flex; align-items:center; gap:0.6rem; padding: 0.5rem 0.5rem 1rem; border-bottom: 1px solid var(--border); margin-bottom: 0.75rem;">
                <div style="width:34px; height:34px; border-radius:10px; background: linear-gradient(135deg, var(--primary), #00b4d8); display:flex; align-items:center; justify-content:center; font-size:1.1rem; flex-shrink:0; box-shadow: 0 4px 12px rgba(0,229,180,0.25);">🧬</div>
                <div>
                    <div style="font-weight:800; font-size:0.92rem; letter-spacing:-0.02em;">LongevityLens</div>
                    <div style="font-size:0.65rem; color:var(--text-muted);">Health Research Copilot</div>
                </div>
            </div>

            <!-- New Chat button -->
            <button id="new-chat-btn" class="btn-primary" style="width:100%; border-radius:var(--radius-sm); margin-bottom:0.75rem; font-size:0.82rem; padding: 0.45rem;">
                ✦ New Conversation
            </button>

            <!-- Categorized Nav links -->
            <nav style="display:flex; flex-direction:column; gap:0.75rem; flex-grow:1;">
                ${navItems.map(group => `
                    <div>
                        <div class="section-label" style="font-size:0.64rem; margin-bottom:0.2rem;">${group.category}</div>
                        <div style="display:flex; flex-direction:column; gap:0.15rem;">
                            ${group.items.map(item => `
                                <a href="#" class="nav-link ${state.currentView === item.view ? 'active' : ''}" data-view="${item.view}" style="padding: 0.45rem 0.75rem; font-size: 0.85rem;">
                                    <span class="nav-icon" style="font-size: 0.95rem;">${item.icon}</span>
                                    <span>${item.label}</span>
                                    ${state.currentView === item.view ? '<span style="margin-left:auto; width:5px; height:5px; background:var(--primary); border-radius:50%;"></span>' : ''}
                                </a>
                            `).join('')}
                        </div>
                    </div>
                `).join('')}
            </nav>

            <!-- Footer -->
            <div style="border-top: 1px solid var(--border); padding-top: 0.75rem; margin-top: 0.5rem;">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 0.4rem;">
                    <span style="font-size:0.7rem; color:var(--text-muted);">Research Papers</span>
                    <span class="badge badge-primary" style="font-size:0.64rem;">8 indexed</span>
                </div>
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 0.6rem;">
                    <span style="font-size:0.7rem; color:var(--text-muted);">AI Engine</span>
                    <span class="badge badge-success" style="font-size:0.64rem;">Gemini 3.6</span>
                </div>
                <button id="sidebar-settings-btn" class="btn-secondary" style="width:100%; font-size:0.78rem; padding:0.35rem;">
                    ⚙️ Settings
                </button>
                <div style="font-size:0.64rem; color:var(--text-muted); text-align:center; margin-top:0.5rem;">
                    LongevityLens Engine · v3.0
                </div>
            </div>
        </div>
    `;

    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', e => {
            e.preventDefault();
            navigateTo(e.target.closest('.nav-link').dataset.view);
        });
    });

    document.getElementById('new-chat-btn').addEventListener('click', () => {
        state.messages = [];
        localStorage.removeItem('ll_messages');
        navigateTo('chat');
    });

    const settingsBtn = document.getElementById('sidebar-settings-btn');
    if (settingsBtn) settingsBtn.addEventListener('click', showSettingsModal);
}

import { showSettingsModal, toggleSidebar, state } from '../main.js';

export function renderHeader() {
    const header = document.getElementById('header');
    
    let keyStatusText = "🟢 Free Demo Mode Active";
    let keyStatusColor = "rgba(0, 212, 170, 0.2)";
    let keyTextColor = "var(--primary)";

    if (state.apiKey) {
        keyStatusText = "🔑 Custom Key Active";
        keyStatusColor = "rgba(124, 92, 191, 0.2)";
        keyTextColor = "#a78bfa";
    } else if (!state.hasServerKey) {
        keyStatusText = "⚡ Local RAG Fallback Active";
        keyStatusColor = "rgba(245, 158, 11, 0.2)";
        keyTextColor = "var(--warning)";
    }

    header.innerHTML = `
        <div style="display: flex; align-items: center; gap: 1rem;">
            <button id="mobile-menu-btn" class="icon-btn hamburger hidden" style="${window.innerWidth <= 768 ? 'display: block;' : 'display: none;'}">
                ☰
            </button>
            <div style="display: flex; align-items: center; gap: 0.75rem;">
                <span style="font-size: 1.8rem; filter: drop-shadow(0 0 10px rgba(0,212,170,0.4));">🧬</span>
                <div style="display: flex; flex-direction: column;">
                    <h1 style="font-size: 1.2rem; line-height: 1.2; letter-spacing: -0.02em;">LongevityLens</h1>
                    <span style="font-size: 0.75rem; color: var(--text-secondary);">Health Research Copilot</span>
                </div>
            </div>
        </div>
        
        <div style="display: flex; align-items: center; gap: 1rem;">
            <div class="glass-panel" style="padding: 0.25rem 0.75rem; border-radius: 20px; font-size: 0.75rem; color: ${keyTextColor}; border-color: ${keyTextColor}; background: ${keyStatusColor}; display: flex; align-items: center; gap: 0.4rem;">
                ${keyStatusText}
            </div>

            <div class="glass-panel pulse" style="padding: 0.25rem 0.75rem; border-radius: 20px; font-size: 0.75rem; color: var(--warning); border-color: rgba(245, 158, 11, 0.3); background: rgba(245, 158, 11, 0.05); display: flex; align-items: center; gap: 0.4rem;">
                <span>ℹ️</span> Informational Use Only
            </div>
            <button id="header-settings-btn" class="icon-btn" title="Settings">⚙️</button>
        </div>
    `;
    
    document.getElementById('header-settings-btn').addEventListener('click', showSettingsModal);
    const mobileBtn = document.getElementById('mobile-menu-btn');
    if (mobileBtn) {
        mobileBtn.addEventListener('click', toggleSidebar);
    }
}

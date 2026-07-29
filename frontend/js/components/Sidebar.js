import { state, navigateTo, toggleSidebar } from '../main.js';

export function renderSidebar() {
    const sidebar = document.getElementById('sidebar');
    
    // Toggle class for mobile responsiveness
    if (state.sidebarOpen) {
        sidebar.classList.add('open');
    } else {
        sidebar.classList.remove('open');
    }
    
    sidebar.innerHTML = `
        <div style="padding: 1.5rem; display: flex; flex-direction: column; height: 100%;">
            <div style="margin-bottom: 1.5rem;">
                <button id="new-chat-btn" class="btn-primary" style="width: 100%; border-radius: 20px;">
                    <span>+</span> New Chat
                </button>
            </div>
            
            <nav style="display: flex; flex-direction: column; gap: 0.5rem; flex-grow: 1;">
                <a href="#" class="nav-link ${state.currentView === 'chat' ? 'active' : ''}" data-view="chat">
                    💬 Chat Research
                </a>
                <a href="#" class="nav-link ${state.currentView === 'epigenetics' ? 'active' : ''}" data-view="epigenetics">
                    🔬 Epigenetic DNA Clocks
                </a>
                <a href="#" class="nav-link ${state.currentView === 'bioage' ? 'active' : ''}" data-view="bioage">
                    🧬 PhenoAge Biological Audit
                </a>
                <a href="#" class="nav-link ${state.currentView === 'documents' ? 'active' : ''}" data-view="documents">
                    📄 Document Library
                </a>
                <a href="#" class="nav-link ${state.currentView === 'biomarkers' ? 'active' : ''}" data-view="biomarkers">
                    🧪 Biomarker Reference
                </a>
            </nav>
            
            <div style="margin-top: auto; padding-top: 1.5rem; border-top: 1px solid var(--border);">
                <div style="font-size: 0.75rem; color: var(--text-secondary); margin-bottom: 0.5rem; display: flex; justify-content: space-between;">
                    <span>Indexed Papers:</span>
                    <span id="sidebar-doc-count">${state.documents.length || 8}</span>
                </div>
                <div style="font-size: 0.7rem; color: var(--text-muted); text-align: center; margin-top: 1rem;">
                    FOXO Longevity Research Engine v1.2
                </div>
            </div>
        </div>
    `;
    
    // Add styles dynamically for nav links
    const styleId = 'sidebar-styles';
    if (!document.getElementById(styleId)) {
        const style = document.createElement('style');
        style.id = styleId;
        style.textContent = `
            .nav-link {
                display: flex;
                align-items: center;
                gap: 0.75rem;
                padding: 0.75rem 1rem;
                color: var(--text-secondary);
                text-decoration: none;
                border-radius: var(--radius-sm);
                transition: all var(--transition);
                font-weight: 500;
                font-size: 0.95rem;
            }
            .nav-link:hover {
                background: var(--surface);
                color: var(--text-primary);
            }
            .nav-link.active {
                background: rgba(0, 212, 170, 0.1);
                color: var(--primary);
                border-left: 3px solid var(--primary);
                border-radius: 0 var(--radius-sm) var(--radius-sm) 0;
            }
        `;
        document.head.appendChild(style);
    }
    
    // Attach event listeners
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            navigateTo(e.target.closest('.nav-link').dataset.view);
        });
    });
    
    document.getElementById('new-chat-btn').addEventListener('click', () => {
        state.messages = [];
        navigateTo('chat');
    });
}

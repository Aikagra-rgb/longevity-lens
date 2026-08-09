import { renderHeader } from './components/Header.js';
import { renderSidebar } from './components/Sidebar.js';
import { renderChat } from './components/Chat.js';
import { renderDocuments } from './components/DocumentUpload.js';
import { renderBiomarkers } from './components/BiomarkerPanel.js';
import { renderBioAgePanel } from './components/BioAgePanel.js';
import { renderEpigeneticPanel } from './components/EpigeneticPanel.js';
import { renderDashboardPanel } from './components/DashboardPanel.js';
import { renderTrajectoryPanel } from './components/TrajectoryPanel.js';
import { renderProtocolPanel } from './components/ProtocolPanel.js';
import { renderMultiClockPanel } from './components/MultiClockPanel.js';
import { renderConsensusPanel } from './components/ConsensusPanel.js';
import { checkHealth } from './utils/api.js';

export const state = {
    currentView: 'dashboard',
    messages: [],
    documents: [],
    apiKey: localStorage.getItem('longevitylens_api_key') || '',
    hasServerKey: false,
    sidebarOpen: window.innerWidth > 768
};

export async function init() {
    renderHeader();
    renderSidebar();

    // Check if server has Gemini API key
    try {
        const health = await checkHealth();
        if (health && health.has_api_key) {
            state.hasServerKey = true;
            renderHeader();
        }
    } catch (e) {
        console.warn('[LongevityLens] Health check warning:', e.message);
    }

    // Settings modal event wiring
    document.getElementById('close-settings').addEventListener('click', hideSettingsModal);

    document.getElementById('toggle-api-key').addEventListener('click', e => {
        const input = document.getElementById('api-key-input');
        const isHidden = input.type === 'password';
        input.type = isHidden ? 'text' : 'password';
        e.target.textContent = isHidden ? 'Hide' : 'Show';
    });

    document.getElementById('save-settings-btn').addEventListener('click', () => {
        const val = document.getElementById('api-key-input').value.trim();
        saveApiKey(val);
        hideSettingsModal();
        renderHeader();
        showToast('API key saved successfully', 'success');
    });

    document.getElementById('test-connection-btn').addEventListener('click', async () => {
        const val = document.getElementById('api-key-input').value.trim();
        const oldKey = state.apiKey;
        state.apiKey = val;
        showToast('Testing connection…', 'info');
        try {
            const res = await checkHealth();
            if (res && res.status === 'ok') {
                showToast('✓ Connection successful!', 'success');
            } else {
                showToast('Connection failed — check the key', 'error');
            }
        } catch (e) {
            showToast('Connection error: ' + e.message, 'error');
        } finally {
            state.apiKey = oldKey;
        }
    });

    // Only block with modal if no key anywhere
    if (!state.apiKey && !state.hasServerKey) {
        showSettingsModal();
    }

    // Responsive sidebar
    window.addEventListener('resize', () => {
        const shouldOpen = window.innerWidth > 768;
        if (shouldOpen !== state.sidebarOpen) {
            state.sidebarOpen = shouldOpen;
            renderSidebar();
        }
    });

    navigateTo(state.currentView);
}

export function navigateTo(view) {
    state.currentView = view;
    renderSidebar();
    renderHeader();

    const contentArea = document.getElementById('content-area');
    contentArea.innerHTML = '<div class="skeleton"></div>';

    if (window.innerWidth <= 768) {
        state.sidebarOpen = false;
        renderSidebar();
    }

    setTimeout(() => {
        switch (view) {
            case 'dashboard':   renderDashboardPanel();   break;
            case 'chat':        renderChat();             break;
            case 'consensus':   renderConsensusPanel();   break;
            case 'multiclock':  renderMultiClockPanel();  break;
            case 'bioage':      renderBioAgePanel();      break;
            case 'epigenetics': renderEpigeneticPanel();  break;
            case 'trajectory':  renderTrajectoryPanel();  break;
            case 'protocol':    renderProtocolPanel();    break;
            case 'documents':   renderDocuments();        break;
            case 'biomarkers':  renderBiomarkers();       break;
            default:            renderDashboardPanel();   break;
        }
    }, 50);
}

export function showSettingsModal() {
    const modal = document.getElementById('settings-modal');
    const input = document.getElementById('api-key-input');
    if (input) input.value = state.apiKey;
    if (modal) modal.classList.remove('hidden');
}

export function hideSettingsModal() {
    const modal = document.getElementById('settings-modal');
    if (modal) modal.classList.add('hidden');
}

export function saveApiKey(key) {
    state.apiKey = key;
    localStorage.setItem('longevitylens_api_key', key);
}

export function showToast(message, type = 'success') {
    const toast = document.getElementById('notification-toast');
    if (!toast) return;
    toast.textContent = message;
    toast.className = `toast ${type}`;
    clearTimeout(toast._timeout);
    toast._timeout = setTimeout(() => {
        toast.classList.add('hidden');
    }, 3200);
}

export function toggleSidebar() {
    state.sidebarOpen = !state.sidebarOpen;
    renderSidebar();
}

document.addEventListener('DOMContentLoaded', init);

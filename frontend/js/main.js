import { renderHeader } from './components/Header.js';
import { renderSidebar } from './components/Sidebar.js';
import { renderChat } from './components/Chat.js';
import { renderDocuments } from './components/DocumentUpload.js';
import { renderBiomarkers } from './components/BiomarkerPanel.js';
import { renderBioAgePanel } from './components/BioAgePanel.js';
import { getDocuments, checkHealth } from './utils/api.js';

export const state = {
    currentView: 'chat',
    messages: [],
    documents: [],
    apiKey: localStorage.getItem('longevitylens_api_key') || '',
    sidebarOpen: window.innerWidth > 768
};

export function init() {
    renderHeader();
    renderSidebar();
    
    // Settings modal handlers
    document.getElementById('close-settings').addEventListener('click', hideSettingsModal);
    document.getElementById('toggle-api-key').addEventListener('click', (e) => {
        const input = document.getElementById('api-key-input');
        if (input.type === 'password') {
            input.type = 'text';
            e.target.textContent = 'Hide';
        } else {
            input.type = 'password';
            e.target.textContent = 'Show';
        }
    });
    
    document.getElementById('save-settings-btn').addEventListener('click', () => {
        const val = document.getElementById('api-key-input').value;
        saveApiKey(val);
        hideSettingsModal();
        showToast('Settings saved successfully', 'success');
    });
    
    document.getElementById('test-connection-btn').addEventListener('click', async () => {
        const val = document.getElementById('api-key-input').value;
        const oldKey = state.apiKey;
        state.apiKey = val; // temporarily set for test
        try {
            const res = await checkHealth();
            if (res && res.status) {
                showToast('Connection successful!', 'success');
            } else {
                showToast('Connection failed. Please check your API key.', 'error');
            }
        } catch (e) {
            showToast('Connection error: ' + e.message, 'error');
        } finally {
            state.apiKey = oldKey; // restore
        }
    });

    if (!state.apiKey) {
        showSettingsModal();
    }

    // Handle resize for sidebar
    window.addEventListener('resize', () => {
        if (window.innerWidth > 768 && !state.sidebarOpen) {
            state.sidebarOpen = true;
            renderSidebar();
        } else if (window.innerWidth <= 768 && state.sidebarOpen) {
            state.sidebarOpen = false;
            renderSidebar();
        }
    });

    navigateTo(state.currentView);
}

export function navigateTo(view) {
    state.currentView = view;
    renderSidebar(); // update active state
    
    const contentArea = document.getElementById('content-area');
    contentArea.innerHTML = '<div class="skeleton" style="width:100%;height:100%;"></div>';
    
    // Close sidebar on mobile after navigation
    if (window.innerWidth <= 768) {
        state.sidebarOpen = false;
        renderSidebar();
    }
    
    setTimeout(() => {
        if (view === 'chat') {
            renderChat();
        } else if (view === 'bioage') {
            renderBioAgePanel();
        } else if (view === 'documents') {
            renderDocuments();
        } else if (view === 'biomarkers') {
            renderBiomarkers();
        }
    }, 50);
}

export function showSettingsModal() {
    const modal = document.getElementById('settings-modal');
    const input = document.getElementById('api-key-input');
    input.value = state.apiKey;
    modal.classList.remove('hidden');
}

export function hideSettingsModal() {
    const modal = document.getElementById('settings-modal');
    modal.classList.add('hidden');
}

export function saveApiKey(key) {
    state.apiKey = key;
    localStorage.setItem('longevitylens_api_key', key);
}

export function showToast(message, type = 'success') {
    const toast = document.getElementById('notification-toast');
    toast.textContent = message;
    toast.className = `toast ${type}`;
    
    setTimeout(() => {
        toast.classList.add('hidden');
    }, 3000);
}

export function toggleSidebar() {
    state.sidebarOpen = !state.sidebarOpen;
    renderSidebar();
}

document.addEventListener('DOMContentLoaded', init);

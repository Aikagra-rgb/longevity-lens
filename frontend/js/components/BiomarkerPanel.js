import { state, showToast } from '../main.js';
import { getBiomarkers, searchBiomarkers, getBiomarker } from '../utils/api.js';

let allCategories = [];
let currentCategory = 'All';
let searchTimeout = null;

export function renderBiomarkers() {
    const contentArea = document.getElementById('content-area');
    
    contentArea.innerHTML = `
        <div class="biomarker-container">
            <div class="biomarker-header">
                <h2>🧬 Biomarker Reference</h2>
                <div class="biomarker-search">
                    <span class="search-icon">🔍</span>
                    <input type="text" id="bm-search" class="input" placeholder="Search biomarkers...">
                </div>
            </div>
            
            <div class="category-tabs" id="category-tabs">
                <!-- Tabs will be rendered here -->
                <div class="skeleton" style="width: 80px; height: 32px; border-radius: 20px;"></div>
                <div class="skeleton" style="width: 120px; height: 32px; border-radius: 20px;"></div>
            </div>
            
            <div class="biomarker-grid" id="biomarker-grid">
                <!-- Cards will be rendered here -->
                <div class="skeleton" style="height: 150px; border-radius: var(--radius-md);"></div>
                <div class="skeleton" style="height: 150px; border-radius: var(--radius-md);"></div>
                <div class="skeleton" style="height: 150px; border-radius: var(--radius-md);"></div>
            </div>
        </div>

        <!-- Detail Modal -->
        <div id="biomarker-modal" class="modal-overlay hidden">
            <div class="modal-panel glass-panel" style="width: 95%; max-width: 700px; max-height: 90vh; overflow-y: auto;">
                <div class="modal-header">
                    <h2 id="modal-bm-name">Biomarker</h2>
                    <button id="close-bm-modal" class="icon-btn">✕</button>
                </div>
                <div id="modal-bm-content">
                    <div class="skeleton" style="height: 200px; width: 100%;"></div>
                </div>
            </div>
        </div>
    `;
    
    setupListeners();
    loadInitialData();
}

function setupListeners() {
    const searchInput = document.getElementById('bm-search');
    
    searchInput.addEventListener('input', (e) => {
        clearTimeout(searchTimeout);
        const query = e.target.value.trim();
        
        searchTimeout = setTimeout(() => {
            if (query) {
                performSearch(query);
            } else {
                renderCards(allCategories, 'All');
            }
        }, 300);
    });
    
    document.getElementById('close-bm-modal').addEventListener('click', () => {
        document.getElementById('biomarker-modal').classList.add('hidden');
    });
}

async function loadInitialData() {
    if (!state.apiKey) {
        document.getElementById('biomarker-grid').innerHTML = `<p style="color: var(--text-secondary); grid-column: 1/-1;">Please configure your API key.</p>`;
        return;
    }
    
    try {
        const res = await getBiomarkers();
        allCategories = res.categories || [];
        renderTabs(allCategories);
        renderCards(allCategories, 'All');
    } catch (e) {
        document.getElementById('biomarker-grid').innerHTML = `<p style="color: var(--error); grid-column: 1/-1;">Error: ${e.message}</p>`;
    }
}

async function performSearch(query) {
    const grid = document.getElementById('biomarker-grid');
    grid.innerHTML = '<div class="skeleton" style="height: 150px; border-radius: var(--radius-md);"></div>';
    
    try {
        const res = await searchBiomarkers(query);
        const results = res.results || [];
        
        if (results.length === 0) {
            grid.innerHTML = '<p style="color: var(--text-secondary); grid-column: 1/-1;">No biomarkers found.</p>';
            return;
        }
        
        grid.innerHTML = results.map(bm => createCardHtml(bm)).join('');
        attachCardListeners();
    } catch (e) {
        grid.innerHTML = `<p style="color: var(--error); grid-column: 1/-1;">Search failed: ${e.message}</p>`;
    }
}

function renderTabs(categories) {
    const tabsContainer = document.getElementById('category-tabs');
    
    let html = `<div class="category-tab active" data-category="All">All</div>`;
    categories.forEach(cat => {
        html += `<div class="category-tab" data-category="${cat.name}">${cat.icon} ${cat.name}</div>`;
    });
    
    tabsContainer.innerHTML = html;
    
    // Add click listeners
    document.querySelectorAll('.category-tab').forEach(tab => {
        tab.addEventListener('click', (e) => {
            document.querySelectorAll('.category-tab').forEach(t => t.classList.remove('active'));
            e.target.classList.add('active');
            
            currentCategory = e.target.dataset.category;
            document.getElementById('bm-search').value = ''; // clear search on tab change
            renderCards(allCategories, currentCategory);
        });
    });
}

function renderCards(categories, filterCategory) {
    const grid = document.getElementById('biomarker-grid');
    
    let allBms = [];
    if (filterCategory === 'All') {
        categories.forEach(c => allBms = allBms.concat(c.biomarkers));
    } else {
        const cat = categories.find(c => c.name === filterCategory);
        if (cat) allBms = cat.biomarkers;
    }
    
    if (allBms.length === 0) {
        grid.innerHTML = '<p style="color: var(--text-secondary); grid-column: 1/-1;">No biomarkers found.</p>';
        return;
    }
    
    grid.innerHTML = allBms.map(bm => createCardHtml(bm)).join('');
    attachCardListeners();
}

function createCardHtml(bm) {
    return `
        <div class="biomarker-card glass-panel" data-id="${bm.abbreviation}">
            <div class="biomarker-card-header">
                <div class="biomarker-name-wrap">
                    <span class="biomarker-name">${bm.name}</span>
                    <span class="biomarker-abbr">${bm.abbreviation}</span>
                </div>
                <div class="category-badge">
                    ${bm.category}
                </div>
            </div>
            
            <div class="range-visualizer-wrap">
                <div class="range-labels">
                    <span>${bm.reference_range.min || 0}</span>
                    <span style="font-weight: 500;">${bm.unit}</span>
                    <span>${bm.reference_range.max || '+'}</span>
                </div>
                <div class="range-bar-container">
                    <!-- Optimal range highlight (approximate for demo) -->
                    <div class="range-optimal-highlight" style="left: 30%; right: 30%;"></div>
                </div>
            </div>
        </div>
    `;
}

function attachCardListeners() {
    document.querySelectorAll('.biomarker-card').forEach(card => {
        card.addEventListener('click', async () => {
            const id = card.dataset.id;
            openModal(id);
        });
    });
}

async function openModal(id) {
    const modal = document.getElementById('biomarker-modal');
    const content = document.getElementById('modal-bm-content');
    const nameEl = document.getElementById('modal-bm-name');
    
    modal.classList.remove('hidden');
    content.innerHTML = '<div class="skeleton" style="height: 200px; width: 100%;"></div>';
    nameEl.textContent = 'Loading...';
    
    try {
        const bm = await getBiomarker(id);
        
        nameEl.textContent = `${bm.name} (${bm.abbreviation})`;
        
        let html = `
            <div style="display: flex; gap: 1rem; margin-bottom: 1.5rem; flex-wrap: wrap;">
                <span class="category-badge">${bm.category}</span>
                <span class="category-badge">Unit: ${bm.unit}</span>
            </div>
            
            <div class="range-visualizer-wrap" style="background: var(--surface); padding: 1rem; border-radius: var(--radius-sm); border: 1px solid var(--border);">
                <div style="margin-bottom: 0.5rem; font-size: 0.9rem;">
                    <strong>Reference Range:</strong> ${bm.reference_range.min} - ${bm.reference_range.max} ${bm.unit}<br>
                    <strong style="color: var(--success);">Optimal Range:</strong> ${bm.optimal_range.min} - ${bm.optimal_range.max} ${bm.unit}
                </div>
                <div class="range-bar-container" style="height: 12px; margin-top: 1rem;">
                    <div class="range-optimal-highlight" style="left: 30%; right: 30%;"></div>
                </div>
            </div>
        `;
        
        if (bm.elevated_indicates && bm.elevated_indicates.length > 0) {
            html += `
                <div class="detail-section">
                    <h4>📈 When Elevated Indicates:</h4>
                    <div class="pill-list">
                        ${bm.elevated_indicates.map(item => `<span class="pill danger">${item}</span>`).join('')}
                    </div>
                </div>
            `;
        }
        
        if (bm.low_indicates && bm.low_indicates.length > 0) {
            html += `
                <div class="detail-section">
                    <h4>📉 When Low Indicates:</h4>
                    <div class="pill-list">
                        ${bm.low_indicates.map(item => `<span class="pill info">${item}</span>`).join('')}
                    </div>
                </div>
            `;
        }
        
        if (bm.lifestyle_factors) {
            html += `
                <div class="detail-section">
                    <h4>🧘 Lifestyle Factors:</h4>
                    <div style="display: flex; flex-direction: column; gap: 0.75rem;">
                        <div>
                            <span style="font-size: 0.8rem; color: var(--text-secondary); margin-bottom: 0.25rem; display: block;">Increases Levels:</span>
                            <div class="pill-list">
                                ${(bm.lifestyle_factors.increases || []).map(i => `<span class="pill danger">${i}</span>`).join('')}
                            </div>
                        </div>
                        <div>
                            <span style="font-size: 0.8rem; color: var(--text-secondary); margin-bottom: 0.25rem; display: block;">Decreases Levels:</span>
                            <div class="pill-list">
                                ${(bm.lifestyle_factors.decreases || []).map(i => `<span class="pill success">${i}</span>`).join('')}
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }
        
        if (bm.longevity_relevance) {
            html += `
                <div class="detail-section">
                    <h4>🧬 Longevity Relevance:</h4>
                    <div class="longevity-note">
                        ${bm.longevity_relevance}
                    </div>
                </div>
            `;
        }
        
        content.innerHTML = html;
        
    } catch (e) {
        content.innerHTML = `<p style="color: var(--error);">Failed to load details: ${e.message}</p>`;
        nameEl.textContent = 'Error';
    }
}

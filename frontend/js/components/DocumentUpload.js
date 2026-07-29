import { state, showToast } from '../main.js';
import { uploadDocument, getDocuments, deleteDocument, seedDocuments } from '../utils/api.js';

export function renderDocuments() {
    const contentArea = document.getElementById('content-area');
    
    contentArea.innerHTML = `
        <div style="padding: 2rem; max-width: 1000px; margin: 0 auto;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
                <h2>📄 Document Library</h2>
                <button id="seed-docs-btn" class="btn-secondary">
                    <span>🌱</span> Seed Sample Data
                </button>
            </div>
            
            <!-- Upload Zone -->
            <div id="drop-zone" class="glass-panel" style="padding: 3rem; text-align: center; border: 2px dashed var(--border); margin-bottom: 2rem; cursor: pointer; transition: all var(--transition);">
                <div style="font-size: 3rem; margin-bottom: 1rem; color: var(--primary);">📥</div>
                <h3>Drop PDF here or click to browse</h3>
                <p style="color: var(--text-secondary); margin-top: 0.5rem;">Supported format: .pdf</p>
                <input type="file" id="file-input" accept=".pdf" style="display: none;">
                
                <div id="upload-progress" class="hidden" style="margin-top: 1.5rem;">
                    <div style="height: 6px; background: rgba(0,0,0,0.5); border-radius: 3px; overflow: hidden; width: 60%; margin: 0 auto;">
                        <div class="skeleton" style="height: 100%; width: 100%;"></div>
                    </div>
                    <p style="font-size: 0.85rem; color: var(--primary); margin-top: 0.5rem;">Uploading and chunking...</p>
                </div>
            </div>
            
            <!-- Document List -->
            <h3>Indexed Documents</h3>
            <div id="document-list" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 1rem; margin-top: 1rem;">
                <div class="skeleton" style="height: 100px; width: 100%;"></div>
                <div class="skeleton" style="height: 100px; width: 100%;"></div>
            </div>
        </div>
    `;
    
    setupUploadHandlers();
    loadDocuments();
}

function setupUploadHandlers() {
    const dropZone = document.getElementById('drop-zone');
    const fileInput = document.getElementById('file-input');
    const seedBtn = document.getElementById('seed-docs-btn');
    
    dropZone.addEventListener('click', () => {
        if (!document.getElementById('upload-progress').classList.contains('hidden')) return;
        fileInput.click();
    });
    
    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.style.borderColor = 'var(--primary)';
        dropZone.style.background = 'rgba(0, 212, 170, 0.05)';
    });
    
    dropZone.addEventListener('dragleave', (e) => {
        e.preventDefault();
        dropZone.style.borderColor = 'var(--border)';
        dropZone.style.background = 'var(--surface)';
    });
    
    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.style.borderColor = 'var(--border)';
        dropZone.style.background = 'var(--surface)';
        
        if (e.dataTransfer.files.length) {
            handleUpload(e.dataTransfer.files[0]);
        }
    });
    
    fileInput.addEventListener('change', (e) => {
        if (e.target.files.length) {
            handleUpload(e.target.files[0]);
        }
    });
    
    seedBtn.addEventListener('click', async () => {
        if (!state.apiKey) {
            showToast('API Key required', 'error');
            return;
        }
        
        try {
            seedBtn.disabled = true;
            seedBtn.innerHTML = '<span>⏳</span> Seeding...';
            await seedDocuments();
            showToast('Sample data seeded successfully', 'success');
            loadDocuments();
        } catch (e) {
            showToast('Failed to seed: ' + e.message, 'error');
        } finally {
            seedBtn.disabled = false;
            seedBtn.innerHTML = '<span>🌱</span> Seed Sample Data';
        }
    });
}

async function handleUpload(file) {
    if (file.type !== 'application/pdf') {
        showToast('Only PDF files are supported', 'error');
        return;
    }
    
    if (!state.apiKey) {
        showToast('API Key required', 'error');
        return;
    }
    
    const progress = document.getElementById('upload-progress');
    progress.classList.remove('hidden');
    
    try {
        await uploadDocument(file);
        showToast(`${file.name} uploaded successfully`, 'success');
        loadDocuments();
    } catch (e) {
        showToast('Upload failed: ' + e.message, 'error');
    } finally {
        progress.classList.add('hidden');
        document.getElementById('file-input').value = '';
    }
}

async function loadDocuments() {
    const list = document.getElementById('document-list');
    
    if (!state.apiKey) {
        list.innerHTML = `<p style="color: var(--text-secondary); grid-column: 1/-1;">Please configure your API key to view documents.</p>`;
        return;
    }
    
    try {
        const res = await getDocuments();
        state.documents = res.documents || [];
        
        // Update sidebar count
        const countSpan = document.getElementById('sidebar-doc-count');
        if (countSpan) countSpan.textContent = state.documents.length;
        
        if (state.documents.length === 0) {
            list.innerHTML = `
                <div style="grid-column: 1/-1; text-align: center; padding: 2rem; background: var(--surface); border-radius: var(--radius-md); border: 1px dashed var(--border);">
                    <p style="color: var(--text-secondary);">No documents indexed yet. Seed sample data or upload a PDF.</p>
                </div>
            `;
            return;
        }
        
        list.innerHTML = state.documents.map(doc => `
            <div class="glass-panel" style="padding: 1rem; display: flex; flex-direction: column; justify-content: space-between;">
                <div>
                    <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.5rem;">
                        <h4 style="margin: 0; font-size: 1rem; word-break: break-word;">${escapeHtml(doc.name)}</h4>
                        <span style="font-size: 1.5rem;">📄</span>
                    </div>
                    <div style="display: flex; gap: 0.5rem; margin-bottom: 1rem;">
                        <span style="font-size: 0.75rem; background: rgba(255,255,255,0.1); padding: 0.1rem 0.4rem; border-radius: 4px;">
                            ${doc.type === 'sample' ? 'Sample' : 'Uploaded'}
                        </span>
                        <span style="font-size: 0.75rem; color: var(--text-secondary);">
                            ${doc.pages} pages • ${doc.chunks} chunks
                        </span>
                    </div>
                </div>
                <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid var(--border); padding-top: 0.75rem;">
                    <span style="font-size: 0.75rem; color: var(--text-muted);">${new Date(doc.uploaded_at).toLocaleDateString()}</span>
                    <button class="icon-btn delete-doc-btn" data-id="${doc.id}" title="Delete">🗑️</button>
                </div>
            </div>
        `).join('');
        
        // Add delete handlers
        document.querySelectorAll('.delete-doc-btn').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                if (confirm('Are you sure you want to delete this document?')) {
                    const id = e.target.closest('button').dataset.id;
                    try {
                        await deleteDocument(id);
                        showToast('Document deleted', 'success');
                        loadDocuments();
                    } catch (err) {
                        showToast('Failed to delete: ' + err.message, 'error');
                    }
                }
            });
        });
        
    } catch (e) {
        list.innerHTML = `<p style="color: var(--error); grid-column: 1/-1;">Error loading documents: ${e.message}</p>`;
    }
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

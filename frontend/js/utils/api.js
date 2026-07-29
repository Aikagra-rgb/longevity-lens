import { state } from '../main.js';

const API_BASE = ''; // hosted on same origin

export function getApiKey() {
    return state.apiKey;
}

export function getHeaders() {
    return {
        'X-API-Key': getApiKey(),
        'Content-Type': 'application/json'
    };
}

export async function chatStream(query, history, onToken, onCitations, onBiomarkers, onDone, onError) {
    try {
        const response = await fetch(`${API_BASE}/api/chat`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify({ query, history })
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';
        
        while (true) {
            const { value, done } = await reader.read();
            if (done) break;
            
            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n\n');
            buffer = lines.pop(); // keep the last incomplete chunk
            
            for (const chunk of lines) {
                if (!chunk.trim()) continue;
                const linesInChunk = chunk.split('\n');
                let eventType = 'message';
                let data = null;
                
                for (const line of linesInChunk) {
                    if (line.startsWith('event:')) {
                        eventType = line.substring(6).trim();
                    } else if (line.startsWith('data:')) {
                        try {
                            data = JSON.parse(line.substring(5).trim());
                        } catch(e) {
                            // ignore parse error for partial
                        }
                    }
                }
                
                if (data) {
                    if (eventType === 'token') onToken(data.content);
                    else if (eventType === 'citations') onCitations(data.citations);
                    else if (eventType === 'biomarkers') onBiomarkers(data.biomarkers);
                    else if (eventType === 'done') onDone();
                    else if (eventType === 'error') onError(data.message);
                }
            }
        }
        onDone();
    } catch (e) {
        onError(e.message);
    }
}

export async function uploadDocument(file) {
    const formData = new FormData();
    formData.append('file', file);
    
    const res = await fetch(`${API_BASE}/api/documents/upload`, {
        method: 'POST',
        headers: {
            'X-API-Key': getApiKey()
        },
        body: formData
    });
    if(!res.ok) throw new Error('Upload failed');
    return res.json();
}

export async function getDocuments() {
    const res = await fetch(`${API_BASE}/api/documents`, { headers: getHeaders() });
    if(!res.ok) throw new Error('Failed to fetch documents');
    return res.json();
}

export async function deleteDocument(id) {
    const res = await fetch(`${API_BASE}/api/documents/${id}`, { 
        method: 'DELETE',
        headers: getHeaders()
    });
    if(!res.ok) throw new Error('Failed to delete document');
    return res.json();
}

export async function seedDocuments() {
    const res = await fetch(`${API_BASE}/api/documents/seed`, { 
        method: 'POST',
        headers: getHeaders()
    });
    if(!res.ok) throw new Error('Failed to seed documents');
    return res.json();
}

export async function getBiomarkers() {
    const res = await fetch(`${API_BASE}/api/biomarkers`, { headers: getHeaders() });
    if(!res.ok) throw new Error('Failed to fetch biomarkers');
    return res.json();
}

export async function searchBiomarkers(query) {
    const res = await fetch(`${API_BASE}/api/biomarkers/search?q=${encodeURIComponent(query)}`, { headers: getHeaders() });
    if(!res.ok) throw new Error('Search failed');
    return res.json();
}

export async function getBiomarker(id) {
    const res = await fetch(`${API_BASE}/api/biomarkers/${id}`, { headers: getHeaders() });
    if(!res.ok) throw new Error('Fetch failed');
    return res.json();
}

export async function calculateBioAge(chronological_age, labs) {
    const res = await fetch(`${API_BASE}/api/lab-reports/calculate-age`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ chronological_age, labs })
    });
    if(!res.ok) throw new Error('Biological age calculation failed');
    return res.json();
}

export async function parseLabPdf(file, chronological_age = 45) {
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch(`${API_BASE}/api/lab-reports/parse-pdf?chronological_age=${chronological_age}`, {
        method: 'POST',
        headers: { 'X-API-Key': getApiKey() },
        body: formData
    });
    if(!res.ok) throw new Error('Parsing lab PDF failed');
    return res.json();
}

export async function exportReport(bio_age_data = null, messages = [], biomarkers = []) {
    const res = await fetch(`${API_BASE}/api/reports/export`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ bio_age_data, messages, biomarkers })
    });
    if(!res.ok) throw new Error('Report export failed');
    return res.blob();
}

export async function checkHealth() {
    const res = await fetch(`${API_BASE}/api/health`, { headers: getHeaders() });
    if(!res.ok) throw new Error('Health check failed');
    return res.json();
}

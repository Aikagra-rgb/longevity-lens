import { state, showToast } from '../main.js';
import { chatStream } from '../utils/api.js';
import { renderMarkdown } from '../utils/markdown.js';

export function renderChat() {
    const contentArea = document.getElementById('content-area');
    
    contentArea.innerHTML = `
        <div class="chat-container">
            <div id="chat-messages" class="chat-messages">
                <!-- Messages go here -->
            </div>
            
            <div class="chat-input-area">
                <div class="chat-input-wrapper">
                    <textarea id="chat-input" class="chat-input" placeholder="Ask about longevity biomarkers, research papers, or biological age..." rows="1"></textarea>
                    <button id="chat-send-btn" class="chat-send-btn">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <line x1="22" y1="2" x2="11" y2="13"></line>
                            <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    `;
    
    const messagesContainer = document.getElementById('chat-messages');
    const input = document.getElementById('chat-input');
    const sendBtn = document.getElementById('chat-send-btn');
    
    // Auto-resize textarea
    input.addEventListener('input', function() {
        this.style.height = 'auto';
        this.style.height = (this.scrollHeight) + 'px';
    });
    
    // Enter to send
    input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            const text = input.value.trim();
            if (text) {
                input.value = '';
                input.style.height = 'auto';
                sendMessage(text);
            }
        }
    });
    
    sendBtn.addEventListener('click', () => {
        const text = input.value.trim();
        if (text) {
            input.value = '';
            input.style.height = 'auto';
            sendMessage(text);
        }
    });
    
    renderMessages();
}

function renderMessages() {
    const container = document.getElementById('chat-messages');
    if (!container) return;
    
    if (state.messages.length === 0) {
        container.innerHTML = `
            <div class="empty-state fade-in">
                <div class="empty-icon pulse">🧬</div>
                <h2>Longevity & Healthspan Research Copilot</h2>
                <p>Explore clinical research papers, biomarker targets, and epigenetic clocks</p>
                <div class="starter-chips">
                    <div class="starter-chip">🔥 What does an elevated CRP marker indicate, and what lifestyle factors lower it?</div>
                    <div class="starter-chip">🔬 Explain Horvath DNAm Age vs. GrimAge mortality clock</div>
                    <div class="starter-chip">⚡ How does fasting insulin affect metabolic biological aging?</div>
                    <div class="starter-chip">🫀 What is the optimal ApoB target for cardiovascular longevity?</div>
                    <div class="starter-chip">🧪 What are optimal ranges for key inflammaging markers?</div>
                </div>
            </div>
        `;
        
        document.querySelectorAll('.starter-chip').forEach(chip => {
            chip.addEventListener('click', (e) => {
                const text = e.target.textContent.replace(/^[\u1F300-\u1F9FF\u2600-\u26FF]\s*/, '');
                sendMessage(text);
            });
        });
        return;
    }
    
    container.innerHTML = '';
    
    state.messages.forEach((msg, index) => {
        const msgDiv = document.createElement('div');
        msgDiv.className = `chat-message ${msg.role}`;
        
        const avatar = msg.role === 'user' ? '👤' : '🧬';
        let contentHtml = msg.role === 'assistant' ? renderMarkdown(msg.content) : escapeHtml(msg.content);
        
        // Citations HTML
        let citationsHtml = '';
        if (msg.citations && msg.citations.length > 0) {
            citationsHtml = `
                <div class="citations-panel">
                    <div style="font-weight: 500; font-size: 0.8rem; text-transform: uppercase; margin-bottom: 0.3rem;">Cited Literature & Evidence Context</div>
                    ${msg.citations.map((c, i) => `
                        <div class="citation-card glass-panel">
                            <strong>[${i+1}] ${c.source}</strong> - ${c.section}<br>
                            "${c.text}"
                        </div>
                    `).join('')}
                </div>
            `;
        }
        
        // Biomarkers HTML
        let biomarkersHtml = '';
        if (msg.biomarkers && msg.biomarkers.length > 0) {
            biomarkersHtml = `
                <div style="margin-top: 0.5rem; display: flex; flex-wrap: wrap; gap: 0.5rem;">
                    ${msg.biomarkers.map(b => `
                        <span class="biomarker-inline" title="${b.name}">
                            🧪 ${b.abbreviation}: Ref ${b.reference_range.min}-${b.reference_range.max} ${b.unit} (Optimal < ${b.optimal_range.max})
                        </span>
                    `).join('')}
                </div>
            `;
        }
        
        msgDiv.innerHTML = `
            <div class="message-avatar">${avatar}</div>
            <div class="message-content-wrapper" style="flex-grow: 1;">
                <div class="message-content">${contentHtml}</div>
                ${biomarkersHtml}
                ${citationsHtml}
            </div>
        `;
        
        container.appendChild(msgDiv);
    });
    
    scrollToBottom();
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function scrollToBottom() {
    const container = document.getElementById('chat-messages');
    if (container) {
        container.scrollTop = container.scrollHeight;
    }
}

function sendMessage(text) {
    // Add user message
    state.messages.push({ role: 'user', content: text });
    
    // Add empty assistant message
    const assistantIndex = state.messages.length;
    state.messages.push({ role: 'assistant', content: '', citations: [], biomarkers: [] });
    
    renderMessages();
    
    const container = document.getElementById('chat-messages');
    
    // Add typing indicator
    const typingIndicator = document.createElement('div');
    typingIndicator.id = 'typing-indicator';
    typingIndicator.className = 'chat-message assistant';
    typingIndicator.innerHTML = `
        <div class="message-avatar">🧬</div>
        <div class="message-content-wrapper">
            <div class="message-content" style="padding: 0;">
                <div class="typing-indicator">
                    <span></span><span></span><span></span>
                </div>
            </div>
        </div>
    `;
    container.appendChild(typingIndicator);
    scrollToBottom();
    
    const input = document.getElementById('chat-input');
    const sendBtn = document.getElementById('chat-send-btn');
    input.disabled = true;
    sendBtn.disabled = true;
    
    // Prepare history format for API
    const history = state.messages.slice(0, -1).map(m => ({
        role: m.role,
        content: m.content
    }));
    
    let currentContent = '';
    
    chatStream(text, history, 
        (token) => {
            const ti = document.getElementById('typing-indicator');
            if (ti) ti.remove();
            
            currentContent += token;
            state.messages[assistantIndex].content = currentContent;
            
            renderMessages();
        },
        (citations) => {
            state.messages[assistantIndex].citations = citations;
        },
        (biomarkers) => {
            state.messages[assistantIndex].biomarkers = biomarkers;
        },
        () => {
            const ti = document.getElementById('typing-indicator');
            if (ti) ti.remove();
            
            renderMessages();
            input.disabled = false;
            sendBtn.disabled = false;
            input.focus();
        },
        (error) => {
            showToast('Error: ' + error, 'error');
            const ti = document.getElementById('typing-indicator');
            if (ti) ti.remove();
            
            input.disabled = false;
            sendBtn.disabled = false;
        }
    );
}

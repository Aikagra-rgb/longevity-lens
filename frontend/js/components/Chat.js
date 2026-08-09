import { state } from '../main.js';
import { chatStream } from '../utils/api.js';
import { renderMarkdown } from '../utils/markdown.js';

const MODEL_NAME = 'gemini-3.6-flash';

// Persist messages to localStorage
function saveMessages() {
    try { localStorage.setItem('ll_messages', JSON.stringify(state.messages)); } catch(e) {}
}
function loadMessages() {
    try {
        const saved = localStorage.getItem('ll_messages');
        if (saved) state.messages = JSON.parse(saved);
    } catch(e) {}
}

export function renderChat() {
    loadMessages();
    const contentArea = document.getElementById('content-area');
    contentArea.innerHTML = `
        <div class="chat-container">
            <div id="chat-messages" class="chat-messages"></div>
            <div class="chat-input-area">
                <div class="chat-input-wrapper">
                    <textarea id="chat-input" class="chat-input" placeholder="Ask about longevity biomarkers, epigenetic clocks, or biological age research…" rows="1"></textarea>
                    <button id="chat-send-btn" class="chat-send-btn" title="Send (Enter)">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                            <line x1="22" y1="2" x2="11" y2="13"></line>
                            <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                        </svg>
                    </button>
                </div>
                <div style="text-align:center; margin-top:0.5rem; font-size:0.7rem; color:var(--text-muted);">
                    Powered by <span style="color:var(--primary); font-weight:600;">Gemini 3.6-flash</span> · RAG over 8+ longevity research papers · Not medical advice
                </div>
            </div>
        </div>
    `;

    const input = document.getElementById('chat-input');
    const sendBtn = document.getElementById('chat-send-btn');

    // Auto-resize textarea
    input.addEventListener('input', function() {
        this.style.height = 'auto';
        this.style.height = Math.min(this.scrollHeight, 150) + 'px';
    });

    input.addEventListener('keydown', e => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            const text = input.value.trim();
            if (text) { input.value = ''; input.style.height = 'auto'; sendMessage(text); }
        }
    });

    sendBtn.addEventListener('click', () => {
        const text = input.value.trim();
        if (text) { input.value = ''; input.style.height = 'auto'; sendMessage(text); }
    });

    renderMessages();
    input.focus();
}

function renderMessages() {
    const container = document.getElementById('chat-messages');
    if (!container) return;

    if (state.messages.length === 0) {
        container.innerHTML = `
            <div class="empty-state fade-in">
                <div class="empty-logo">🧬</div>
                <h2>Longevity Research Copilot</h2>
                <p>Ask me anything about longevity science — biomarkers, epigenetic clocks, biological age, or published research.</p>
                <div class="starter-chips">
                    <div class="starter-chip" data-prompt="What does an elevated CRP marker indicate for longevity, and which lifestyle interventions lower it most effectively?">🔥 What does elevated CRP indicate for longevity?</div>
                    <div class="starter-chip" data-prompt="Explain Horvath DNAm Age vs GrimAge mortality clock — what are the key biological differences?">🔬 Horvath DNAm Age vs GrimAge — what's the difference?</div>
                    <div class="starter-chip" data-prompt="How does fasting insulin resistance affect biological aging pace at the cellular level?">⚡ How does insulin resistance accelerate biological aging?</div>
                    <div class="starter-chip" data-prompt="What is the optimal ApoB target for cardiovascular longevity and how does it differ from standard LDL guidelines?">🫀 What's the optimal ApoB for cardiovascular longevity?</div>
                    <div class="starter-chip" data-prompt="What are the key inflammaging biomarkers and their optimal ranges for longevity?">🧪 Key inflammaging biomarkers and optimal ranges?</div>
                    <div class="starter-chip" data-prompt="How do telomere length, NAD+ levels, and senescent cell burden relate to biological aging?">🔭 Telomeres, NAD+, and senescence — how are they connected?</div>
                </div>
            </div>
        `;
        document.querySelectorAll('.starter-chip').forEach(chip => {
            chip.addEventListener('click', e => {
                const prompt = e.currentTarget.dataset.prompt;
                if (prompt) sendMessage(prompt);
            });
        });
        return;
    }

    container.innerHTML = '';
    state.messages.forEach((msg, index) => {
        const div = document.createElement('div');
        div.className = `chat-message ${msg.role}`;
        div.dataset.index = index;

        const contentHtml = msg.role === 'assistant'
            ? renderMarkdown(msg.content || '')
            : escapeHtml(msg.content || '');

        const citationsHtml = (msg.citations && msg.citations.length > 0) ? `
            <div class="citations-panel">
                <div style="font-size:0.72rem; font-weight:600; text-transform:uppercase; letter-spacing:0.06em; color:var(--text-muted); margin-bottom:0.5rem;">📚 Evidence & Citations</div>
                ${msg.citations.map((c, i) => `
                    <div class="citation-card">
                        <strong style="color:var(--primary);">[${i+1}]</strong> ${c.source} — <em>${c.section}</em><br>
                        <span style="opacity:0.8;">"${c.text}"</span>
                    </div>
                `).join('')}
            </div>
        ` : '';

        const biomarkersHtml = (msg.biomarkers && msg.biomarkers.length > 0) ? `
            <div style="display:flex; flex-wrap:wrap; gap:0.4rem; max-width:680px;">
                ${msg.biomarkers.map(b => `
                    <span class="biomarker-inline" title="${b.name}: Ref ${b.reference_range.min}–${b.reference_range.max} ${b.unit}">
                        🧪 ${b.abbreviation}: ${b.reference_range.min}–${b.reference_range.max} ${b.unit}
                    </span>
                `).join('')}
            </div>
        ` : '';

        const metaHtml = msg.role === 'assistant' ? `
            <div class="message-meta">
                <div class="model-badge">
                    <span class="dot"></span>
                    ${MODEL_NAME}
                </div>
                <button class="copy-btn" data-index="${index}" title="Copy response">⎘ Copy</button>
            </div>
        ` : '';

        div.innerHTML = `
            <div class="message-avatar">${msg.role === 'user' ? '👤' : '🧬'}</div>
            <div class="message-content-wrapper">
                <div class="message-content">${contentHtml}</div>
                ${biomarkersHtml}
                ${citationsHtml}
                ${metaHtml}
            </div>
        `;
        container.appendChild(div);
    });

    // Copy button handlers
    container.querySelectorAll('.copy-btn').forEach(btn => {
        btn.addEventListener('click', e => {
            const idx = parseInt(e.currentTarget.dataset.index);
            const text = state.messages[idx]?.content || '';
            navigator.clipboard.writeText(text).then(() => {
                e.currentTarget.textContent = '✓ Copied';
                setTimeout(() => { e.currentTarget.textContent = '⎘ Copy'; }, 1500);
            });
        });
    });

    scrollToBottom();
}

function escapeHtml(text) {
    const d = document.createElement('div');
    d.textContent = text;
    return d.innerHTML;
}

function scrollToBottom() {
    const c = document.getElementById('chat-messages');
    if (c) c.scrollTop = c.scrollHeight;
}

function sendMessage(text) {
    state.messages.push({ role: 'user', content: text });
    const assistantIndex = state.messages.length;
    state.messages.push({ role: 'assistant', content: '', citations: [], biomarkers: [] });
    renderMessages();

    const container = document.getElementById('chat-messages');

    // Typing indicator
    const typingDiv = document.createElement('div');
    typingDiv.id = 'typing-indicator';
    typingDiv.className = 'chat-message assistant';
    typingDiv.innerHTML = `
        <div class="message-avatar">🧬</div>
        <div class="message-content-wrapper">
            <div class="message-content" style="padding:0.6rem 1rem;">
                <div class="typing-indicator"><span></span><span></span><span></span></div>
            </div>
        </div>
    `;
    container.appendChild(typingDiv);
    scrollToBottom();

    const input = document.getElementById('chat-input');
    const sendBtn = document.getElementById('chat-send-btn');
    if (input) input.disabled = true;
    if (sendBtn) sendBtn.disabled = true;

    // Add streaming class to last assistant message after first token
    let streamingStarted = false;

    const history = state.messages.slice(0, -1).map(m => ({ role: m.role, content: m.content }));
    let currentContent = '';

    chatStream(
        text, history,
        (token) => {
            const ti = document.getElementById('typing-indicator');
            if (ti) ti.remove();

            if (!streamingStarted) {
                streamingStarted = true;
                // Find assistant message div and add streaming class
                const msgDivs = document.querySelectorAll('.chat-message.assistant');
                if (msgDivs.length > 0) {
                    msgDivs[msgDivs.length - 1].classList.add('streaming');
                }
            }

            currentContent += token;
            state.messages[assistantIndex].content = currentContent;

            // Update just the content div without full re-render for performance
            const msgDivs = document.querySelectorAll('.chat-message.assistant');
            if (msgDivs.length > 0) {
                const lastMsg = msgDivs[msgDivs.length - 1];
                const contentDiv = lastMsg.querySelector('.message-content');
                if (contentDiv) contentDiv.innerHTML = renderMarkdown(currentContent);
            }
            scrollToBottom();
        },
        (citations) => { state.messages[assistantIndex].citations = citations; },
        (biomarkers) => { state.messages[assistantIndex].biomarkers = biomarkers; },
        () => {
            const ti = document.getElementById('typing-indicator');
            if (ti) ti.remove();
            // Remove streaming glow
            document.querySelectorAll('.chat-message.assistant.streaming').forEach(el => el.classList.remove('streaming'));
            saveMessages();
            renderMessages();
            if (input) { input.disabled = false; input.focus(); }
            if (sendBtn) sendBtn.disabled = false;
        },
        (error) => {
            const ti = document.getElementById('typing-indicator');
            if (ti) ti.remove();
            document.querySelectorAll('.chat-message.assistant.streaming').forEach(el => el.classList.remove('streaming'));
            state.messages[assistantIndex].content = `⚠️ Error: ${error}`;
            saveMessages();
            renderMessages();
            if (input) input.disabled = false;
            if (sendBtn) sendBtn.disabled = false;
        }
    );
}

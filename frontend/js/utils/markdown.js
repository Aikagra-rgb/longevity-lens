// Basic sanitization
function escapeHtml(unsafe) {
    return (unsafe || '').toString()
         .replace(/&/g, "&amp;")
         .replace(/</g, "&lt;")
         .replace(/>/g, "&gt;")
         .replace(/"/g, "&quot;")
         .replace(/'/g, "&#039;");
}

export function renderMarkdown(text) {
    if (!text) return '';
    
    // Escape HTML first to prevent XSS
    let html = escapeHtml(text);
    
    // Headers (h1-h4)
    html = html.replace(/^#### (.*$)/gim, '<h4>$1</h4>');
    html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
    html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
    html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');
    
    // Bold & Italic
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
    
    // Code blocks
    html = html.replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>');
    // Inline code
    html = html.replace(/`([^`]+)`/g, '<code>$1</code>');
    
    // Links
    html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');
    
    // Citations [1], [2], etc.
    html = html.replace(/\[(\d+)\]/g, '<span class="citation-badge" data-citation-id="$1">[$1]</span>');
    
    // Lists
    html = html.replace(/^\s*\*\s+(.*)$/gim, '<ul><li>$1</li></ul>');
    html = html.replace(/^\s*-\s+(.*)$/gim, '<ul><li>$1</li></ul>');
    // Consolidate adjacent ul tags
    html = html.replace(/<\/ul>\n<ul>/g, '\n');
    
    // Ordered Lists
    html = html.replace(/^\s*\d+\.\s+(.*)$/gim, '<ol><li>$1</li></ol>');
    html = html.replace(/<\/ol>\n<ol>/g, '\n');
    
    // Paragraphs - simple split by double newline
    const paragraphs = html.split(/\n\n+/);
    html = paragraphs.map(p => {
        // don't wrap tags like <h1-6>, <ul>, <ol>, <pre> in <p>
        if (p.trim().match(/^(<h|<ul|<ol|<pre)/)) {
            return p;
        }
        return `<p>${p}</p>`;
    }).join('\n');
    
    return html;
}

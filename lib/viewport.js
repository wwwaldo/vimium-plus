// Viewport utilities for Vimium Plus
class ViewportUtils {
    constructor() {
        // Bind methods
        this.isInViewport = this.isInViewport.bind(this);
        this.getVisibleText = this.getVisibleText.bind(this);
    }

    // Check if element is visible in viewport
    isInViewport(element) {
        const rect = element.getBoundingClientRect();
        return (
            rect.top < window.innerHeight &&
            rect.bottom > 0 &&
            rect.left < window.innerWidth &&
            rect.right > 0
        );
    }

    // Get all visible text in viewport
    getVisibleText() {
        // Get all text nodes in the document
        const walker = document.createTreeWalker(
            document.body,
            NodeFilter.SHOW_TEXT,
            {
                acceptNode: (node) => {
                    // Skip if parent is hidden
                    if (node.parentElement.offsetParent === null) {
                        return NodeFilter.FILTER_REJECT;
                    }
                    // Skip if empty or just whitespace
                    if (!node.textContent.trim()) {
                        return NodeFilter.FILTER_REJECT;
                    }
                    // Skip if script/style
                    const parent = node.parentElement.tagName;
                    if (parent === 'SCRIPT' || parent === 'STYLE') {
                        return NodeFilter.FILTER_REJECT;
                    }
                    return NodeFilter.FILTER_ACCEPT;
                }
            }
        );

        let visibleText = [];
        let node;
        
        // Walk through all text nodes
        while (node = walker.nextNode()) {
            // Check if node's parent element is in viewport
            if (this.isInViewport(node.parentElement)) {
                visibleText.push(node.textContent.trim());
            }
        }

        return visibleText.join('\n');
    }

    // Copy visible text to clipboard
    async copyVisibleText() {
        const text = this.getVisibleText();
        try {
            await navigator.clipboard.writeText(text);
            return true;
        } catch (err) {
            console.error('Failed to copy text:', err);
            return false;
        }
    }
}

// Initialize global instance
window.viewportUtils = new ViewportUtils();

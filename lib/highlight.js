// First clean up any existing highlights
document.querySelectorAll('.highlight-overlay').forEach(e=>e.remove());

class ElementHighlighter {
    constructor() {
        this.enabled = false;
        this.highlights = [];
        this.currentHighlight = null;
    }

    enable() {
        this.enabled = true;
        this.highlightClickableElements();
    }

    disable() {
        this.enabled = false;
        this.clearHighlights();
    }

    clearHighlights() {
        // First clean up any existing highlights
        document.querySelectorAll('.highlight-overlay').forEach(e=>e.remove());
        this.highlights = [];
        this.currentHighlight = null;
    }

    // Toggle between cursor and highlight box visualization
    toggleVisualization() {
        this.clearHighlights();
        this.highlightClickableElements();
    }

    // Highlight the currently focused element
    highlightCurrentElement(element) {
        if (!this.enabled) return;
        
        // Clear existing highlights
        this.clearHighlights();
        
        if (!element) return;

        // Create highlight for current element
        const color = '#4ECDC4';
        element.rects.forEach(rect => {
            const highlight = document.createElement('div');
            highlight.className = 'highlight-overlay';
            highlight.style.cssText = `
                position: fixed;
                z-index: 999998;
                pointer-events: none;
                mix-blend-mode: multiply;
                border: 2px solid ${color}44;
                background-color: ${color}11;
                border-radius: 3px;
                top: ${rect.top}px;
                left: ${rect.left}px;
                width: ${rect.width}px;
                height: ${rect.height}px;
            `;
            document.body.appendChild(highlight);
            this.highlights.push(highlight);
        });
    }

    updateHighlightPositions() {
        console.log('updateHighlightPositions:', {
            enabled: this.enabled,
            hasElements: !!window.clickableElements,
            elements: window.clickableElements
        });

        if (!this.enabled || !window.clickableElements) return;

        this.clearHighlights();
        const color = '#4ECDC4';

        window.clickableElements.forEach(element => {
            const rect = element.getBoundingClientRect();
            const highlight = document.createElement('div');
            highlight.className = 'highlight-overlay';
            highlight.style.cssText = `
                position: fixed;
                z-index: 999998;
                pointer-events: none;
                mix-blend-mode: multiply;
                border: 2px solid ${color}44;
                background-color: ${color}11;
                border-radius: 3px;
                top: ${rect.top}px;
                left: ${rect.left}px;
                width: ${rect.width}px;
                height: ${rect.height}px;
            `;
            document.body.appendChild(highlight);
            this.highlights.push(highlight);
        });
    }

    highlightClickableElements() {
        if (!this.enabled) return;

        // Use global navigator to refresh elements
        window.ElementNavigator.refresh();
        
        // Create initial highlights
        this.updateHighlightPositions();

        // Update highlights on scroll
        window.removeEventListener('scroll', this._scrollHandler);
        this._scrollHandler = () => this.updateHighlightPositions();
        window.addEventListener('scroll', this._scrollHandler);
    }
}

const highlighter = new ElementHighlighter();
// Don't auto-enable, let keyboard.js control this
window.highlighter = highlighter;

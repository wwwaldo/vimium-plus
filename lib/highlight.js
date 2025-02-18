// Element highlighting system
class ElementHighlighter {
    constructor() {
        this.enabled = false;
        this.highlightContainer = null;
        this.highlights = new Map(); // element -> highlight div
        this.initializeHighlightContainer();
        this._scrollHandler = this._scrollHandler.bind(this);
    }

    initializeHighlightContainer() {
        this.highlightContainer = document.createElement('div');
        this.highlightContainer.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: 10000;
        `;
        document.body.appendChild(this.highlightContainer);
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

    updateHighlightPositions() {
        if (!this.enabled) return;

        this.highlights.forEach((highlight, element) => {
            if (this.isInViewport(element)) {
                const rect = element.getBoundingClientRect();
                highlight.style.display = 'block';
                highlight.style.top = `${rect.top}px`;
                highlight.style.left = `${rect.left}px`;
                highlight.style.width = `${rect.width}px`;
                highlight.style.height = `${rect.height}px`;
            } else {
                highlight.style.display = 'none';
            }
        });
    }

    _scrollHandler() {
        requestAnimationFrame(() => this.updateHighlightPositions());
    }

    enable() {
        if (!window.clickableElements) return;
        
        this.enabled = true;
        this.highlights.clear();
        this.highlightContainer.innerHTML = '';

        // Filter to visible elements and create highlights
        const visibleElements = window.clickableElements.filter(element => 
            this.isInViewport(element)
        );

        // Create highlight for each visible element
        visibleElements.forEach(element => {
            const rect = element.getBoundingClientRect();
            const highlight = document.createElement('div');
            highlight.style.cssText = `
                position: fixed;
                top: ${rect.top}px;
                left: ${rect.left}px;
                width: ${rect.width}px;
                height: ${rect.height}px;
                background: rgba(78, 205, 196, 0.3);
                border: 2px solid #4ECDC4;
                border-radius: 3px;
                pointer-events: none;
                z-index: 10001;
            `;
            this.highlightContainer.appendChild(highlight);
            this.highlights.set(element, highlight);
        });

        // Update highlights on scroll
        window.addEventListener('scroll', this._scrollHandler);
    }

    disable() {
        this.enabled = false;
        this.highlights.clear();
        this.highlightContainer.innerHTML = '';
        window.removeEventListener('scroll', this._scrollHandler);
    }
}

// Initialize global instance
window.highlighter = new ElementHighlighter();

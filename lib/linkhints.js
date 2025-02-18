// Vimium-style link hints system
class LinkHints {
    constructor() {
        this.active = false;
        this.hints = new Map(); // element -> hint text
        this.currentInput = '';
        this.hintContainer = null;
        this.initializeHintContainer();
        this._scrollHandler = this._scrollHandler.bind(this);
    }

    initializeHintContainer() {
        this.hintContainer = document.createElement('div');
        this.hintContainer.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: 10000;
        `;
        document.body.appendChild(this.hintContainer);
    }

    // Generate hint text (aa, ab, ac, etc.)
    generateHintText(index) {
        const chars = 'abcdefghijklmnopqrstuvwxyz';
        const first = Math.floor(index / chars.length);
        const second = index % chars.length;
        return first > 0 ? chars[first - 1] + chars[second] : chars[second];
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

    updateHintPositions() {
        if (!this.active) return;

        this.hints.forEach((hintText, element) => {
            const hint = this.hintContainer.querySelector(`[data-hint="${hintText}"]`);
            if (!hint) return;

            if (this.isInViewport(element)) {
                const rect = element.getBoundingClientRect();
                hint.style.display = 'block';
                hint.style.top = `${rect.top}px`;
                hint.style.left = `${rect.left}px`;
            } else {
                hint.style.display = 'none';
            }
        });
    }

    _scrollHandler() {
        requestAnimationFrame(() => this.updateHintPositions());
    }

    showHints() {
        if (!window.clickableElements) return;
        
        this.active = true;
        this.currentInput = '';
        this.hints.clear();
        this.hintContainer.innerHTML = '';

        // Filter to visible elements and create hints
        const visibleElements = window.clickableElements.filter(element => 
            this.isInViewport(element)
        );

        // Create hints for each visible element
        visibleElements.forEach((element, index) => {
            const hintText = this.generateHintText(index);
            this.hints.set(element, hintText);

            const rect = element.getBoundingClientRect();
            const hint = document.createElement('div');
            hint.textContent = hintText;
            hint.dataset.hint = hintText;
            hint.style.cssText = `
                position: fixed;
                top: ${rect.top}px;
                left: ${rect.left}px;
                background: #ffeb3b;
                color: #000;
                padding: 2px 4px;
                border-radius: 3px;
                font-family: monospace;
                font-size: 12px;
                font-weight: bold;
                pointer-events: none;
                z-index: 10001;
            `;
            this.hintContainer.appendChild(hint);
        });

        // Add scroll listener
        window.addEventListener('scroll', this._scrollHandler, { passive: true });
    }

    hideHints() {
        this.active = false;
        this.currentInput = '';
        this.hints.clear();
        this.hintContainer.innerHTML = '';
        window.removeEventListener('scroll', this._scrollHandler);
    }

    handleInput(key) {
        if (!this.active) return false;

        // Escape exits hint mode
        if (key === 'Escape') {
            this.hideHints();
            return true;
        }

        // Only handle lowercase letters
        if (!/^[a-z]$/.test(key)) return false;

        this.currentInput += key;
        
        // Find matching hints
        const matches = Array.from(this.hints.entries())
            .filter(([_, hint]) => hint.startsWith(this.currentInput));

        // If exactly one match, click it
        if (matches.length === 1) {
            const [element] = matches[0];
            element.click();
            this.hideHints();
        }
        // If no matches, exit hint mode
        else if (matches.length === 0) {
            this.hideHints();
        }
        // Otherwise, wait for more input
        
        return true;
    }
}

// Initialize global instance
window.linkHints = new LinkHints();

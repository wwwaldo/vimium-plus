// First clean up any existing highlights
document.querySelectorAll('.highlight-overlay').forEach(e=>e.remove());

class ElementHighlighter {
    constructor() {
        this.enabled = false;
        this.highlights = [];
        this.currentHighlight = null;
        // Don't auto-highlight on construction
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
        this.highlights.forEach(h => h.remove());
        this.highlights = [];
        if (this.currentHighlight) {
            this.currentHighlight.remove();
            this.currentHighlight = null;
        }
    }

    // Highlight the currently focused element
    highlightCurrentElement(element) {
        if (this.currentHighlight) {
            this.currentHighlight.remove();
        }

        if (!element || !this.enabled) {
            this.currentHighlight = null;
            return;
        }

        const rect = element.rects[0];
        const highlight = document.createElement('div');
        highlight.className = 'highlight-overlay current';
        highlight.style.cssText = `
          position: absolute;
          z-index: 999999;
          pointer-events: none;
          mix-blend-mode: multiply;
          border: 3px solid #4ECDC4;
          background-color: #4ECDC433;
          border-radius: 3px;
          left: ${rect.left + window.scrollX}px;
          top: ${rect.top + window.scrollY}px;
          width: ${rect.width}px;
          height: ${rect.height}px;
          box-shadow: 0 0 10px #4ECDC4;
          animation: pulse 2s infinite;
        `;

        // Add pulse animation if not already added
        if (!document.getElementById('highlight-style')) {
            const style = document.createElement('style');
            style.id = 'highlight-style';
            style.textContent = `
                @keyframes pulse {
                    0% { box-shadow: 0 0 5px #4ECDC4; }
                    50% { box-shadow: 0 0 15px #4ECDC4; }
                    100% { box-shadow: 0 0 5px #4ECDC4; }
                }
            `;
            document.head.appendChild(style);
        }

        document.body.appendChild(highlight);
        this.currentHighlight = highlight;
    }

    highlightClickableElements() {
        // More comprehensive clickable element detection
        const clickableElements = Array.from(document.querySelectorAll(`
          a, button, select,
          input[type="button"], input[type="submit"], input[type="reset"], input[type="checkbox"], input[type="radio"],
          [role="button"], [role="link"], [role="menuitem"], [role="tab"], [role="checkbox"], [role="radio"],
          [onclick], [onmousedown], [onmouseup],
          [tabindex]:not([tabindex="-1"]),
          [contenteditable="true"]
        `)).filter(element => {
          // Skip hidden elements
          if (!element.offsetParent || 
              window.getComputedStyle(element).display === 'none' ||
              window.getComputedStyle(element).visibility === 'hidden') {
            return false;
          }

          const rect = element.getBoundingClientRect();
          if (rect.width === 0 || rect.height === 0) return false;

          // Check if element or its children have click handlers
          const hasClickHandler = element.onclick || 
                                 element.onmousedown || 
                                 element.onmouseup || 
                                 element.getAttribute('onclick') ||
                                 element.getAttribute('onmousedown') ||
                                 element.getAttribute('onmouseup');

          // Check for clickable CSS cursors
          const cursor = window.getComputedStyle(element).cursor;
          const hasClickableCursor = ['pointer', 'hand'].includes(cursor);

          return hasClickHandler || hasClickableCursor || 
                 element.tagName.toLowerCase() === 'a' ||
                 element.tagName.toLowerCase() === 'button' ||
                 element.tagName.toLowerCase() === 'select' ||
                 (element.tagName.toLowerCase() === 'input' && ['button', 'submit', 'reset', 'checkbox', 'radio'].includes(element.type)) ||
                 ['button', 'link', 'menuitem', 'tab', 'checkbox', 'radio'].includes(element.getAttribute('role')) ||
                 element.hasAttribute('contenteditable') ||
                 (element.hasAttribute('tabindex') && element.getAttribute('tabindex') !== '-1');
        }).map(element => {
          // Extract metadata
          const text = element.textContent.trim();
          const innerText = element.innerText?.trim() || '';
          const ariaLabel = element.getAttribute('aria-label') || '';
          const title = element.getAttribute('title') || '';
          
          // Try to get the most meaningful text
          const displayText = ariaLabel || title || innerText || text;

          return {
            element,
            metadata: {
              title: title,
              href: element.getAttribute('href') || '',
              ariaLabel: ariaLabel,
              text: text,
              innerText: innerText,
              displayText: displayText
            },
            rects: Array.from(element.getClientRects())
          };
        });

        // Create highlights
        const color = '#4ECDC4'; // A nice teal that's visible but not too intrusive

        clickableElements.forEach(({element, metadata, rects}) => {
          rects.forEach(rect => {
            const highlight = document.createElement('div');
            highlight.className = 'highlight-overlay';
            highlight.style.cssText = `
              position: absolute;
              z-index: 999998;
              pointer-events: none;
              mix-blend-mode: multiply;
              border: 2px solid ${color}44;
              background-color: ${color}11;
              border-radius: 3px;
              left: ${rect.left + window.scrollX}px;
              top: ${rect.top + window.scrollY}px;
              width: ${rect.width}px;
              height: ${rect.height}px;
              box-shadow: 0 0 0 1px rgba(255,255,255,0.3);
            `;
            
            // Store metadata on the highlight element
            highlight.dataset.title = metadata.title;
            highlight.dataset.href = metadata.href;
            highlight.dataset.ariaLabel = metadata.ariaLabel;
            highlight.dataset.text = metadata.text;
            highlight.dataset.innerText = metadata.innerText;
            highlight.dataset.displayText = metadata.displayText;
            
            document.body.appendChild(highlight);
            this.highlights.push(highlight);
          });
        });

        // Update highlights on scroll
        if (!this._scrollHandler) {
          this._scrollHandler = () => {
            if (this.enabled) {
              this.clearHighlights();
              this.highlightClickableElements();
            }
          };
          window.addEventListener('scroll', this._scrollHandler, { passive: true });
        }

        // Log some debug info
        console.log('🎯 Clickable elements with metadata:', clickableElements.map(({metadata}) => ({
          title: metadata.title,
          href: metadata.href,
          ariaLabel: metadata.ariaLabel,
          text: metadata.text,
          innerText: metadata.innerText,
          displayText: metadata.displayText
        })));
        console.log(`🎯 Found ${clickableElements.length} clickable elements`);
    }
}

const highlighter = new ElementHighlighter();
// Don't auto-enable, let keyboard.js control this
window.highlighter = highlighter;

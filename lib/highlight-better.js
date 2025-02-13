// First clean up any existing highlights
document.querySelectorAll('.highlight-overlay').forEach(e=>e.remove());

class ElementHighlighter {
    constructor() {
        this.enabled = false;
        this.highlights = [];
        this.currentHighlight = null;
        this.onReadyCallbacks = [];
        this.visualizationMode = 'cursor'; // 'cursor' or 'highlight'
        
        // Initialize cursor utils if not already present
        if (!window.cursorUtils) {
          window.cursorUtils = {
            createCursor: () => {
              const cursor = document.getElementById('vimium-cursor') || document.createElement('div');
              cursor.id = 'vimium-cursor';
              cursor.style.cssText = `
                position: fixed;
                width: 20px;
                height: 20px;
                background: #4ECDC4;
                border-radius: 50%;
                pointer-events: none;
                z-index: 999999;
                display: none;
                transition: all 0.1s ease;
                transform: translate(-50%, -50%);
              `;
              document.body.appendChild(cursor);
              return cursor;
            }
          };
        }
        // Don't auto-highlight on construction
    }

    enable(onReady) {
        this.enabled = true;
        if (onReady) {
            this.onReadyCallbacks.push(onReady);
        }
        // Use requestAnimationFrame to ensure DOM is ready
        requestAnimationFrame(() => this.highlightClickableElements());
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

    // Toggle between cursor and highlight box visualization
    toggleVisualization() {
        this.visualizationMode = this.visualizationMode === 'cursor' ? 'highlight' : 'cursor';
        // Re-highlight current elements with new visualization
        if (this.enabled) {
            this.highlightClickableElements();
        }
    }

    // Highlight the currently focused element
    highlightCurrentElement(element) {
        if (this.currentHighlight) {
            this.currentHighlight.remove();
        }

        if (!element) return;

        if (this.visualizationMode === 'cursor') {
            // Show cursor at element center
            if (window.cursorUtils) {
                const cursor = window.cursorUtils.createCursor();
                const rect = element.rects[0];
                cursor.style.left = `${rect.left + (rect.width / 2)}px`;
                cursor.style.top = `${rect.top + (rect.height / 2)}px`;
                cursor.style.display = 'block';
            }
        } else {
            // Create highlight box
            const highlight = document.createElement('div');
            highlight.className = 'highlight-overlay';
            highlight.style.cssText = `
              position: absolute;
              background: rgba(78, 205, 196, 0.1);
              border: 2px solid #4ECDC4;
              border-radius: 4px;
              pointer-events: none;
              z-index: 999999;
            `;
            
            const rect = element.rects[0];
            highlight.style.left = `${rect.left}px`;
            highlight.style.top = `${rect.top}px`;
            highlight.style.width = `${rect.width}px`;
            highlight.style.height = `${rect.height}px`;
            
            document.body.appendChild(highlight);
            this.highlights.push(highlight);
        }
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
          // TODO(debug): Investigate why element.tagName is not accessible in search.js
          // Hypothesis: The element reference might be getting detached or not properly serialized
          // when passed between components. For now, we store it in metadata.
          console.debug('Element in highlighter:', {
            element,
            tagName: element.tagName,
            hasTagName: 'tagName' in element,
            prototype: Object.getPrototypeOf(element)
          });

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
              tagName: element.tagName,
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
            highlight.dataset.tagName = metadata.tagName;
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
        console.log('Clickable elements with metadata:', clickableElements.map(({metadata}) => ({
          tagName: metadata.tagName,
          title: metadata.title,
          href: metadata.href,
          ariaLabel: metadata.ariaLabel,
          text: metadata.text,
          innerText: metadata.innerText,
          displayText: metadata.displayText
        })));
        console.log(`Found ${clickableElements.length} clickable elements`);

        // Update navigator elements
        window.clickableElements = clickableElements;
        if (window.ElementNavigator) {
            window.ElementNavigator.setElements(clickableElements);
        }

        // Notify callbacks
        this.onReadyCallbacks.forEach(cb => cb());
        this.onReadyCallbacks = [];
    }
}

const highlighter = new ElementHighlighter();
// Don't auto-enable, let keyboard.js control this
window.highlighter = highlighter;

// Core element finding functionality
class ElementFinder {
    constructor() {
        this.onReadyCallbacks = [];
    }

    findClickableElements() {
        // Find all potentially clickable elements
        const elements = Array.from(document.querySelectorAll('a, button, input, select, textarea, [role="button"], [role="link"], [role="checkbox"], [role="menuitem"], [role="tab"], [onclick]'));

        // Filter and enhance elements with metadata
        const clickableElements = elements.filter(element => {
          // Skip hidden elements
          if (element.offsetParent === null) return false;
          if (element.style.display === 'none') return false;
          if (element.style.visibility === 'hidden') return false;

          // Get element text content in various forms
          const text = element.textContent?.trim() || '';
          const innerText = element.innerText?.trim() || '';
          const title = element.getAttribute('title')?.trim() || '';
          const ariaLabel = element.getAttribute('aria-label')?.trim() || '';
          const displayText = ariaLabel || title || innerText || text;

          // Attach metadata and rects directly to element
          element.metadata = {
            tagName: element.tagName,
            title: title,
            href: element.getAttribute('href') || '',
            ariaLabel: ariaLabel,
            text: text,
            innerText: innerText,
            displayText: displayText
          };
          element.rects = Array.from(element.getClientRects());
          return element;
        });

        // Log some debug info
        console.log('Clickable elements with metadata:', clickableElements.map(element => ({
          tagName: element.metadata.tagName,
          title: element.metadata.title,
          href: element.metadata.href,
          ariaLabel: element.metadata.ariaLabel,
          text: element.metadata.text,
          innerText: element.metadata.innerText,
          displayText: element.metadata.displayText
        })));
        console.log(`Found ${clickableElements.length} clickable elements`);

        // Update global reference
        window.clickableElements = clickableElements;

        // Notify callbacks
        this.onReadyCallbacks.forEach(cb => cb());
        this.onReadyCallbacks = [];

        return clickableElements;
    }
}

// Initialize global instance
window.elementFinder = new ElementFinder();

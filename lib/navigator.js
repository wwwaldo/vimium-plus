// Navigator utility - combines cursor movement with element targeting
class ElementNavigator {
  constructor() {
    this.cursor = window.cursorUtils.createCursor();
    this.clickableElements = [];
    this.currentIndex = -1;
  }

  // Initialize with our collected clickable elements
  setElements(elements) {
    this.clickableElements = elements;
    console.log('\uD83C\uDFFC Navigator loaded with', elements.length, 'elements');
  }

  enable() {
    this.cursor.style.display = 'block';
  }

  disable() {
    this.cursor.style.display = 'none';
  }

  // Get center point of the first rect of an element
  getElementCenter(element) {
    const rect = element.getBoundingClientRect();
    return {
      x: rect.left + (rect.width / 2),  // Use viewport coordinates
      y: rect.top + (rect.height / 2)
    };
  }

  // Move to a specific element
  moveToElement(element, animate = true) {
    // Use the DOM element's scrollIntoView directly
    element.scrollIntoView({
      behavior: animate ? 'smooth' : 'auto',
      block: 'center',
      inline: 'nearest'
    });

    // After scroll, position cursor using viewport coordinates
    requestAnimationFrame(() => {
      const center = this.getElementCenter(element);
      window.cursorUtils.moveCursor(this.cursor, center.x, center.y, animate);
    });
  }

  // Click the current element
  async click() {
    if (this.currentIndex === -1) return;
    
    const element = this.clickableElements[this.currentIndex];
    window.cursorUtils.simulateClick(this.cursor);
    
    // Wait for click animation
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Trigger the actual click
    element.click();
  }

  // Move to next element
  next() {
    if (this.clickableElements.length === 0) return;
    this.currentIndex = (this.currentIndex + 1) % this.clickableElements.length;
    const currentElement = this.clickableElements[this.currentIndex];
    this.moveToElement(currentElement);
    window.highlighter.highlightCurrentElement(currentElement);
    this.logCurrentElement();
  }

  // Move to previous element
  prev() {
    if (this.clickableElements.length === 0) return;
    this.currentIndex = (this.currentIndex - 1 + this.clickableElements.length) % this.clickableElements.length;
    const currentElement = this.clickableElements[this.currentIndex];
    this.moveToElement(currentElement);
    window.highlighter.highlightCurrentElement(currentElement);
    this.logCurrentElement();
  }

  // Log info about current element
  logCurrentElement() {
    if (this.currentIndex === -1) return;
    const element = this.clickableElements[this.currentIndex];
    console.log('\uD83C\uDFFC Current element:', {
      tag: element.tagName,
      displayText: element.textContent,
      innerText: element.textContent,
      text: element.textContent,
      href: element.href,
      title: element.title,
      ariaLabel: element.getAttribute('aria-label')
    });
  }
}

// Create global navigator instance
window.ElementNavigator = new ElementNavigator();
window.ElementNavigator.setElements(window.clickableElements || []);

// Navigator utility - manages global clickable elements state and cursor movement
// This is the central manager for clickable elements. All components should:
// 1. Call navigator.refresh() to update the element list
// 2. Read from window.clickableElements to access elements
// 3. Never call elementFinder.findClickableElements() directly
// Navigator class - handles element selection and movement
// TODO: Further decouple cursor/highlight UI logic from navigation.
//       Currently moveToElement handles both state and UI updates.
//       Consider splitting into:
//       1. Pure state management (current element, index)
//       2. UI updates via events/callbacks
//       This will make the navigation system more flexible for different visualization modes.
class ElementNavigator {
  constructor() {
    this.cursor = window.cursorUtils.createCursor();
    this.currentIndex = -1;
  }

  enable() {
    this.cursor.style.display = 'block';
  }

  disable() {
    this.cursor.style.display = 'none';
  }

  // Get center point of element
  getElementCenter(element) {
    const rect = element.getBoundingClientRect();
    const center = {
      x: rect.left + window.scrollX + (rect.width / 2),
      y: rect.top + window.scrollY + (rect.height / 2)
    };
    return center;
  }

  // Move to a specific element
  async moveToElement(element, animate = true) {

    // Scroll element into view
    element.scrollIntoView({
      behavior: animate ? 'smooth' : 'auto',
      block: 'center',
      inline: 'nearest'
    });

    // Wait for scroll animation to finish
    if (animate) {
      const scrollAnimations = document.getAnimations().filter(
        animation => animation.currentTime !== null && animation.effect?.target === document.scrollingElement
      );
      await Promise.all(scrollAnimations.map(animation => animation.finished));
    } else {
      await new Promise(resolve => requestAnimationFrame(resolve));
    }

    console.log('After scroll finished:', {
      scrollY: window.scrollY,
      viewportHeight: window.innerHeight
    });

    // After scroll finishes, position cursor
    const center = this.getElementCenter(element);
    window.cursorUtils.moveCursor(this.cursor, center.x, center.y, animate);
  }

  // Click the current element
  async click() {
    if (this.currentIndex === -1) return;
    
    const element = window.clickableElements[this.currentIndex];
    window.cursorUtils.simulateClick(this.cursor);
    
    // Wait for click animation
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Trigger the actual click
    element.click();
  }

  // Move to next element
  next() {
    if (!window.clickableElements || window.clickableElements.length === 0) return;
    this.currentIndex = (this.currentIndex + 1) % window.clickableElements.length;
    const currentElement = window.clickableElements[this.currentIndex];
    this.moveToElement(currentElement);
    this.logCurrentElement();
  }

  // Move to previous element
  prev() {
    if (!window.clickableElements || window.clickableElements.length === 0) return;
    this.currentIndex = (this.currentIndex - 1 + window.clickableElements.length) % window.clickableElements.length;
    const currentElement = window.clickableElements[this.currentIndex];
    this.moveToElement(currentElement);
    this.logCurrentElement();
  }

  // Log info about current element
  logCurrentElement() {
    if (this.currentIndex === -1) return;
    const element = window.clickableElements[this.currentIndex];
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

  // Set current element by index
  setCurrentIndex(index) {
    if (index >= 0 && index < window.clickableElements.length) {
      this.currentIndex = index;
      this.moveToElement(window.clickableElements[index]);
    }
  }

  // Set current element directly
  setCurrentElement(element) {
    const index = window.clickableElements.findIndex(el => el === element);
    if (index !== -1) {
      this.setCurrentIndex(index);
    }
  }

  refresh() {
    // Save current element before updating list
    const currentElement = this.currentIndex !== -1 && window.clickableElements ? 
      window.clickableElements[this.currentIndex] : null;
    
    // Get fresh elements
    window.elementFinder.findClickableElements();
    
    // Try to find old element in new list
    if (currentElement && window.clickableElements) {
      this.currentIndex = window.clickableElements.findIndex(el => el === currentElement);
    }
  }
}

// Create global navigator instance
window.ElementNavigator = new ElementNavigator();

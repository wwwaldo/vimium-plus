// Keyboard control system
class KeyboardController {
  constructor() {
    this.enabled = false;
    this.navigator = new ElementNavigator();
    this.searchController = new SearchController(this.navigator);
    this.recorder = new InteractionRecorder(this.navigator);
    this.highlighter = new ElementHighlighter();
    this.highlightsVisible = true;
    this.lastKeyPressTime = null;
    this.initializeKeyHandlers();
  }

  enable() {
    this.enabled = true;
    this.navigator.enable();
    if (this.highlightsVisible) {
      this.highlighter.enable();
    }
    window.keycast.enable();
  }

  disable() {
    this.enabled = false;
    this.navigator.disable();
    this.highlighter.disable();
    window.keycast.disable();
    if (this.searchController.searchMode) {
      this.searchController.exitSearch();
    }
  }

  toggle() {
    if (this.enabled) {
      this.disable();
    } else {
      this.enable();
    }
  }

  toggleHighlights() {
    this.highlightsVisible = !this.highlightsVisible;
    if (this.highlightsVisible) {
      this.highlighter.enable();
    } else {
      this.highlighter.disable();
    }
  }

  initializeKeyHandlers() {
    document.addEventListener('keydown', (e) => {
      // Check for toggle shortcut even when disabled
      if (e.key === ' ' && e.shiftKey && !e.altKey && !e.ctrlKey && !e.metaKey) {
        this.toggle();
        e.preventDefault();
        return;
      }

      // Only handle other keys when enabled
      if (!this.enabled) return;

      // Don't handle navigation keys when in search mode
      if (this.searchController.searchMode) {
        if (e.key === 'Escape') {
          this.searchController.exitSearch();
          window.keycast.enable(); // Re-enable keycast after search
          e.preventDefault();
        }
        return;
      }

      switch(e.key) {
        case 'j':
          this.navigator.next();
          e.preventDefault();
          break;
        case 'k':
          this.navigator.prev();
          e.preventDefault();
          break;
        case 'Enter':
          this.navigator.click();
          e.preventDefault();
          break;
        case '/':
          window.keycast.disable(); // Disable keycast during search
          this.searchController.startSearch();
          e.preventDefault();
          break;
        case 'g':  // Restore scroll to top/bottom
          if (this.lastKeyPressTime && Date.now() - this.lastKeyPressTime < 500) {
            window.scrollTo({
              top: document.documentElement.scrollHeight,
              behavior: 'smooth'
            });
          } else {
            window.scrollTo({
              top: 0,
              behavior: 'smooth'
            });
          }
          this.lastKeyPressTime = Date.now();
          e.preventDefault();
          break;
        case 'G':  // Restore scroll to bottom
          window.scrollTo({
            top: document.documentElement.scrollHeight,
            behavior: 'smooth'
          });
          e.preventDefault();
          break;
        case 'Escape':
          if (this.searchController.searchMode) {
            this.searchController.exitSearch();
            window.keycast.enable(); // Re-enable keycast after search
          }
          e.preventDefault();
          break;
        case 'f':
          if (!e.shiftKey && !e.altKey && !e.ctrlKey && !e.metaKey) {
            this.toggleHighlights();
            e.preventDefault();
          }
          break;
      }
    });
  }
}

// Wait for dependencies to load
window.addEventListener('load', () => {
  // Check for all required dependencies
  if (window.cursorUtils && window.highlighter) {
    window.keyboard = new KeyboardController();
  } else {
    console.error('Required dependencies not found! Make sure all scripts are loaded.');
  }
});

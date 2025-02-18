// Keyboard control system
class KeyboardController {
  constructor(deps = {}) {
    // Load enabled state from localStorage
    this.enabled = localStorage.getItem('vimium_navigation_enabled') === 'true';
    
    // Allow dependency injection for testing
    this.navigator = deps.navigator || new ElementNavigator();
    this.searchController = deps.searchController || new SearchController(this.navigator);
    this.recorder = deps.recorder || new InteractionRecorder(this.navigator);
    this.highlighter = deps.highlighter || window.highlighter;
    this.highlightsVisible = false;  // Start with highlights off
    this.lastKeyPressTime = null;
    this.initializeKeyHandlers();

    // Initialize based on saved state
    if (this.enabled) {
      this.navigator.enable();
      window.keycast && window.keycast.enable();
    }
  }

  enable() {
    this.enabled = true;
    localStorage.setItem('vimium_navigation_enabled', 'true');
    this.navigator.enable();
    window.keycast && window.keycast.enable();
  }

  disable() {
    this.enabled = false;
    localStorage.setItem('vimium_navigation_enabled', 'false');
    this.navigator.disable();
    this.highlighter.disable();
    window.keycast && window.keycast.disable();
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

  showStatusMessage(text, duration = 1000) {
    const msg = document.createElement('div');
    msg.id = 'vimium-status';
    msg.style.cssText = `
      position: fixed;
      bottom: 20px;
      right: 20px;
      background: rgba(78, 205, 196, 0.9);
      color: white;
      padding: 8px 16px;
      border-radius: 4px;
      font-family: system-ui;
      font-size: 14px;
      z-index: 999999;
      animation: vimium-fade-in 0.2s ease-in-out;
    `;
    msg.textContent = text;
    document.body.appendChild(msg);
    setTimeout(() => msg.remove(), duration);
  }

  initializeKeyHandlers() {
    document.addEventListener('keydown', (e) => {
      // Handle link hints first if active
      if (window.linkHints && window.linkHints.active) {
        if (window.linkHints.handleInput(e.key.toLowerCase())) {
          e.preventDefault();
          return;
        }
      }

      // Check for toggle shortcut even when disabled
      if (e.key === ' ' && e.shiftKey && !e.altKey && !e.ctrlKey && !e.metaKey) {
        this.toggle();
        this.showStatusMessage(this.enabled ? 'Navigation On' : 'Navigation Off');
        e.preventDefault();
        return;
      }

      // Only handle other keys when enabled
      if (!this.enabled) return;

      // Pass to recorder if recording
      if (this.recorder.recording) {
        this.recorder.handleKeyEvent(e);
      }

      // Don't handle if we're in an input
      if (document.activeElement && document.activeElement.tagName === 'INPUT') return;

      // Don't handle if search mode is active
      if (this.searchController.searchMode) return;

      switch (e.key) {
        case 'f':
          if (!e.ctrlKey && !e.metaKey) {
            e.preventDefault();
            this.navigator.refresh();
            window.linkHints && window.linkHints.showHints();
          }
          break;

        case 'v':
          if (!e.ctrlKey && !e.metaKey) {
            e.preventDefault();
            if (this.highlighter.enabled) {
              this.highlighter.disable();
            } else {
              this.navigator.refresh();
              this.highlighter.enable();
            }
          }
          break;

        case 'j':
          if (!e.ctrlKey && !e.metaKey) {
            e.preventDefault();
            this.navigator.next();
          }
          break;

        case 'k':
          if (!e.ctrlKey && !e.metaKey) {
            e.preventDefault();
            this.navigator.prev();
          }
          break;

        case 'Enter':
          if (!e.ctrlKey && !e.metaKey) {
            e.preventDefault();
            this.navigator.click();
          }
          break;

        case '/':
          if (!e.ctrlKey && !e.metaKey) {
            e.preventDefault();
            this.navigator.refresh();
            this.searchController.startSearch();
          }
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
        case 'd':  // Half page down (like Ctrl-D in vim)
          if (!e.shiftKey && !e.altKey && !e.ctrlKey && !e.metaKey) {
            window.scrollBy({
              top: window.innerHeight * 0.5,
              behavior: 'smooth'
            });
            e.preventDefault();
          }
          break;
        case 'u':  // Half page up (like Ctrl-U in vim)
          if (!e.shiftKey && !e.altKey && !e.ctrlKey && !e.metaKey) {
            window.scrollBy({
              top: -window.innerHeight * 0.5,
              behavior: 'smooth'
            });
            e.preventDefault();
          }
          break;
        case 'r':  // Toggle recording mode
          if (!e.shiftKey && !e.altKey && !e.ctrlKey && !e.metaKey) {
            e.preventDefault();
            this.recorder.toggleRecording();
          }
          break;
        case 'p':  // Start playback
          if (!e.shiftKey && !e.altKey && !e.ctrlKey && !e.metaKey) {
            e.preventDefault();
            this.recorder.startPlayback();
          }
          break;
        case 'c':  // Clear recording
          if (!e.shiftKey && !e.altKey && !e.ctrlKey && !e.metaKey) {
            this.recorder.clearSequence();
            e.preventDefault();
          }
          break;
        case ' ':  // Space key handler
          if (e.shiftKey) {  // Shift+Space toggles navigation
            this.toggle();
            this.showStatusMessage(this.enabled ? 'Navigation On' : 'Navigation Off');
            e.preventDefault();
          }
          break;
        case 'h':  // Back in history
          if (!e.ctrlKey && !e.metaKey) {
            if (e.shiftKey) {
              window.historyNavigator && window.historyNavigator.showHistory();
            } else {
              window.history.back();
            }
            e.preventDefault();
          }
          break;
        case 'l':  // Forward in history
          if (!e.ctrlKey && !e.metaKey) {
            window.history.forward();
          }
          break;
      }
    });
  }
}

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
  module.exports = KeyboardController;
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

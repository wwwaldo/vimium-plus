// Key overlay display system
class KeycastOverlay {
  constructor(config = {}) {
    this.container = this.createContainer();
    this.enabled = false;
    this.mappedKeys = config.mappedKeys || ['j', 'k', 'd', 'u', 'f', 'v', 'g', 'G', '/', 'Enter'];
    this.displayNames = {
      ' ': 'Space',
      'Shift': '\u21E7',  // ⇧
      'Control': '\u2303', // ⌃
      'Alt': '\u2325',    // ⌥
      'Meta': '\u2318',   // ⌘
      'ArrowUp': '\u2191',    // ↑
      'ArrowDown': '\u2193',  // ↓
      'ArrowLeft': '\u2190',  // ←
      'ArrowRight': '\u2192', // →
      'Enter': '\u23CE',      // ⏎
      'Escape': 'Esc'
    };
  }

  enable() {
    this.enabled = true;
  }

  disable() {
    this.enabled = false;
    // Clear any existing keys
    while (this.container.firstChild) {
      this.container.removeChild(this.container.firstChild);
    }
  }

  createContainer() {
    const container = document.createElement('div');
    container.id = 'keycast-overlay';
    container.style.cssText = `
      position: fixed;
      bottom: 20px;
      left: 20px;
      z-index: 999999;
      font-family: system-ui;
      font-size: 14px;
      display: flex;
      gap: 8px;
      pointer-events: none;
    `;
    document.body.appendChild(container);
    return container;
  }

  getDisplayKey(key, e) {
    // For combination keys, show modifier symbol
    if (e.shiftKey && key !== 'Shift') {
      return this.displayNames['Shift'] + (this.displayNames[key] || key.toUpperCase());
    }
    return this.displayNames[key] || key.toUpperCase();
  }

  // Create a beautiful key element
  createKeyElement(key, e) {
    const keyElement = document.createElement('div');
    keyElement.className = 'keycast-key';
    
    // Format the key name
    let displayKey = this.getDisplayKey(key, e);
    
    keyElement.style.cssText = `
      background: rgba(78, 205, 196, 0.9);
      color: white;
      padding: 4px 8px;
      border-radius: 4px;
      animation: keycast-fade-out 1s ease-in-out forwards;
    `;
    keyElement.textContent = displayKey;

    // Add animation keyframes if not already added
    if (!document.getElementById('keycast-style')) {
      const style = document.createElement('style');
      style.id = 'keycast-style';
      style.textContent = `
        @keyframes keycast-fade-out {
          0% { opacity: 1; transform: translateY(0); }
          80% { opacity: 1; transform: translateY(0); }
          100% { opacity: 0; transform: translateY(10px); }
        }
      `;
      document.head.appendChild(style);
    }

    return keyElement;
  }

  // Check if key is in our keymap
  isKeyMapped(e) {
    // Space + Shift is our toggle
    if (e.key === ' ' && e.shiftKey && !e.altKey && !e.ctrlKey && !e.metaKey) {
      return true;
    }

    // Don't handle if we're in an input
    if (document.activeElement && document.activeElement.tagName === 'INPUT') {
      return false;
    }

    // Check against configured mapped keys
    return this.mappedKeys.includes(e.key) && 
           !e.ctrlKey && !e.metaKey && !e.altKey;
  }

  showKey(e) {
    if (!this.enabled || !this.isKeyMapped(e)) return;
    const keyElement = this.createKeyElement(e.key, e);
    this.container.appendChild(keyElement);
    setTimeout(() => keyElement.remove(), 1000);
  }
}

// Create global instance
window.keycast = new KeycastOverlay();

// Add keyboard listener
document.addEventListener('keydown', (e) => {
  window.keycast.showKey(e);
});

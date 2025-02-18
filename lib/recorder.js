// A totally legitimate interaction recorder for accessibility testing purposes
class InteractionRecorder {
  constructor(navigator) {
    this.navigator = navigator;
    this.recording = false;
    this.sequence = [];
    this.playbackIndex = -1;
    this.statusBar = this.createStatusBar();
    this.displayNames = {
      'Shift': '⇧',
      'Control': '⌃',
      'Alt': '⌥',
      'Meta': '⌘'
    };
    // Bind keyboard event handler
    this.handleKeyEvent = this.handleKeyEvent.bind(this);
  }

  createStatusBar() {
    const bar = document.createElement('div');
    bar.className = 'recorder-status';
    bar.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 8px 16px;
      background: rgba(0,0,0,0.9);
      color: #fff;
      border-radius: 8px;
      font-family: system-ui, -apple-system, sans-serif;
      font-size: 14px;
      z-index: 1000000;
      display: none;
      border: 2px solid #FF6B6B;
      box-shadow: 0 2px 8px rgba(0,0,0,0.2);
      backdrop-filter: blur(4px);
    `;
    document.body.appendChild(bar);
    return bar;
  }

  // Start recording a new sequence
  startRecording() {
    this.recording = true;
    this.updateStatus('Recording...');
  }

  // Stop recording
  stopRecording() {
    this.recording = false;
    this.updateStatus(`Recorded ${this.sequence.length} events`);
  }

  record(element) {
    // Just record the element's ID - intentionally brittle!
    const elementId = element.element.id;
    this.sequence.push({ type: 'click', elementId });
    this.updateStatus(`Recorded ${this.sequence.length} ${this.sequence.length === 1 ? 'action' : 'actions'}`);
  }

  // Find element by ID during playback
  findMatchingElement(elementData) {
    if (!elementData.elementId) return null;
    const element = document.getElementById(elementData.elementId);
    return element ? { element } : null;
  }

  // Start playback of recorded sequence
  async startPlayback(delay = 1000) {
    if (this.sequence.length === 0) {
      return;
    }
    
    this.playbackIndex = 0;
    this.updateStatus('Playing sequence...');
    
    while (this.playbackIndex < this.sequence.length) {
      const action = this.sequence[this.playbackIndex];
      if (action.type === 'keyboard') {
        // Simulate keyboard event
        const event = new KeyboardEvent('keydown', {
          bubbles: true,
          cancelable: true,
          key: action.key,
          shiftKey: action.modifiers.shift,
          ctrlKey: action.modifiers.ctrl,
          altKey: action.modifiers.alt,
          metaKey: action.modifiers.meta
        });
        document.dispatchEvent(event);
      } else if (action.type === 'click') {
        const element = this.findMatchingElement(action);
        
        if (element) {
          // Move to and click the element
          this.navigator.currentIndex = this.navigator.clickableElements.indexOf(element);
          this.navigator.moveToElement(element);
          await new Promise(resolve => setTimeout(resolve, delay * 0.7));
          await this.navigator.click();
          
          this.updateStatus(`Action ${this.playbackIndex + 1}/${this.sequence.length}`);
        }
      }
      
      this.playbackIndex++;
      await new Promise(resolve => setTimeout(resolve, delay));
    }
    
    this.updateStatus('Playback complete');
    this.playbackIndex = -1;
  }

  clear() {
    this.sequence = [];
    this.playbackIndex = -1;
    this.updateStatus('Recording cleared');
  }

  handleKeyEvent(event) {
    if (!this.recording || !event.isTrusted) return;
    
    // Don't record the recording toggle key itself
    if (event.key === 'r' && !event.shiftKey && !event.altKey && !event.ctrlKey && !event.metaKey) {
      return;
    }

    // Record the key event
    const keyEvent = {
      type: 'keyboard',
      key: event.key,
      modifiers: {
        shift: event.shiftKey,
        ctrl: event.ctrlKey,
        alt: event.altKey,
        meta: event.metaKey
      }
    };

    this.sequence.push(keyEvent);
    
    // Format modifier keys for display
    let displayKey = event.key;
    let modifiers = '';
    if (event.shiftKey) modifiers += this.displayNames['Shift'];
    if (event.ctrlKey) modifiers += this.displayNames['Control'];
    if (event.altKey) modifiers += this.displayNames['Alt'];
    if (event.metaKey) modifiers += this.displayNames['Meta'];
    
    this.updateStatus(`Recorded ${modifiers}${displayKey}`);
  }

  // Update status bar
  updateStatus(message) {
    // Format any special keys in the message
    Object.entries(this.displayNames).forEach(([key, symbol]) => {
      message = message.replace(new RegExp(key, 'g'), symbol);
    });
    
    this.statusBar.textContent = message;
    this.statusBar.style.display = 'block';
    
    // Hide after 3 seconds if not recording
    if (!this.recording) {
      setTimeout(() => {
        this.statusBar.style.display = 'none';
      }, 3000);
    }
  }

  // Toggle recording state
  toggle() {
    if (this.recording) {
      this.stopRecording();
    } else {
      this.startRecording();
    }
  }
}

// For testing/debugging
if (typeof module !== 'undefined') {
  module.exports = { InteractionRecorder };
}

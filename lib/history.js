// Browser history navigation and management
class HistoryNavigator {
    constructor() {
        this.historyOverlay = null;
        
        // Auto-initialize when script loads
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.initialize());
        } else {
            this.initialize();
        }
    }

    initialize() {
        // Get keyboard controller instance
        const keyboardController = window.keyboardController;
        if (!keyboardController) {
            console.error('KeyboardController not found');
            return;
        }

        // Create overlay for history list
        this.historyOverlay = document.createElement('div');
        this.historyOverlay.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #333;
            color: #fff;
            padding: 10px;
            border-radius: 5px;
            font-family: monospace;
            z-index: 9999;
            display: none;
        `;
        document.body.appendChild(this.historyOverlay);

        // Register keyboard shortcuts
        keyboardController.addShortcut('h', () => window.history.back());
        keyboardController.addShortcut('l', () => window.history.forward());
        keyboardController.addShortcut('H', () => this.showHistory());
    }

    showHistory() {
        // Get history entries (this is a bit hacky since we can't directly access history entries)
        const entries = [];
        let currentIndex = history.length - 1;
        
        // Current page
        entries.push({ url: window.location.href, title: document.title, current: true });
        
        // Previous pages (by going back and forth)
        let steps = Math.min(5, history.length - 1);  // Show last 5 entries
        for (let i = 0; i < steps; i++) {
            history.back();
            entries.unshift({ 
                url: window.location.href, 
                title: document.title,
                index: currentIndex - (i + 1)
            });
        }
        
        // Go back to where we were
        for (let i = 0; i < steps; i++) {
            history.forward();
        }

        // Show overlay with numbered entries
        this.historyOverlay.innerHTML = entries
            .map((entry, i) => {
                const prefix = entry.current ? '→ ' : '  ';
                return `${prefix}${i}: ${entry.title} (${entry.url})`;
            })
            .join('<br>');
        this.historyOverlay.style.display = 'block';

        // Hide after a delay
        setTimeout(() => {
            this.historyOverlay.style.display = 'none';
        }, 3000);
    }
}

// Auto-initialize
new HistoryNavigator();

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
            display: none;
            z-index: 10000;
            max-height: 80vh;
            overflow-y: auto;
        `;
        document.body.appendChild(this.historyOverlay);
    }

    showHistory() {
        // Get history entries
        const entries = [];
        const maxEntries = 10;
        
        if (window.history.length > 0) {
            // Current page is always first
            entries.push(window.location.href);
            
            // Add previous entries if available
            // Note: We can only see the current page in history
            // for security reasons
            if (window.history.length > 1) {
                entries.push('Previous pages available');
            }
        }

        // Display entries
        this.historyOverlay.innerHTML = `
            <div style="font-weight: bold; margin-bottom: 5px;">Recent History:</div>
            ${entries.map((entry, i) => 
                `<div>${i + 1}. ${entry}</div>`
            ).join('')}
        `;
        this.historyOverlay.style.display = 'block';

        // Auto-hide after delay
        setTimeout(() => {
            this.historyOverlay.style.display = 'none';
        }, 3000);
    }
}

// Initialize global instance
window.historyNavigator = new HistoryNavigator();

// Fuzzy search functionality for our navigator
class SearchController {
  constructor(navigator) {
    this.navigator = navigator;
    this.searchMode = false;
    this.searchInput = this.createSearchInput();
    this.resultsOverlay = this.createResultsOverlay();
    this.currentResults = [];
    this.resultIndex = -1;
  }

  createSearchInput() {
    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'navigator-search';
    input.style.cssText = `
      position: fixed;
      bottom: 20px;
      left: 50%;
      transform: translateX(-50%);
      z-index: 1000000;
      padding: 8px 16px;
      font-size: 16px;
      border: 2px solid #4ECDC4;
      border-radius: 20px;
      background: rgba(0,0,0,0.8);
      color: #fff;
      width: 300px;
      display: none;
      font-family: system-ui, -apple-system, sans-serif;
    `;
    
    document.body.appendChild(input);
    return input;
  }

  createResultsOverlay() {
    const overlay = document.createElement('div');
    overlay.className = 'search-results-overlay';
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      background: rgba(0,0,0,0.9);
      color: #fff;
      z-index: 1000000;
      font-family: system-ui, -apple-system, sans-serif;
      padding: 16px;
      display: none;
      max-height: 40vh;
      overflow-y: auto;
      backdrop-filter: blur(4px);
      border-bottom: 2px solid #4ECDC4;
    `;
    
    document.body.appendChild(overlay);
    return overlay;
  }

  // Fuzzy match score between text and query
  fuzzyMatch(text, query) {
    if (!text || !query) return { score: 0, matches: [] };
    text = text.toLowerCase();
    query = query.toLowerCase();
    
    let score = 0;
    let lastIndex = -1;
    let consecutiveMatches = 0;
    let matches = [];
    
    for (let char of query) {
      const index = text.indexOf(char, lastIndex + 1);
      if (index === -1) return { score: 0, matches: [] };
      
      matches.push(index);
      
      // Base score for finding the character
      score += 1;
      
      // Bonus for characters that are closer together
      if (lastIndex !== -1 && index === lastIndex + 1) {
        consecutiveMatches++;
        score += consecutiveMatches * 2;
      } else {
        consecutiveMatches = 0;
      }
      
      // Bonus for matching at start of words
      if (index === 0 || text[index - 1] === ' ') {
        score += 3;
      }
      
      lastIndex = index;
    }
    
    return { score, matches };
  }

  // Create a result item element
  createResultItem(result, isSelected) {
    const { element, score, matches } = result;
    const { title, href, ariaLabel, text } = element.metadata;
    const displayText = text || title || href || ariaLabel || 'Unnamed Element';
    
    const item = document.createElement('div');
    item.className = 'search-result-item';
    item.style.cssText = `
      padding: 8px 16px;
      margin: 4px 0;
      border-radius: 4px;
      cursor: pointer;
      display: flex;
      align-items: center;
      ${isSelected ? 'background: #4ECDC4; color: #000;' : 'background: rgba(78, 205, 196, 0.1);'}
    `;

    // Add type indicator
    const typeIcon = document.createElement('span');
    typeIcon.style.cssText = 'margin-right: 8px; opacity: 0.7;';
    typeIcon.textContent = element.tagName === 'A' ? '🔗' : 
                          element.tagName === 'BUTTON' ? '🔘' : 
                          element.tagName === 'INPUT' ? '📝' : '🎯';
    item.appendChild(typeIcon);

    // Add text content
    const content = document.createElement('span');
    content.style.cssText = 'flex: 1;';
    content.textContent = displayText;
    item.appendChild(content);

    // Add score indicator (for debugging)
    const scoreIndicator = document.createElement('span');
    scoreIndicator.style.cssText = 'margin-left: 8px; opacity: 0.5; font-size: 0.8em;';
    scoreIndicator.textContent = `Score: ${score}`;
    item.appendChild(scoreIndicator);

    return item;
  }

  // Search through all elements and score them
  search(query) {
    if (!query) {
      this.currentResults = [];
      this.updateResultsDisplay();
      return;
    }

    const results = this.navigator.clickableElements.map((element, index) => {
      const { title, href, ariaLabel, text } = element.metadata;
      const searchText = [title, href, ariaLabel, text].join(' ');
      const { score, matches } = this.fuzzyMatch(searchText, query);
      return { element, index, score, matches };
    });

    // Sort by score and filter out non-matches
    this.currentResults = results
      .filter(r => r.score > 0)
      .sort((a, b) => b.score - a.score);

    // Move to first result if we have any
    if (this.currentResults.length > 0) {
      this.resultIndex = 0;
      const { element, index } = this.currentResults[0];
      this.navigator.currentIndex = index;
      this.navigator.moveToElement(element);
    }

    this.updateResultsDisplay();
  }

  // Update the results overlay display
  updateResultsDisplay() {
    if (this.currentResults.length === 0) {
      this.resultsOverlay.style.display = 'none';
      return;
    }

    this.resultsOverlay.style.display = 'block';
    this.resultsOverlay.innerHTML = '';

    // Add header with result count
    const header = document.createElement('div');
    header.style.cssText = `
      margin-bottom: 12px;
      padding-bottom: 8px;
      border-bottom: 1px solid rgba(78, 205, 196, 0.3);
      display: flex;
      justify-content: space-between;
      align-items: center;
    `;
    header.innerHTML = `
      <span>Found ${this.currentResults.length} matches</span>
      <span style="opacity: 0.7">Use Tab/Shift+Tab to navigate</span>
    `;
    this.resultsOverlay.appendChild(header);

    // Add result items
    this.currentResults.forEach((result, index) => {
      const item = this.createResultItem(result, index === this.resultIndex);
      item.addEventListener('click', () => {
        this.resultIndex = index;
        const { element, index: elemIndex } = this.currentResults[this.resultIndex];
        this.navigator.currentIndex = elemIndex;
        this.navigator.moveToElement(element);
        this.updateResultsDisplay();
      });
      this.resultsOverlay.appendChild(item);
    });
  }

  // Move to next/previous result
  nextResult() {
    if (this.currentResults.length === 0) return;
    
    this.resultIndex = (this.resultIndex + 1) % this.currentResults.length;
    const { element, index } = this.currentResults[this.resultIndex];
    this.navigator.currentIndex = index;
    this.navigator.moveToElement(element);
    this.updateResultsDisplay();
  }

  prevResult() {
    if (this.currentResults.length === 0) return;
    
    this.resultIndex = this.resultIndex <= 0 ? 
      this.currentResults.length - 1 : 
      this.resultIndex - 1;
    const { element, index } = this.currentResults[this.resultIndex];
    this.navigator.currentIndex = index;
    this.navigator.moveToElement(element);
    this.updateResultsDisplay();
  }

  startSearch() {
    this.searchMode = true;
    this.searchInput.style.display = 'block';
    this.searchInput.value = '';
    this.searchInput.focus();
    
    // Handle input changes
    this.searchInput.oninput = () => {
      this.search(this.searchInput.value);
    };
    
    // Handle keyboard navigation
    this.searchInput.onkeydown = (e) => {
      switch(e.key) {
        case 'Enter':
          if (this.currentResults.length > 0) {
            this.navigator.click();
          }
          this.exitSearch();
          e.preventDefault();
          break;
          
        case 'Escape':
          this.exitSearch();
          e.preventDefault();
          break;
          
        case 'Tab':
          if (this.currentResults.length > 0) {
            if (e.shiftKey) {
              this.prevResult();
            } else {
              this.nextResult();
            }
          }
          e.preventDefault();
          break;
      }
    };
  }

  exitSearch() {
    this.searchMode = false;
    this.searchInput.style.display = 'none';
    this.resultsOverlay.style.display = 'none';
    this.searchInput.value = '';
    this.currentResults = [];
    this.resultIndex = -1;
  }
}

// Attach to window for browser usage
if (typeof window !== 'undefined') {
  window.searchController = new SearchController(window.navigator);
}

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
  module.exports = SearchController;
}

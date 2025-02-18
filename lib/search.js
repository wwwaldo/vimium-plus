// Fuzzy search functionality for our navigator
class SearchController {
  constructor(navigator) {
    this.navigator = navigator;
    this.searchMode = false;
    this.searchInput = this.createSearchInput();
    this.resultsOverlay = this.createResultsOverlay();
    this.currentResults = [];
    this.resultIndex = -1;
    this.totalMatches = 0;
    this.maxResults = 99;  // Store up to 99 matches
    this.visibleResults = 5;  // Show 5 at a time
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

  // Get type indicator for element
  getTypeIndicator(element) {
    switch (element.tagName) {
      case 'A': return { icon: '🔗', label: 'Link' };
      case 'BUTTON': return { icon: '🔘', label: 'Button' };
      case 'INPUT': return { icon: '📝', label: 'Input' };
      default: return { icon: '🔍', label: 'Element' };
    }
  }

  // Create a result item element
  createResultItem(result, isSelected) {
    const { element, score, matches } = result;
    const title = element.getAttribute('title')?.trim() || '';
    const href = element.getAttribute('href')?.trim() || '';
    const ariaLabel = element.getAttribute('aria-label')?.trim() || '';
    const text = element.textContent?.trim() || '';
    const innerText = element.innerText?.trim() || '';
    const displayText = ariaLabel || title || innerText || text;
    const tagName = element.tagName;

    // Choose best text to display
    let displayContent;
    if (tagName === 'A') {
      // Format: Title: innerText (href)
      const displayTitle = title || innerText || 'Untitled';
      const displayText = innerText && innerText !== title ? `: ${innerText}` : '';
      const displayHref = href ? ` (${href})` : '';
      displayContent = `${displayTitle}${displayText}${displayHref}`;
    } else {
      displayContent = displayText || innerText || text || title || href || ariaLabel || 'Unnamed Element';
    }

    const secondaryContent = [
      title && title !== displayContent ? title : null,
      href && href !== displayContent ? href : null,
      ariaLabel && ariaLabel !== displayContent ? ariaLabel : null
    ].filter(Boolean)[0];  // Take first non-null value
    
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
    const { icon } = this.getTypeIndicator(element);
    typeIcon.textContent = icon;
    item.appendChild(typeIcon);

    // Add main content
    const content = document.createElement('div');
    content.style.cssText = 'flex: 1; display: flex; flex-direction: column;';
    
    const primary = document.createElement('div');
    primary.textContent = displayContent;
    content.appendChild(primary);

    if (secondaryContent) {
      const secondary = document.createElement('div');
      secondary.style.cssText = 'font-size: 0.8em; opacity: 0.7;';
      secondary.textContent = secondaryContent;
      content.appendChild(secondary);
    }
    
    item.appendChild(content);

    // Add score indicator (for debugging)
    const scoreIndicator = document.createElement('span');
    scoreIndicator.style.cssText = 'margin-left: 8px; opacity: 0.5; font-size: 0.8em;';
    scoreIndicator.textContent = `Score: ${score}`;
    item.appendChild(scoreIndicator);

    return item;
  }

  // Get the window of results to display
  getVisibleResults() {
    if (this.currentResults.length === 0) return [];
    
    // Center the selected result in the window if possible
    const halfWindow = Math.floor(this.visibleResults / 2);
    let start = this.resultIndex - halfWindow;
    
    // Adjust start if we're near the edges
    if (start < 0) {
      start = 0;
    } else if (start + this.visibleResults > this.currentResults.length) {
      start = Math.max(0, this.currentResults.length - this.visibleResults);
    }
    
    return this.currentResults.slice(start, start + this.visibleResults);
  }

  // Search through all elements and score them
  search(query) {
    console.log('Searching for:', query);
    console.log('Available elements:', window.clickableElements);

    // Special case: * shows all elements
    if (query === '*') {
      this.currentResults = window.clickableElements.map((element, index) => ({
        element,
        index,
        score: 1,  // All elements get same score
        matches: []  // No specific matches to highlight
      }));
      this.totalMatches = this.currentResults.length;
      
      // Move to first result if we have any
      if (this.currentResults.length > 0) {
        this.resultIndex = 0;
        const { element, index } = this.currentResults[0];
        this.navigator.setCurrentIndex(index);
      }

      this.updateResultsDisplay();
      return;
    }

    if (!query) {
      this.currentResults = [];
      this.totalMatches = 0;
      this.updateResultsDisplay();
      return;
    }

    const results = window.clickableElements.map((element, index) => {
      const title = element.getAttribute('title')?.trim() || '';
      const href = element.getAttribute('href')?.trim() || '';
      const ariaLabel = element.getAttribute('aria-label')?.trim() || '';
      const text = element.textContent?.trim() || '';
      const innerText = element.innerText?.trim() || '';
      const displayText = ariaLabel || title || innerText || text;
      const tagName = element.tagName;
      
      const { label } = this.getTypeIndicator(element);
      const searchText = [label, title, href, ariaLabel, text, innerText, displayText]
        .filter(Boolean)  // Remove null/undefined values
        .join(' ');
      const { score, matches } = this.fuzzyMatch(searchText, query);
      return { element, index, score, matches };
    });

    // Sort by score and filter out non-matches
    const allMatches = results.filter(r => r.score > 0);
    console.log('All matches:', allMatches);
    this.totalMatches = allMatches.length;  // Store total matches
    this.currentResults = allMatches
      .sort((a, b) => b.score - a.score)
      .slice(0, this.maxResults);  // Limit to top N results
    
    // If we have more matches than our limit, update totalMatches to indicate this
    if (allMatches.length > this.maxResults) {
      this.totalMatches = this.maxResults + '+';
    }
    
    console.log('Top results:', this.currentResults);

    // Move to first result if we have any
    if (this.currentResults.length > 0) {
      this.resultIndex = 0;
      const { element, index } = this.currentResults[0];
      this.navigator.setCurrentIndex(index);
    }

    this.updateResultsDisplay();
  }

  // Update the results overlay display
  updateResultsDisplay() {
    console.log('Updating display with', this.totalMatches, 'total matches');
    if (this.currentResults.length === 0) {
      console.log('No results, hiding overlay');
      this.resultsOverlay.style.display = 'none';
      return;
    }

    console.log('Showing overlay');
    this.resultsOverlay.style.display = 'block';
    this.resultsOverlay.innerHTML = '';

    // Add header with match count
    const header = document.createElement('div');
    header.style.cssText = `
      padding: 8px 16px;
      font-size: 0.9em;
      opacity: 0.7;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    `;
    header.textContent = `Showing ${this.resultIndex + 1} of ${this.totalMatches} matches`;
    this.resultsOverlay.appendChild(header);

    // Get visible window of results
    const visibleResults = this.getVisibleResults();
    
    // Add result items
    visibleResults.forEach((result) => {
      const item = this.createResultItem(result, result.index === this.currentResults[this.resultIndex].index);
      
      // Add hover effect - just update display
      item.addEventListener('mouseenter', () => {
        this.resultIndex = this.currentResults.findIndex(r => r.index === result.index);
        this.updateResultsDisplay();
      });

      this.resultsOverlay.appendChild(item);
    });

    // Add scroll indicators if needed
    if (this.resultIndex > this.visibleResults / 2) {
      const upIndicator = document.createElement('div');
      upIndicator.style.cssText = `
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 4px;
        background: linear-gradient(to bottom, rgba(78, 205, 196, 0.3), transparent);
      `;
      this.resultsOverlay.appendChild(upIndicator);
    }

    if (this.resultIndex < this.currentResults.length - this.visibleResults / 2) {
      const downIndicator = document.createElement('div');
      downIndicator.style.cssText = `
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        height: 4px;
        background: linear-gradient(to top, rgba(78, 205, 196, 0.3), transparent);
      `;
      this.resultsOverlay.appendChild(downIndicator);
    }
  }

  // Move to next/previous result
  nextResult() {
    if (this.currentResults.length === 0) return;
    
    this.resultIndex = (this.resultIndex + 1) % this.currentResults.length;
    const { element, index } = this.currentResults[this.resultIndex];
    this.navigator.setCurrentIndex(index);
    this.updateResultsDisplay();
  }

  prevResult() {
    if (this.currentResults.length === 0) return;
    
    this.resultIndex = this.resultIndex <= 0 ? 
      this.currentResults.length - 1 : 
      this.resultIndex - 1;
    const { element, index } = this.currentResults[this.resultIndex];
    this.navigator.setCurrentIndex(index);
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
    
    // Remove input handlers when exiting search
    this.searchInput.oninput = null;
    this.searchInput.onkeydown = null;
    
    // Ensure input loses focus
    this.searchInput.blur();
  }
}

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
  module.exports = SearchController;
}

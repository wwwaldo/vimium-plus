// Fuzzy search functionality for our navigator
class SearchController {
  constructor(navigator) {
    this.navigator = navigator;
    this.searchMode = false;
    this.searchInput = this.createSearchInput();
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

  // Fuzzy match score between text and query
  fuzzyMatch(text, query) {
    if (!text || !query) return 0;
    text = text.toLowerCase();
    query = query.toLowerCase();
    
    let score = 0;
    let lastIndex = -1;
    let consecutiveMatches = 0;
    
    for (let char of query) {
      const index = text.indexOf(char, lastIndex + 1);
      if (index === -1) return 0;
      
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
    
    return score;
  }

  // Search through all elements and score them
  search(query) {
    if (!query) {
      this.currentResults = [];
      return;
    }

    const results = this.navigator.clickableElements.map((element, index) => {
      const { title, href, ariaLabel, text } = element.metadata;
      const searchText = [title, href, ariaLabel, text].join(' ');
      const score = this.fuzzyMatch(searchText, query);
      return { element, index, score };
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

    // Log results for debugging
    console.log(`🔍 Found ${this.currentResults.length} matches`);
  }

  // Move to next search result
  nextResult() {
    if (this.currentResults.length === 0) return;
    
    this.resultIndex = (this.resultIndex + 1) % this.currentResults.length;
    const { element, index } = this.currentResults[this.resultIndex];
    this.navigator.currentIndex = index;
    this.navigator.moveToElement(element);
  }

  // Move to previous search result
  prevResult() {
    if (this.currentResults.length === 0) return;
    
    this.resultIndex = this.resultIndex <= 0 ? 
      this.currentResults.length - 1 : 
      this.resultIndex - 1;
    const { element, index } = this.currentResults[this.resultIndex];
    this.navigator.currentIndex = index;
    this.navigator.moveToElement(element);
  }

  // Start search mode
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
            this.resultIndex = (this.resultIndex + (e.shiftKey ? -1 : 1) + this.currentResults.length) % this.currentResults.length;
            const { element, index } = this.currentResults[this.resultIndex];
            this.navigator.currentIndex = index;
            this.navigator.moveToElement(element);
          }
          e.preventDefault();
          break;
      }
    };
  }

  // Exit search mode
  exitSearch() {
    this.searchMode = false;
    this.searchInput.style.display = 'none';
    this.searchInput.value = '';
    this.currentResults = [];
    this.resultIndex = -1;
  }
}

// Attach to window for debugging
window.searchController = new SearchController(window.navigator);

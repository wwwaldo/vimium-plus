/**
 * @jest-environment jsdom
 */

const SearchController = require('../lib/search');

describe('SearchController', () => {
  let searchController;
  let mockNavigator;
  let mockElements;

  // Helper to create a mock element with metadata
  const createMockElement = (tagName, metadata) => ({
    tagName,
    metadata: {
      title: '',
      href: '',
      ariaLabel: '',
      text: '',
      ...metadata
    }
  });

  beforeEach(() => {
    // Setup mock elements
    mockElements = [
      createMockElement('A', { text: 'Home Page', href: '/home' }),
      createMockElement('BUTTON', { text: 'Submit Form' }),
      createMockElement('A', { text: 'About Us', href: '/about' }),
      createMockElement('INPUT', { ariaLabel: 'Search Input' }),
      createMockElement('A', { text: 'Contact', href: '/contact' })
    ];

    // Setup mock navigator
    mockNavigator = {
      clickableElements: mockElements,
      currentIndex: 0,
      moveToElement: jest.fn(),
      click: jest.fn()
    };

    // Create search controller
    document.body.innerHTML = '';
    searchController = new SearchController(mockNavigator);
  });

  describe('UI Creation', () => {
    test('creates search input with correct styles', () => {
      const input = document.querySelector('.navigator-search');
      expect(input).toBeTruthy();
      expect(input.style.display).toBe('none');
    });

    test('creates results overlay with correct styles', () => {
      const overlay = document.querySelector('.search-results-overlay');
      expect(overlay).toBeTruthy();
      expect(overlay.style.display).toBe('none');
    });
  });

  describe('Fuzzy Search', () => {
    test('matches exact text', () => {
      const { score } = searchController.fuzzyMatch('home', 'home');
      expect(score).toBeGreaterThan(0);
    });

    test('matches partial text', () => {
      const { score } = searchController.fuzzyMatch('homepage', 'home');
      expect(score).toBeGreaterThan(0);
    });

    test('matches case insensitive', () => {
      const { score } = searchController.fuzzyMatch('HOME', 'home');
      expect(score).toBeGreaterThan(0);
    });

    test('returns zero score for no match', () => {
      const { score } = searchController.fuzzyMatch('xyz', 'home');
      expect(score).toBe(0);
    });

    test('scores consecutive matches higher', () => {
      const { score: consecutiveScore } = searchController.fuzzyMatch('homepage', 'home');
      const { score: separatedScore } = searchController.fuzzyMatch('help me out', 'home');
      expect(consecutiveScore).toBeGreaterThan(separatedScore);
    });
  });

  describe('Search Results', () => {
    test('finds matching elements', () => {
      searchController.search('home');
      expect(searchController.currentResults.length).toBe(1);
      expect(searchController.currentResults[0].element.metadata.text).toBe('Home Page');
    });

    test('sorts results by score', () => {
      mockElements.push(createMockElement('A', { text: 'Another Home Link' }));
      searchController.search('home');
      expect(searchController.currentResults.length).toBe(2);
      // 'Home Page' should score higher than 'Another Home Link'
      expect(searchController.currentResults[0].element.metadata.text).toBe('Home Page');
    });

    test('updates UI with results', () => {
      searchController.search('home');
      const overlay = document.querySelector('.search-results-overlay');
      expect(overlay.style.display).toBe('block');
      expect(overlay.textContent).toContain('Found 1 matches');
    });

    test('clears results on empty query', () => {
      searchController.search('home');
      expect(searchController.currentResults.length).toBe(1);
      searchController.search('');
      expect(searchController.currentResults.length).toBe(0);
      const overlay = document.querySelector('.search-results-overlay');
      expect(overlay.style.display).toBe('none');
    });
  });

  describe('Navigation', () => {
    beforeEach(() => {
      searchController.search('a'); // Should match multiple elements
    });

    test('moves to first result on search', () => {
      expect(mockNavigator.moveToElement).toHaveBeenCalled();
      expect(searchController.resultIndex).toBe(0);
    });

    test('cycles through results with nextResult', () => {
      const initialIndex = searchController.resultIndex;
      searchController.nextResult();
      expect(searchController.resultIndex).toBe((initialIndex + 1) % searchController.currentResults.length);
      expect(mockNavigator.moveToElement).toHaveBeenCalled();
    });

    test('cycles through results with prevResult', () => {
      searchController.resultIndex = 0;
      searchController.prevResult();
      expect(searchController.resultIndex).toBe(searchController.currentResults.length - 1);
      expect(mockNavigator.moveToElement).toHaveBeenCalled();
    });
  });

  describe('Keyboard Interaction', () => {
    beforeEach(() => {
      searchController.startSearch();
      searchController.search('a');
    });

    test('handles Enter key', () => {
      const event = new KeyboardEvent('keydown', { key: 'Enter' });
      searchController.searchInput.dispatchEvent(event);
      expect(mockNavigator.click).toHaveBeenCalled();
      expect(searchController.searchMode).toBe(false);
    });

    test('handles Escape key', () => {
      const event = new KeyboardEvent('keydown', { key: 'Escape' });
      searchController.searchInput.dispatchEvent(event);
      expect(searchController.searchMode).toBe(false);
      expect(searchController.searchInput.style.display).toBe('none');
    });

    test('handles Tab key', () => {
      const event = new KeyboardEvent('keydown', { key: 'Tab' });
      const initialIndex = searchController.resultIndex;
      searchController.searchInput.dispatchEvent(event);
      expect(searchController.resultIndex).not.toBe(initialIndex);
      expect(mockNavigator.moveToElement).toHaveBeenCalled();
    });

    test('handles Shift+Tab key', () => {
      const event = new KeyboardEvent('keydown', { key: 'Tab', shiftKey: true });
      searchController.resultIndex = 1;
      searchController.searchInput.dispatchEvent(event);
      expect(searchController.resultIndex).toBe(0);
      expect(mockNavigator.moveToElement).toHaveBeenCalled();
    });
  });
});

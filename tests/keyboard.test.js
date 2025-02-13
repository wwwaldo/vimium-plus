/**
 * @jest-environment jsdom
 */

describe('KeyboardController', () => {
  let keyboard;
  let mockNavigator;
  let mockSearchController;
  let mockRecorder;
  let mockHighlighter;
  let mockKeycast;

  beforeEach(() => {
    // Mock window.scrollTo and window.scrollBy
    window.scrollTo = jest.fn();
    window.scrollBy = jest.fn();
    
    // Setup mocks
    mockNavigator = {
      enable: jest.fn(),
      disable: jest.fn(),
      next: jest.fn(),
      prev: jest.fn(),
      click: jest.fn()
    };
    
    mockSearchController = {
      searchMode: false,
      startSearch: jest.fn(),
      exitSearch: jest.fn()
    };
    
    mockRecorder = {
      recording: false
    };
    
    mockHighlighter = {
      enable: jest.fn(),
      disable: jest.fn()
    };
    
    mockKeycast = {
      enable: jest.fn(),
      disable: jest.fn()
    };
    
    window.keycast = mockKeycast;

    // Create KeyboardController with mocked dependencies
    const KeyboardController = require('../lib/keyboard.js');
    keyboard = new KeyboardController({
      navigator: mockNavigator,
      searchController: mockSearchController,
      recorder: mockRecorder,
      highlighter: mockHighlighter
    });
  });

  describe('Navigation Mode', () => {
    test('Shift+Space toggles navigation mode', () => {
      const event = new KeyboardEvent('keydown', { key: ' ', shiftKey: true });
      keyboard.enabled = false;
      
      document.dispatchEvent(event);
      expect(keyboard.enabled).toBe(true);
      expect(mockNavigator.enable).toHaveBeenCalled();
      
      document.dispatchEvent(event);
      expect(keyboard.enabled).toBe(false);
      expect(mockNavigator.disable).toHaveBeenCalled();
    });

    test('j/k keys navigate elements when enabled', () => {
      keyboard.enabled = true;
      
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'j' }));
      expect(mockNavigator.next).toHaveBeenCalled();
      
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'k' }));
      expect(mockNavigator.prev).toHaveBeenCalled();
    });

    test('Enter clicks current element when enabled', () => {
      keyboard.enabled = true;
      
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
      expect(mockNavigator.click).toHaveBeenCalled();
    });
  });

  describe('Search Mode', () => {
    test('/ key enters search mode', () => {
      keyboard.enabled = true;
      
      document.dispatchEvent(new KeyboardEvent('keydown', { key: '/' }));
      expect(mockSearchController.startSearch).toHaveBeenCalled();
      expect(mockKeycast.disable).toHaveBeenCalled();
    });

    test('Escape exits search mode', () => {
      keyboard.enabled = true;
      mockSearchController.searchMode = true;
      
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
      expect(mockSearchController.exitSearch).toHaveBeenCalled();
      expect(mockKeycast.enable).toHaveBeenCalled();
    });
  });

  describe('Scroll Navigation', () => {
    test('g key scrolls to top/bottom', () => {
      keyboard.enabled = true;
      
      // Single g scrolls to top
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'g' }));
      expect(window.scrollTo).toHaveBeenCalledWith({
        top: 0,
        behavior: 'smooth'
      });
      
      // Double g scrolls to bottom
      keyboard.lastKeyPressTime = Date.now();
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'g' }));
      expect(window.scrollTo).toHaveBeenCalledWith({
        top: document.documentElement.scrollHeight,
        behavior: 'smooth'
      });
    });

    test('G key scrolls to bottom', () => {
      keyboard.enabled = true;
      
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'G' }));
      expect(window.scrollTo).toHaveBeenCalledWith({
        top: document.documentElement.scrollHeight,
        behavior: 'smooth'
      });
    });

    test('d/u keys scroll half page down/up', () => {
      keyboard.enabled = true;
      const halfHeight = window.innerHeight * 0.5;
      
      // Test 'd' key for half page down
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'd' }));
      expect(window.scrollBy).toHaveBeenCalledWith({
        top: halfHeight,
        behavior: 'smooth'
      });
      
      // Test 'u' key for half page up
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'u' }));
      expect(window.scrollBy).toHaveBeenCalledWith({
        top: -halfHeight,
        behavior: 'smooth'
      });
    });

    test('d/u keys do nothing when modifier keys are pressed', () => {
      keyboard.enabled = true;
      
      // Test with various modifier combinations
      ['shiftKey', 'altKey', 'ctrlKey', 'metaKey'].forEach(modifier => {
        const eventProps = { key: 'd', [modifier]: true };
        document.dispatchEvent(new KeyboardEvent('keydown', eventProps));
        expect(window.scrollBy).not.toHaveBeenCalled();
        
        const eventPropsU = { key: 'u', [modifier]: true };
        document.dispatchEvent(new KeyboardEvent('keydown', eventPropsU));
        expect(window.scrollBy).not.toHaveBeenCalled();
      });
    });
  });

  describe('Highlight Mode', () => {
    test('f key toggles highlights', () => {
      keyboard.enabled = true;
      keyboard.highlightsVisible = false;
      
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'f' }));
      expect(keyboard.highlightsVisible).toBe(true);
      expect(mockHighlighter.enable).toHaveBeenCalled();
      
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'f' }));
      expect(keyboard.highlightsVisible).toBe(false);
      expect(mockHighlighter.disable).toHaveBeenCalled();
    });

    test('highlight state is independent of navigation mode', () => {
      keyboard.highlightsVisible = true;
      keyboard.enabled = false;
      
      const event = new KeyboardEvent('keydown', { key: ' ', shiftKey: true });
      document.dispatchEvent(event); // Enable navigation
      
      expect(keyboard.enabled).toBe(true);
      expect(keyboard.highlightsVisible).toBe(true);
      expect(mockHighlighter.enable).not.toHaveBeenCalled();
    });
  });
});

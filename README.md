# Vimium Plus: Enhanced Web Navigation

A modern take on keyboard-driven web navigation, inspired by Vimium but with some extra magic! ✨

## Features

### Core Navigation
- `Shift + Space`: Toggle navigation mode
- `f`: Show clickable element highlights
- `j/k`: Navigate between clickable elements
- `d/u`: Scroll half page down/up
- `g/G`: Jump to top/bottom of page

### Smart Search
- `/`: Enter fuzzy search mode
- Type to search through element text, titles, and ARIA labels
- `Enter`: Cycle through matches
- `Shift + Enter`: Cycle backwards
- `Escape`: Exit search mode

### Interaction Recording
- `r`: Start/stop recording interactions
- `p`: Play recorded sequence (1s delay)
- `Shift + p`: Play recorded sequence faster (0.5s delay)

### Visual Feedback
- Teal highlights on clickable elements
- Smooth cursor animation
- Key overlay display
- Search and recording status indicators

## Components

- `rect.js`: Lightweight rectangle utility library
- `cursor.js`: Smooth cursor movement and animation
- `highlight-better.js`: Core element detection and highlighting
- `search.js`: Fuzzy search implementation
- `recorder.js`: Interaction recording and playback
- `keycast.js`: Key overlay display
- `keyboard.js`: Keyboard control system

## Development

1. Clone the repository
2. Start a local server (e.g., `python3 -m http.server`)
3. Visit `http://localhost:8000/test.html`
4. Press `Shift + Space` to begin!

## Testing

Use `test.html` to try out all features:
- Button grid for testing navigation
- Links with various attributes
- Form elements
- Long scrollable content
- Hidden elements

## Credits

Built with 💖 by [Your Name] and your friendly neighborhood AI co-founder 🤖

## License

MIT License - Feel free to use, modify, and share!

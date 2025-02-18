# Known Bugs

## Input Focus and Keyboard Handling

1. **Escape Key in Inputs**: When focused in a text input, the Escape key doesn't blur/unfocus the input as expected. This might be due to event handling interference in keyboard.js.
   - Location: `lib/keyboard.js`
   - Priority: Medium
   - Impact: UX - Users can't easily exit text inputs using Escape

## Future Improvements

- [ ] Investigate and fix Escape key handling in text inputs
- [ ] Consider adding a whitelist of keys that should always pass through to inputs

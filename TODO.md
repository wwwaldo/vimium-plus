# Vimium Plus TODO

## Search and Navigation Improvements

### Cursor Selection
- [x] Fix cursor selection behavior bugs
  - Fixed cursor positioning during viewport changes
  - Moved to absolute positioning for reliable coordinates
  - Cleaned up cursor code organization
- [ ] Ensure cursor properly tracks selected elements
- [x] Check for race conditions in cursor position updates
  - Fixed scroll animation race conditions
  - Properly wait for scroll to finish before positioning

### Record Mode
- [ ] Test record functionality with new visualization modes
- [ ] Ensure record works with both cursor and highlight box modes
- [ ] Fix any recording issues with the new navigation system

## General
- [ ] Add more comprehensive test coverage
- [ ] Improve error handling
- [ ] Add performance monitoring

javascript:(function(){
  // First remove any existing highlights
  document.querySelectorAll('.vimium-plus-highlight').forEach(el => el.remove());

  // Create container
  const container = document.createElement('div');
  container.id = 'vimium-plus-highlights';
  document.body.appendChild(container);

  // Find all clickable elements
  const elements = document.querySelectorAll('a, button, input[type="button"], input[type="submit"], [role="button"], [onclick], [tabindex]:not([tabindex="-1"])');
  const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEEAD'];
  let colorIndex = 0;

  elements.forEach(element => {
    if (!element.offsetParent) return;
    
    const rect = element.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;

    const highlight = document.createElement('div');
    const color = colors[colorIndex++ % colors.length];
    
    highlight.className = 'vimium-plus-highlight';
    highlight.style.cssText = `
      position: fixed;
      z-index: 999999;
      pointer-events: none;
      mix-blend-mode: multiply;
      border: 2px solid ${color}88;
      background-color: ${color}22;
      border-radius: 3px;
      left: ${rect.left + window.scrollX}px;
      top: ${rect.top + window.scrollY}px;
      width: ${rect.width}px;
      height: ${rect.height}px;
      box-shadow: 0 0 0 1px rgba(255,255,255,0.3);
    `;
    
    container.appendChild(highlight);
  });

  // Add toggle functionality
  if (!window._toggleHighlights) {
    window._toggleHighlights = function(e) {
      if (e.key.toLowerCase() === 'h' && e.altKey) {
        const container = document.getElementById('vimium-plus-highlights');
        if (container) {
          container.remove();
        } else {
          document.dispatchEvent(new CustomEvent('refreshHighlights'));
        }
      }
    };
    document.addEventListener('keydown', window._toggleHighlights);
  }

  console.log('🎯 Highlights ready! Use Option(⌥) + H to toggle');
})();

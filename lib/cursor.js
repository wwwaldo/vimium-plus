// A utility for rendering a fake cursor at arbitrary coordinates
const createCursor = () => {
  const cursor = document.createElement('div');
  cursor.id = 'fake-cursor';
  cursor.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
      <path d="M3 3l7.07 16.97 2.51-7.39 7.39-2.51L3 3z" fill="black"/>
      <path d="M3 3l7.07 16.97 2.51-7.39 7.39-2.51L3 3z"/>
    </svg>
  `;
  
  cursor.style.cssText = `
    position: absolute !important;
    z-index: 2147483647 !important;
    pointer-events: none !important;
    width: 24px !important;
    height: 24px !important;
    transition: all 0.1s ease !important;
    filter: drop-shadow(0 0 1px rgba(0,0,0,0.3)) !important;
    visibility: visible !important;
    opacity: 1 !important;
    display: block !important;
    clip: auto !important;
    overflow: visible !important;
  `;
  
  document.body.appendChild(cursor);
  return cursor;
};

// Utility to move cursor to coordinates with smooth linear interpolation
const moveCursor = (cursor, targetX, targetY, shouldAnimate = true) => {
  if (!shouldAnimate) {
    cursor.style.transition = 'none';
    cursor.style.left = `${targetX}px`;
    cursor.style.top = `${targetY}px`;
    return;
  }

  // Get current position
  const currentX = parseFloat(cursor.style.left) || 0;
  const currentY = parseFloat(cursor.style.top) || 0;
  
  // Animation settings
  const duration = 200; // ms
  const frames = 20; // number of frames
  const interval = duration / frames;
  
  // Calculate steps
  const stepX = (targetX - currentX) / frames;
  const stepY = (targetY - currentY) / frames;
  
  // Remove any existing transition
  cursor.style.transition = 'none';
  
  // Animate
  let frame = 0;
  const animate = () => {
    frame++;
    
    // Linear interpolation
    const x = currentX + (stepX * frame);
    const y = currentY + (stepY * frame);
    
    cursor.style.left = `${x}px`;
    cursor.style.top = `${y}px`;
    
    if (frame < frames) {
      setTimeout(animate, interval);
    }
  };
  
  animate();
};

// Utility to simulate click animation
const simulateClick = (cursor) => {
  cursor.style.transform = 'scale(0.9)';
  setTimeout(() => {
    cursor.style.transform = 'scale(1)';
  }, 100);
};

// Export utilities
window.cursorUtils = {
  createCursor,
  moveCursor,
  simulateClick
};

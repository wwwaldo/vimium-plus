// A lightweight rectangle utility inspired by Vimium's rect.js
const Rect = {
  // Create a rect from coordinates
  create(x1, y1, x2, y2) {
    return {
      bottom: y2,
      top: y1,
      left: x1,
      right: x2,
      width: x2 - x1,
      height: y2 - y1,
    };
  },

  // Create a rect from a DOMRect
  fromDOMRect(domRect) {
    return this.create(
      domRect.left,
      domRect.top,
      domRect.right,
      domRect.bottom
    );
  },

  // Check if two rects overlap
  intersects(rect1, rect2) {
    return !(rect2.left > rect1.right || 
             rect2.right < rect1.left || 
             rect2.top > rect1.bottom ||
             rect2.bottom < rect1.top);
  },

  // Get the intersection area of two rects
  intersection(rect1, rect2) {
    const left = Math.max(rect1.left, rect2.left);
    const right = Math.min(rect1.right, rect2.right);
    const top = Math.max(rect1.top, rect2.top);
    const bottom = Math.min(rect1.bottom, rect2.bottom);
    
    if (left < right && top < bottom) {
      return this.create(left, top, right, bottom);
    }
    return null;
  },

  // Check if a point is inside a rect
  containsPoint(rect, x, y) {
    return x >= rect.left && x <= rect.right && 
           y >= rect.top && y <= rect.bottom;
  }
};

// Export to window
window.Rect = Rect;

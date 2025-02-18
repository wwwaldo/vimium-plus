// Element fingerprinting and matching logic for future AI assistant integration
export class ElementFingerprintMatcher {
  // Score how well an element matches a fingerprint
  matchScore(element, fingerprint) {
    let score = 0;
    
    // Exact matches are worth a lot
    if (element.metadata.href === fingerprint.href) score += 10;
    if (element.metadata.title === fingerprint.title) score += 10;
    if (element.metadata.ariaLabel === fingerprint.ariaLabel) score += 10;
    if (element.element.id === fingerprint.id) score += 15;
    if (element.element.className === fingerprint.className) score += 5;
    if (element.element.tagName.toLowerCase() === fingerprint.tag) score += 5;
    
    // Partial text match
    if (element.metadata.text.includes(fingerprint.text) ||
        fingerprint.text.includes(element.metadata.text)) {
      score += 8;
    }
    
    return score;
  }

  // Find the best matching element for a fingerprint
  findMatchingElement(elements, fingerprint) {
    return elements
      .map(element => {
        const score = this.matchScore(element, fingerprint);
        return { element, score };
      })
      .filter(({ score }) => score > 0)
      .sort((a, b) => b.score - a.score)[0]?.element;
  }
}

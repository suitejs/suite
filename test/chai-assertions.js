/**
 * TODO: Add typescript definition for custom assertions
 */
chai.use((chai, { flag }) => {
  /**
   * Check element is visible
   * Useful for testing popups and disclosures
   * Ref: https://github.com/testing-library/jest-dom/blob/main/src/to-be-visible.js
   * @this {import('chai').AssertionStatic}
   */
  chai.Assertion.addProperty('visible', function () {
    const element = flag(this, 'object');

    const isInDocument = element.ownerDocument === element.getRootNode({ composed: true });
    const isVisible = isInDocument && isElementVisible(element);

    this.assert(
      isVisible,
      `Element is not visible${isInDocument ? '' : ' (element is not in the document)'}`,
      'Element is visible'
    );
  });

  function isStyleVisible(element) {
    const { getComputedStyle } = element.ownerDocument.defaultView;

    const { display, visibility, opacity } = getComputedStyle(element);
    return (
      display !== 'none' &&
      visibility !== 'hidden' &&
      visibility !== 'collapse' &&
      opacity !== '0' &&
      opacity !== 0
    );
  }

  function isAttributeVisible(element, previousElement) {
    return (
      !element.hasAttribute('hidden') &&
      (element.nodeName === 'DETAILS' && previousElement.nodeName !== 'SUMMARY'
        ? element.hasAttribute('open')
        : true)
    );
  }

  function isElementVisible(element, previousElement) {
    return (
      isStyleVisible(element) &&
      isAttributeVisible(element, previousElement) &&
      (!element.parentElement || isElementVisible(element.parentElement, element))
    );
  }
});

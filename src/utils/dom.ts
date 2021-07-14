// Ref: https://github.com/tailwindlabs/headlessui/blob/develop/packages/%40headlessui-react/src/utils/focus-management.ts
// Credit:
//  - https://stackoverflow.com/a/30753870
const focusableSelector = [
  '[contentEditable=true]',
  '[tabindex]',
  'a[href]',
  'area[href]',
  'button:not([disabled])',
  'iframe',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])'
]
  .map(
    process.env.NODE_ENV === 'test'
      ? // TODO: Remove this once JSDOM fixes the issue where an element that is
        // "hidden" can be the document.activeElement, because this is not possible
        // in real browsers.
        selector => `${selector}:not([tabindex='-1']):not([style*='display: none'])`
      : selector => `${selector}:not([tabindex='-1'])`
  )
  .join(',');

export function isFocusableElement(element: HTMLElement) {
  if (element === document.body) return false;

  return element.matches(focusableSelector);
}

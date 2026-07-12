import '@testing-library/jest-dom';

// jsdom doesn't implement these — Radix UI (Select, etc.) calls them during
// pointer interactions, so tests that open/select via userEvent need stubs.
// Guarded because scripts/**/*.test.ts run in the node environment, where
// `Element` doesn't exist.
if (typeof Element !== 'undefined') {
  if (!Element.prototype.hasPointerCapture) {
    Element.prototype.hasPointerCapture = () => false;
  }
  if (!Element.prototype.setPointerCapture) {
    Element.prototype.setPointerCapture = () => {};
  }
  if (!Element.prototype.releasePointerCapture) {
    Element.prototype.releasePointerCapture = () => {};
  }
  if (!Element.prototype.scrollIntoView) {
    Element.prototype.scrollIntoView = () => {};
  }
}

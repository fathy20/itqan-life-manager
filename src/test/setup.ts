import "@testing-library/jest-dom";
import { vi } from "vitest";

Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => {},
  }),
});

// IntersectionObserver mock
class IO {
  observe() {}
  unobserve() {}
  disconnect() {}
  takeRecords() { return []; }
}
window.IntersectionObserver = IO as unknown as typeof IntersectionObserver;

// ResizeObserver mock
class RO {
  observe() {}
  unobserve() {}
  disconnect() {}
}
window.ResizeObserver = RO as typeof ResizeObserver;

// scrollTo
window.scrollTo = vi.fn() as typeof window.scrollTo;

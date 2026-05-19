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
(window as any).IntersectionObserver = IO;

// ResizeObserver mock
class RO {
  observe() {}
  unobserve() {}
  disconnect() {}
}
(window as any).ResizeObserver = RO;

// scrollTo
window.scrollTo = vi.fn() as any;

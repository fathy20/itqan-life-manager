import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor, act } from "@testing-library/react";

vi.mock("../../lib/api/index", () => ({
  adhkarApiNew: {
    getToday: vi.fn(),
    getStats: vi.fn(),
    logBlock: vi.fn(),
    updateCounter: vi.fn(),
  },
}));

import { adhkarApiNew } from "../../lib/api/index";
import { useAdhkarNew } from "../useAdhkarNew";

const mocks = adhkarApiNew as unknown as Record<string, ReturnType<typeof vi.fn>>;

beforeEach(() => {
  Object.values(mocks).forEach((m) => m.mockReset());
});

describe("useAdhkarNew", () => {
  it("starts in loading state", () => {
    mocks.getToday.mockReturnValue(new Promise(() => {}));
    mocks.getStats.mockReturnValue(new Promise(() => {}));
    const { result } = renderHook(() => useAdhkarNew());
    expect(result.current.loading).toBe(true);
    expect(result.current.todayLog).toBeNull();
    expect(result.current.stats).toBeNull();
  });

  it("handles empty success response", async () => {
    mocks.getToday.mockResolvedValue({ success: true, data: null });
    mocks.getStats.mockResolvedValue({ success: true, data: null });
    const { result } = renderHook(() => useAdhkarNew());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.todayLog).toBeNull();
    expect(result.current.stats).toBeNull();
    expect(result.current.error).toBeNull();
  });

  it("populates data on success", async () => {
    const todayLog = { date: "2026-05-15", blocks: ["morning"] } as any;
    const stats = { total: 7 } as any;
    mocks.getToday.mockResolvedValue({ success: true, data: todayLog });
    mocks.getStats.mockResolvedValue({ success: true, data: stats });
    const { result } = renderHook(() => useAdhkarNew());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.todayLog).toEqual(todayLog);
    expect(result.current.stats).toEqual(stats);
  });

  it("sets error when fetch throws", async () => {
    mocks.getToday.mockRejectedValue(new Error("boom"));
    mocks.getStats.mockRejectedValue(new Error("boom"));
    const { result } = renderHook(() => useAdhkarNew());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.error).toMatch(/خطأ/);
  });

  it("optimistically updates counter on success", async () => {
    mocks.getToday.mockResolvedValue({ success: true, data: null });
    mocks.getStats.mockResolvedValue({ success: true, data: null });
    const updated = { date: "2026-05-15", counters: { tasbih: 33 } } as any;
    mocks.updateCounter.mockResolvedValue({ success: true, data: updated });

    const { result } = renderHook(() => useAdhkarNew());
    await waitFor(() => expect(result.current.loading).toBe(false));
    await act(async () => {
      await result.current.updateCounter("tasbih", 33);
    });
    expect(result.current.todayLog).toEqual(updated);
  });
});

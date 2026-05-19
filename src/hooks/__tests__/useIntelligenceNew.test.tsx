import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";

vi.mock("../../lib/api/intelligence", () => ({
  intelligenceApiNew: { getDashboard: vi.fn() },
}));

import { intelligenceApiNew } from "../../lib/api/intelligence";
import { useIntelligenceNew } from "../useIntelligenceNew";

const getDashboard = intelligenceApiNew.getDashboard as unknown as ReturnType<typeof vi.fn>;

beforeEach(() => getDashboard.mockReset());

describe("useIntelligenceNew", () => {
  it("loading -> data on success", async () => {
    getDashboard.mockResolvedValue({ success: true, data: { score: 80 } });
    const { result } = renderHook(() => useIntelligenceNew());
    expect(result.current.loading).toBe(true);
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.report).toEqual({ score: 80 });
    expect(result.current.error).toBeNull();
  });

  it("sets error message on failed response", async () => {
    getDashboard.mockResolvedValue({ success: false, message: "تعذر التحميل" });
    const { result } = renderHook(() => useIntelligenceNew());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.report).toBeNull();
    expect(result.current.error).toBe("تعذر التحميل");
  });

  it("refetch refreshes data after success", async () => {
    getDashboard.mockResolvedValueOnce({ success: true, data: { score: 1 } });
    const { result } = renderHook(() => useIntelligenceNew());
    await waitFor(() => expect(result.current.report).toEqual({ score: 1 }));
    getDashboard.mockResolvedValueOnce({ success: true, data: { score: 2 } });
    await result.current.refetch();
    await waitFor(() => expect(result.current.report).toEqual({ score: 2 }));
  });
});

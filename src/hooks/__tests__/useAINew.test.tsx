import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";

vi.mock("../../lib/api/ai", () => ({
  aiApiNew: {
    chat: vi.fn(),
    planDay: vi.fn(),
    weeklyReview: vi.fn(),
  },
}));

import { aiApiNew } from "../../lib/api/ai";
import { useAINew } from "../useAINew";

const mocks = aiApiNew as unknown as Record<string, ReturnType<typeof vi.fn>>;

beforeEach(() => Object.values(mocks).forEach((m) => m.mockReset()));

describe("useAINew", () => {
  it("starts empty", () => {
    const { result } = renderHook(() => useAINew());
    expect(result.current.messages).toEqual([]);
    expect(result.current.chatLoading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it("appends user + coach messages on successful chat", async () => {
    mocks.chat.mockResolvedValue({ success: true, data: { reply: "وعليكم السلام" } });
    const { result } = renderHook(() => useAINew());
    await act(async () => {
      await result.current.sendMessage("سلام");
    });
    expect(result.current.messages).toEqual([
      { role: "user", text: "سلام" },
      { role: "coach", text: "وعليكم السلام" },
    ]);
    expect(result.current.chatLoading).toBe(false);
  });

  it("rolls back user message and sets error on failure", async () => {
    mocks.chat.mockResolvedValue({ success: false, message: "فشل" });
    const { result } = renderHook(() => useAINew());
    await act(async () => {
      await result.current.sendMessage("hi");
    });
    expect(result.current.messages).toEqual([]);
    expect(result.current.error).toBe("فشل");
  });

  it("handles network error", async () => {
    mocks.chat.mockRejectedValue(new Error("net"));
    const { result } = renderHook(() => useAINew());
    await act(async () => {
      await result.current.sendMessage("hi");
    });
    expect(result.current.messages).toEqual([]);
    expect(result.current.error).toMatch(/الشبكة/);
  });

  it("clearChat empties messages", async () => {
    mocks.chat.mockResolvedValue({ success: true, data: { reply: "ok" } });
    const { result } = renderHook(() => useAINew());
    await act(async () => { await result.current.sendMessage("a"); });
    act(() => result.current.clearChat());
    expect(result.current.messages).toEqual([]);
  });

  it("generatePlanDay populates planDay", async () => {
    mocks.planDay.mockResolvedValue({ success: true, data: { tasks: ["a"] } });
    const { result } = renderHook(() => useAINew());
    await act(async () => { await result.current.generatePlanDay(); });
    expect(result.current.planDay).toEqual({ tasks: ["a"] });
    expect(result.current.planLoading).toBe(false);
  });
});

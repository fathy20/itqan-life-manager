import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { Skeleton } from "../skeleton";

describe("Skeleton", () => {
  it("renders with default classes", () => {
    const { container } = render(<Skeleton data-testid="sk" />);
    const el = container.firstChild as HTMLElement;
    expect(el).toBeInTheDocument();
    expect(el.className).toMatch(/animate-pulse/);
    expect(el.className).toMatch(/bg-muted/);
  });

  it("merges custom className", () => {
    const { container } = render(<Skeleton className="h-10 w-20" />);
    const el = container.firstChild as HTMLElement;
    expect(el.className).toMatch(/h-10/);
    expect(el.className).toMatch(/w-20/);
  });
});

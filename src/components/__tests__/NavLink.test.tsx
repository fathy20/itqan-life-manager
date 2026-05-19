import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { NavLink } from "../NavLink";

function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route
          path="*"
          element={
            <NavLink
              to="/home"
              className="base"
              activeClassName="is-active"
            >
              Home
            </NavLink>
          }
        />
      </Routes>
    </MemoryRouter>,
  );
}

describe("NavLink", () => {
  it("renders link with base class", () => {
    renderAt("/other");
    const a = screen.getByRole("link", { name: "Home" });
    expect(a).toHaveAttribute("href", "/home");
    expect(a.className).toMatch(/base/);
    expect(a.className).not.toMatch(/is-active/);
  });

  it("applies activeClassName when route matches", () => {
    renderAt("/home");
    const a = screen.getByRole("link", { name: "Home" });
    expect(a.className).toMatch(/is-active/);
  });
});

import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import HomePage from "./page";

describe("首頁", () => {
  it("顯示平台名稱與歡迎訊息", () => {
    render(<HomePage />);

    expect(
      screen.getByRole("heading", { name: "歡迎使用 mondayclass" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText("測試環境已就緒，開始打造你的健身教練平台。"),
    ).toBeInTheDocument();
  });
});

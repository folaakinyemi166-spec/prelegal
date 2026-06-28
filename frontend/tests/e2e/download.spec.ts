import { test, expect } from "@playwright/test";

test.describe("Download PDF button", () => {
  test("clicking Download PDF triggers window.print", async ({ page }) => {
    await page.goto("/");

    // Replace window.print with a no-op that records whether it was called.
    await page.evaluate(() => {
      (window as unknown as Record<string, unknown>).__printCalled__ = false;
      window.print = () => {
        (window as unknown as Record<string, unknown>).__printCalled__ = true;
      };
    });

    await page.getByRole("button", { name: "Download PDF" }).click();

    const printCalled = await page.evaluate(
      () => (window as unknown as Record<string, unknown>).__printCalled__
    );
    expect(printCalled).toBe(true);
  });

  test("Download PDF button is visible and enabled", async ({ page }) => {
    await page.goto("/");
    const button = page.getByRole("button", { name: "Download PDF" });
    await expect(button).toBeVisible();
    await expect(button).toBeEnabled();
  });
});

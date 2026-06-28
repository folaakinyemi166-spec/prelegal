import { test, expect } from "@playwright/test";

const ONE_PAGE_HEIGHT_PX = 1122;

test.describe("print / PDF layout", () => {
  test.beforeEach(async ({ page }) => {
    // Select a document before testing print layout
    await page.goto("/");
    await page.getByRole("button", { name: /Mutual Non-Disclosure/ }).click();
    await page.emulateMedia({ media: "print" });
  });

  test("document spans multiple pages in print mode", async ({ page }) => {
    const height = await page.evaluate(
      () => document.documentElement.scrollHeight
    );
    expect(height).toBeGreaterThan(ONE_PAGE_HEIGHT_PX);
  });

  test("Key Terms section is visible in print mode", async ({ page }) => {
    await expect(page.getByRole("heading", { name: "Key Terms" })).toBeVisible();
  });

  test("Standard Terms section is visible in print mode", async ({ page }) => {
    await expect(page.getByRole("heading", { name: "Standard Terms" })).toBeVisible();
  });

  test("form sidebar is hidden in print mode", async ({ page }) => {
    await expect(page.locator("aside")).toBeHidden();
  });
});

import { test, expect } from "@playwright/test";

// One A4 page at 96 dpi is ~1122px tall. The NDA (cover page + 11 standard
// terms) should exceed this in every browser when print overflow is unrestricted.
const ONE_PAGE_HEIGHT_PX = 1122;

test.describe("print / PDF layout", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.emulateMedia({ media: "print" });
  });

  test("document spans multiple pages in print mode", async ({ page }) => {
    const height = await page.evaluate(
      () => document.documentElement.scrollHeight
    );
    expect(height).toBeGreaterThan(ONE_PAGE_HEIGHT_PX);
  });

  test("NDA title is visible in print mode", async ({ page }) => {
    await expect(
      page.getByRole("heading", { name: "Mutual Non-Disclosure Agreement" })
    ).toBeVisible();
  });

  test("standard terms section is visible in print mode", async ({ page }) => {
    await expect(
      page.getByRole("heading", { name: "Standard Terms" })
    ).toBeVisible();
  });

  test("form sidebar is hidden in print mode", async ({ page }) => {
    await expect(page.locator("aside")).toBeHidden();
  });

  test("signature table is present in print mode", async ({ page }) => {
    await expect(page.getByRole("columnheader", { name: "PARTY 1" })).toBeVisible();
    await expect(page.getByRole("columnheader", { name: "PARTY 2" })).toBeVisible();
  });
});

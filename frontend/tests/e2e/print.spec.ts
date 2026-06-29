import { test, expect } from "@playwright/test";
import { selectDocument } from "./helpers";

const ONE_PAGE_HEIGHT_PX = 1122;

test.describe("print / PDF layout", () => {
  test.beforeEach(async ({ page }) => {
    await selectDocument(page, "Mutual Non-Disclosure");
    await page.emulateMedia({ media: "print" });
  });

  test("document spans multiple pages in print mode", async ({ page }) => {
    // Wait for the template body to finish loading before checking height
    await expect(page.getByTestId("template-content")).toBeVisible({ timeout: 10000 });
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

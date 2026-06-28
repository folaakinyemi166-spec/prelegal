import { test, expect } from "@playwright/test";

async function selectDocument(page: import("@playwright/test").Page, name: string) {
  await page.goto("/");
  await page.getByRole("button", { name: new RegExp(name) }).click();
}

test.describe("Download PDF button", () => {
  test("clicking Download PDF triggers window.print", async ({ page }) => {
    await selectDocument(page, "Mutual Non-Disclosure");

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

  test("Download PDF button is visible and enabled after selecting a document", async ({ page }) => {
    await selectDocument(page, "Mutual Non-Disclosure");
    const button = page.getByRole("button", { name: "Download PDF" });
    await expect(button).toBeVisible();
    await expect(button).toBeEnabled();
  });

  test("Download PDF button is not visible on catalog page", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("button", { name: "Download PDF" })).not.toBeVisible();
  });
});

import { test, expect, Locator, Page } from "@playwright/test";

// Finds an input/textarea that immediately follows a label matching `labelText`
// inside the sidebar form, so tests don't accidentally match preview text.
function field(page: Page, labelText: string): Locator {
  return page
    .locator("aside")
    .locator(`label:has-text("${labelText}") ~ :is(input, textarea)`);
}

// The live preview panel.
function preview(page: Page): Locator {
  return page.locator("main");
}

test.describe("form fields reflect in preview", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("purpose text appears in preview", async ({ page }) => {
    const input = field(page, "Purpose");
    await input.clear();
    await input.fill("Testing a new AI product with a potential partner.");
    await expect(preview(page)).toContainText(
      "Testing a new AI product with a potential partner."
    );
  });

  test("effective date appears formatted in preview", async ({ page }) => {
    await page.locator('aside input[type="date"]').fill("2026-09-01");
    await expect(preview(page)).toContainText("September 1, 2026");
  });

  test("MNDA term years appear in preview", async ({ page }) => {
    await page.locator('input[name="mndaTermType"][value="expires"]').check();
    const yearsInput = page
      .locator("aside")
      .locator('input[name="mndaTermType"][value="expires"]')
      .locator("xpath=following::input[@type='number'][1]");
    await yearsInput.fill("3");
    await expect(preview(page)).toContainText("Expires 3 year(s) from Effective Date.");
  });

  test("MNDA term 'continues until terminated' appears bold in preview", async ({
    page,
  }) => {
    await page.locator('input[name="mndaTermType"][value="continues"]').check();
    await expect(
      preview(page).locator("strong", {
        hasText: "Continues until terminated",
      })
    ).toBeVisible();
  });

  test("confidentiality term years appear in preview", async ({ page }) => {
    await page
      .locator('input[name="confidentialityTermType"][value="years"]')
      .check();
    const yearsInput = page
      .locator("aside")
      .locator('input[name="confidentialityTermType"][value="years"]')
      .locator("xpath=following::input[@type='number'][1]");
    await yearsInput.fill("5");
    await expect(preview(page)).toContainText("5 year(s) from Effective Date");
  });

  test("confidentiality term 'in perpetuity' appears bold in preview", async ({
    page,
  }) => {
    await page
      .locator('input[name="confidentialityTermType"][value="perpetuity"]')
      .check();
    await expect(
      preview(page).locator("strong", { hasText: "In perpetuity." })
    ).toBeVisible();
  });

  test("governing law appears in preview", async ({ page }) => {
    await field(page, "Governing Law").fill("California");
    await expect(preview(page)).toContainText("Governing Law: California");
  });

  test("jurisdiction appears in preview", async ({ page }) => {
    await field(page, "Jurisdiction").fill("San Francisco, CA");
    await expect(preview(page)).toContainText("Jurisdiction: San Francisco, CA");
  });

  test("MNDA modifications appear in preview", async ({ page }) => {
    await field(page, "MNDA Modifications").fill(
      "Section 2 is amended to extend the notice period to 30 days."
    );
    await expect(preview(page)).toContainText(
      "Section 2 is amended to extend the notice period to 30 days."
    );
  });

  test("party 1 company and name appear in signature table", async ({
    page,
  }) => {
    const p1 = page.locator("fieldset").filter({ hasText: "Party 1" });
    await p1.locator('label:has-text("Company") ~ input').fill("Acme Corp");
    await p1.locator('label:has-text("Print Name") ~ input').fill("Jane Smith");
    await expect(preview(page)).toContainText("Acme Corp");
    await expect(preview(page)).toContainText("Jane Smith");
  });

  test("party 2 company and name appear in signature table", async ({
    page,
  }) => {
    const p2 = page.locator("fieldset").filter({ hasText: "Party 2" });
    await p2.locator('label:has-text("Company") ~ input').fill("Beta LLC");
    await p2.locator('label:has-text("Print Name") ~ input').fill("John Doe");
    await expect(preview(page)).toContainText("Beta LLC");
    await expect(preview(page)).toContainText("John Doe");
  });
});

import { test, expect } from "@playwright/test";

async function gotoAuthScreen(page: import("@playwright/test").Page) {
  await page.route("/api/auth/me", (route) => {
    route.fulfill({ status: 401, contentType: "application/json", body: '{"detail":"Not authenticated"}' });
  });
  await page.goto("/");
  // Wait for auth form to appear
  await expect(page.getByLabel("Email address")).toBeVisible();
}

test.describe("Authentication", () => {
  test("shows sign in screen when unauthenticated", async ({ page }) => {
    await gotoAuthScreen(page);
    await expect(page.getByRole("heading", { name: /PreLegal/i })).toBeVisible();
    await expect(page.locator("form").getByRole("button", { name: "Sign in" })).toBeVisible();
  });

  test("can switch between sign in and create account tabs", async ({ page }) => {
    await gotoAuthScreen(page);

    await page.getByRole("button", { name: "Create account" }).first().click();
    await expect(page.getByLabel("Confirm password")).toBeVisible();

    await page.getByRole("button", { name: "Sign in" }).first().click();
    await expect(page.getByLabel("Confirm password")).not.toBeVisible();
  });

  test("shows error on invalid signin", async ({ page }) => {
    await gotoAuthScreen(page);
    await page.route("/api/auth/signin", (route) => {
      route.fulfill({
        status: 401,
        contentType: "application/json",
        body: JSON.stringify({ detail: "Invalid email or password." }),
      });
    });

    await page.getByLabel("Email address").fill("bad@example.com");
    await page.getByLabel("Password").fill("wrongpass");
    await page.locator("form").getByRole("button", { name: "Sign in" }).click();

    await expect(page.getByText("Invalid email or password.")).toBeVisible();
  });

  test("shows error if passwords do not match on signup", async ({ page }) => {
    await gotoAuthScreen(page);
    await page.getByRole("button", { name: "Create account" }).first().click();
    await expect(page.getByLabel("Confirm password")).toBeVisible();

    await page.getByLabel("Email address").fill("new@example.com");
    await page.getByLabel("Password", { exact: true }).fill("password123");
    await page.getByLabel("Confirm password").fill("different");
    await page.locator("form").getByRole("button", { name: "Create account" }).click();

    await expect(page.getByText("Passwords do not match.")).toBeVisible();
  });

  test("redirects to catalog on successful signin", async ({ page }) => {
    await gotoAuthScreen(page);
    await page.route("/api/auth/signin", (route) => {
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ id: 1, email: "test@example.com" }),
      });
    });

    await page.getByLabel("Email address").fill("test@example.com");
    await page.getByLabel("Password").fill("password");
    await page.locator("form").getByRole("button", { name: "Sign in" }).click();

    await expect(page.getByText("Choose a document type")).toBeVisible();
  });
});

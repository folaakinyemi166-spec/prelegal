import { Page } from "@playwright/test";

const TEMPLATE_BODY = [
  "# Standard Agreement",
  "",
  "This agreement is entered into by and between the parties identified above.",
  "",
  ...Array(50).fill("Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris."),
].join("\n");

export async function mockAuth(page: Page) {
  await page.route("/api/auth/me", (route) => {
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ id: 1, email: "test@example.com" }),
    });
  });
  await page.route("/api/chat/config*", (route) => {
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ doc_type: "Mutual-NDA", title: "Mutual NDA", fields: [] }),
    });
  });
  await page.route("/api/chat/greeting*", (route) => {
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ message: "Hello! I am ready to help you draft this document." }),
    });
  });
  await page.route("**/api/templates/**", (route) => {
    route.fulfill({
      status: 200,
      contentType: "text/plain",
      body: TEMPLATE_BODY,
    });
  });
}

export async function selectDocument(page: Page, name: string) {
  await mockAuth(page);
  await page.goto("/");
  await page.getByRole("button", { name: new RegExp(name) }).click();
}

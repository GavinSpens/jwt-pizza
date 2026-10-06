import { test, expect } from "playwright-test-coverage";

test("diner can open their dashboard", async ({ page }) => {
  await page.goto("http://localhost:5174/");
  await page.getByRole("link", { name: "Login" }).click();
  await page.getByRole("textbox", { name: "Email address" }).fill("a@jwt.com");
  await page.getByRole("textbox", { name: "Email address" }).press("Tab");
  await page.getByRole("textbox", { name: "Password" }).fill("admin");
  await page.getByRole("textbox", { name: "Password" }).press("Enter");
  await page.getByRole("link", { name: "常" }).click();
  await expect(page.getByText("常用名字")).toBeVisible();
});

test("diner dashboard shows the signed-in email", async ({ page }) => {
  await page.goto("http://localhost:5174/");
  await page.getByRole("link", { name: "Login" }).click();
  await page.getByRole("textbox", { name: "Email address" }).fill("a@jwt.com");
  await page.getByRole("textbox", { name: "Email address" }).press("Tab");
  await page.getByRole("textbox", { name: "Password" }).fill("admin");
  await page.getByRole("textbox", { name: "Password" }).press("Enter");
  await page.getByRole("link", { name: "常" }).click();
  await expect(page.getByText("a@jwt.com")).toBeVisible();
});
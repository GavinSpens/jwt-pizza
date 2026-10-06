import { test, expect } from "playwright-test-coverage";
import { randomString } from "../helpers";

test("franchise manager can create and close a store", async ({ page }) => {
  const randomName = randomString();
  await page.goto("http://localhost:5174/");
  await page.getByRole("link", { name: "Login" }).click();
  await page.getByRole("textbox", { name: "Email address" }).fill("a@jwt.com");
  await page.getByRole("textbox", { name: "Email address" }).press("Tab");
  await page.getByRole("textbox", { name: "Password" }).fill("admin");
  await page.getByRole("textbox", { name: "Password" }).press("Enter");
  await page.getByRole("link", { name: "Admin" }).click();
  await page.getByRole("button", { name: "Add Franchise" }).click();
  await page.getByRole("textbox", { name: "franchise name" }).click();
  await page.getByRole("textbox", { name: "franchise name" }).fill(randomName);
  await page.getByRole("textbox", { name: "franchise name" }).press("Tab");
  await page
    .getByRole("textbox", { name: "franchisee admin email" })
    .fill("a@jwt.com");
  await page.getByRole("button", { name: "Create" }).click();
  await page.goto("http://localhost:5174/");
  await page.getByRole("link", { name: "Franchise" }).click();
  await page.getByRole("button", { name: "Create store" }).click();
  await page.getByRole("textbox", { name: "store name" }).click();
  await page.getByRole("textbox", { name: "store name" }).fill(randomName);
  await page.getByRole("button", { name: "Create" }).click();
  await expect(page.getByRole("cell", { name: randomName })).toBeVisible();
  await page
    .getByRole("table")
    .locator("tr")
    .filter({ hasText: randomName })
    .getByRole("button", { name: "Close" })
    .click();
  await page.getByRole("button", { name: "Close" }).click();
  await expect(
    page.getByText("Everything you need to run an"),
  ).toBeVisible();
});
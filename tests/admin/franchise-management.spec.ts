import { test, expect } from "playwright-test-coverage";
import { randomString } from "../helpers";

test("admin can create a franchise", async ({ page }) => {
  const randomName = randomString();
  await page.goto("http://localhost:5174/");
  await page.getByRole("link", { name: "Login" }).click();
  await page.getByRole("textbox", { name: "Email address" }).fill("a@jwt.com");
  await page.getByRole("textbox", { name: "Email address" }).press("Tab");
  await page.getByRole("textbox", { name: "Password" }).fill("admin");
  await page.getByRole("button", { name: "Login" }).click();
  await page.getByRole("link", { name: "Admin" }).click();
  await expect(page.getByText("Mama Ricci's kitchen")).toBeVisible();
  await page.getByRole("button", { name: "Add Franchise" }).click();
  await page.getByRole("textbox", { name: "franchise name" }).click();
  await page.getByRole("textbox", { name: "franchise name" }).fill(randomName);
  await page.getByRole("textbox", { name: "franchisee admin email" }).click();
  await page
    .getByRole("textbox", { name: "franchisee admin email" })
    .fill("a@jwt.com");
  await page.getByRole("button", { name: "Create" }).click();

  await page.getByRole("textbox", { name: "Filter franchises" }).click();
  await page.getByRole("textbox", { name: "Filter franchises" }).fill(randomName);
  await page.getByRole("button", { name: "Submit" }).click();
  await expect(
    page.getByRole("cell", { name: randomName, exact: true }),
  ).toBeVisible();
});

test("admin can close a franchise", async ({ page }) => {
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
  await page.getByRole("textbox", { name: "franchisee admin email" }).click();
  await page
    .getByRole("textbox", { name: "franchisee admin email" })
    .fill("a@jwt.com");
  await page.getByRole("button", { name: "Create" }).click();
  await page.getByRole("textbox", { name: "Filter franchises" }).click();
  await page.getByRole("textbox", { name: "Filter franchises" }).fill(randomName);
  await page.getByRole("button", { name: "Submit" }).click();
  await page
    .getByRole("row", { name: randomName + " 常用名字 Close" })
    .getByRole("button")
    .click();
  await expect(page.getByText("Sorry to see you go")).toBeVisible();
  await page.getByRole("button", { name: "Close" }).click();
  await expect(page.getByText("Mama Ricci's kitchen")).toBeVisible();
});
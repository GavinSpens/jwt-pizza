import { test, expect } from "playwright-test-coverage";

test("backend responds with its welcome message", async ({ page }) => {
  await page.goto("http://localhost:3000/");
  await expect(page.getByText('{"message":"welcome to JWT')).toBeVisible();
});

test("frontend displays the home page", async ({ page }) => {
  await page.goto("http://localhost:5174/");
  await expect(page.getByText("JWT Pizza", { exact: true })).toBeVisible();
  await expect(
    page.getByText("The web's best pizza", { exact: true }),
  ).toBeVisible();
});
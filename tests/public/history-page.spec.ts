import { test, expect } from "playwright-test-coverage";

test("visitor can read the pizza shop history", async ({ page }) => {
  await page.goto("http://localhost:5174/");
  await page.getByRole("link", { name: "History" }).click();
  await expect(page.getByText("It all started in Mama Ricci's")).toBeVisible();
});
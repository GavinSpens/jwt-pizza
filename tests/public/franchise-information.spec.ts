import { test, expect } from "playwright-test-coverage";

test("visitor can view franchise information", async ({ page }) => {
  await page.goto("http://localhost:5174/");
  await page
    .getByRole("navigation", { name: "Global" })
    .getByRole("link", { name: "Franchise" })
    .click();
  await expect(page.getByText("If you are already a")).toBeVisible();
});
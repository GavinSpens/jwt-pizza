import { test, expect } from "playwright-test-coverage";

test("API documentation page is available", async ({ page }) => {
  await page.goto("http://localhost:5174/docs");
  await expect(page.getByText("JWT Pizza API")).toBeVisible();
});
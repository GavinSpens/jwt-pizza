import { test, expect } from "playwright-test-coverage";

test("API documentation page is available", async ({ page }) => {
  await page.goto("/docs");
  await expect(page.getByText("JWT Pizza API")).toBeVisible();
});

import { test, expect } from "playwright-test-coverage";

test("visitor can read the About page", async ({ page }) => {
  await page.goto("http://localhost:5174/");
  await page.getByRole("link", { name: "About" }).click();
  await expect(page.getByText("At JWT Pizza, our employees")).toBeVisible();
});
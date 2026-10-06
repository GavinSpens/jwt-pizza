import { test, expect } from "playwright-test-coverage";

test("unknown route displays the not-found page", async ({ page }) => {
  await page.goto("/notfound");
  await expect(page.getByText("It looks like we have dropped")).toBeVisible();
});

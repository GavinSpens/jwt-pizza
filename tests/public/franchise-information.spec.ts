import { test, expect } from "../testSetup";

test("visitor can view franchise information", async ({ page }) => {
  await page.goto("/");
  await page
    .getByRole("navigation", { name: "Global" })
    .getByRole("link", { name: "Franchise" })
    .click();
  await expect(page.getByText("If you are already a")).toBeVisible();
});

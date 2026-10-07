import { test, expect } from "../testSetup";

test("visitor can read the About page", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("link", { name: "About" }).click();
  await expect(page.getByText("At JWT Pizza, our employees")).toBeVisible();
});

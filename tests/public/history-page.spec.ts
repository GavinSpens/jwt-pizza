import { test, expect } from "../testSetup";

test("visitor can read the pizza shop history", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("link", { name: "History" }).click();
  await expect(page.getByText("It all started in Mama Ricci's")).toBeVisible();
});

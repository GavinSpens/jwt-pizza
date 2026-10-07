import { test, expect } from "../testSetup";

test("frontend displays the home page", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByText("JWT Pizza", { exact: true })).toBeVisible();
  await expect(
    page.getByText("The web's best pizza", { exact: true }),
  ).toBeVisible();
});

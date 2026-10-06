import { test, expect } from "playwright-test-coverage";

test("diner can open the menu and choose a store", async ({ page }) => {
  await page.goto("http://localhost:5174/");
  await page.getByRole("link", { name: "Order" }).click();
  await expect(page.getByText("Pick your store and pizzas")).toBeVisible();
});
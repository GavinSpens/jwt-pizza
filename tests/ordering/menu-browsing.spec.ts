import { test, expect } from "../testSetup";

test("diner can open the menu and choose a store", async ({ page, api }) => {
  api.mockJson("GET", "/api/order/menu", []);
  api.mockJson("GET", "/api/franchise", { franchises: [], more: false });

  await page.goto("/");
  await page.getByRole("link", { name: "Order" }).click();
  await expect(page.getByText("Pick your store and pizzas")).toBeVisible();
});

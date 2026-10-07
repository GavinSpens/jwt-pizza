import { test, expect } from "../testSetup";
import { fillLoginForm } from "../helpers";

test("diner can pay for an order and verify its JWT", async ({ page, api }) => {
  const diner = {
    id: "1",
    name: "常用名字",
    email: "a@jwt.com",
    roles: [{ role: "diner" }],
  };

  api.mockJson("GET", "/api/order/menu", [
    {
      id: "pizza-1",
      title: "Charred",
      description: "Charred",
      image: "/pizza.png",
      price: 10,
    },
  ]);
  api.mockJson("GET", "/api/franchise", {
    franchises: [
      {
        id: "1",
        name: "Mama Ricci's kitchen",
        admins: [],
        stores: [{ id: "2", name: "Downtown" }],
      },
    ],
    more: false,
  });
  api.mock("PUT", "/api/auth", () => ({
    body: { user: diner, token: "mock-diner-token" },
  }));
  api.mockJson("GET", "/api/user/me", diner);
  api.mock("POST", "/api/order", () => ({
    body: {
      order: {
        id: "order-1",
        franchiseId: "1",
        storeId: "2",
        date: "2026-10-06T00:00:00.000Z",
        items: [{ menuId: "pizza-1", description: "Charred", price: 10 }],
      },
      jwt: "mock-pizza-jwt",
    },
  }));
  api.mockJson("POST", "/api/order/verify", {
    message: "valid",
    payload: { id: "order-1" },
  });

  await page.goto("/");
  await page.getByRole("link", { name: "Order" }).click();
  await page.getByRole("combobox").selectOption("2");
  await page.getByRole("link", { name: "Image Description Charred" }).click();
  await page.getByRole("button", { name: "Checkout" }).click();
  await fillLoginForm(page, "a@jwt.com", "admin");
  await page.getByRole("button", { name: "Login" }).click();
  await page.getByRole("button", { name: "Pay now" }).click();
  await page.getByRole("button", { name: "Verify" }).click();
  await expect(page.locator("#hs-jwt-modal")).toContainText(
    "JWT Pizza - valid",
  );
});

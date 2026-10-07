import { test, expect } from "../testSetup";
import { login } from "../helpers";

test.beforeEach(async ({ api }) => {
  api.mock("PUT", "/api/auth", ({ body }) => {
    expect(body).toEqual({
      email: "a@jwt.com",
      password: "admin",
    });

    return {
      body: {
        user: {
          id: "1",
          name: "常用名字",
          email: "a@jwt.com",
          roles: [{ role: "diner" }],
        },
        token: "mock-diner-token",
      },
    };
  });

  api.mockJson("GET", "/api/order", {
    id: "1",
    dinerId: "1",
    orders: [],
  });
});

test("diner can open their dashboard", async ({ page }) => {
  await page.goto("/");
  await login(page, "a@jwt.com", "admin");
  await page.getByRole("link", { name: "常" }).click();
  await expect(page.getByText("常用名字")).toBeVisible();
});

test("diner dashboard shows the signed-in email", async ({ page }) => {
  await page.goto("/");
  await login(page, "a@jwt.com", "admin");
  await page.getByRole("link", { name: "常" }).click();
  await expect(page.getByText("a@jwt.com")).toBeVisible();
});

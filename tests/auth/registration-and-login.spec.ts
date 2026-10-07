import { test, expect } from "../testSetup";
import { login, randomString, registerUser } from "../helpers";

test.beforeEach(async ({ api }) => {
  api.mock("POST", "/api/auth", () => ({
    body: {
      user: {
        id: "1",
        name: "常用名字",
        email: "a@jwt.com",
        roles: [{ role: "diner" }],
      },
      token: "mock-diner-token",
    },
  }));
  api.mock("PUT", "/api/auth", () => ({
    body: {
      user: {
        id: "1",
        name: "常用名字",
        email: "a@jwt.com",
        roles: [{ role: "diner" }],
      },
      token: "mock-diner-token",
    },
  }));
  api.mockJson("DELETE", "/api/auth", null);
});

test("new user can register", async ({ page }) => {
  const randomName = randomString();
  await page.goto("/");
  await registerUser(
    page,
    randomName,
    randomName + "@thingy.com",
    randomName + "rando",
  );
  await expect(page.getByRole("link", { name: "Logout" })).toBeVisible();
});

test("registered user can log out and back in", async ({ page }) => {
  const randomName = randomString();
  await page.goto("/");
  await registerUser(page, randomName, randomName + "@a.com", randomName);
  await page.getByRole("link", { name: "Logout" }).click();
  await login(page, randomName + "@a.com", randomName);
  await expect(page.getByRole("link", { name: "Logout" })).toBeVisible();
});

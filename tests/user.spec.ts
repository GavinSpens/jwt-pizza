import { test, expect } from "./testSetup";
import { login, registerUser } from "./helpers";

const userEmail = "pizza.diner@jwt.com";
const userPassword = "diner";

test.beforeEach(async ({ api }) => {
  let user = {
    id: "1",
    name: "pizza diner",
    email: userEmail,
    roles: [{ role: "diner" }],
  };

  api.mock("POST", "/api/auth", () => ({
    body: { user, token: "mock-diner-token" },
  }));
  api.mock("PUT", "/api/auth", () => ({
    body: { user, token: "mock-diner-token" },
  }));
  api.mock("PUT", "/api/user/1", ({ body }) => {
    expect(body).toEqual({
      id: "1",
      name: "pizza dinerx",
      email: userEmail,
      roles: [{ role: "diner" }],
    });
    user = { ...user, name: "pizza dinerx" };
    return { body: { user, token: "mock-diner-token" } };
  });
  api.mockJson("DELETE", "/api/auth", null);
  api.mockJson("GET", "/api/order", { id: "1", dinerId: "1", orders: [] });
});

test("updateUser", async ({ page }) => {
  await page.goto("/");
  await registerUser(page, "pizza diner", userEmail, userPassword);
  await page.getByRole("link", { name: "pd" }).click();

  await expect(page.getByRole("main")).toContainText("pizza diner");

  await page.getByRole("button", { name: "Edit" }).click();
  await expect(page.locator("h3")).toContainText("Edit user");
  await page.getByRole("textbox").first().fill("pizza dinerx");
  await page.getByRole("button", { name: "Update" }).click();

  await page.waitForSelector('[role="dialog"].hidden', { state: "attached" });

  await expect(page.getByRole("main")).toContainText("pizza dinerx");

  await page.getByRole("link", { name: "Logout" }).click();
  await login(page, userEmail, userPassword);

  await page.getByRole("link", { name: "pd" }).click();

  await expect(page.getByRole("main")).toContainText("pizza dinerx");
});

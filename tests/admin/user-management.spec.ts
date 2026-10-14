import { test, expect } from "../testSetup";
import { login, registerUser, randomString } from "../helpers";

test("Admin can filter users by name", async ({ page, api }) => {
  const randomName = randomString();
  const users: {
    id: string;
    name: string;
    email: string;
    roles: { role: string }[];
  }[] = [
    {
      id: "1",
      name: "常用名字",
      email: "a@jwt.com",
      roles: [{ role: "admin" }],
    },
  ];

  api.mock("POST", "/api/auth", ({ body }) => {
    if (typeof body !== "object" || body === null || Array.isArray(body)) {
      throw new Error("Expected registration request body to be an object");
    }

    const { name, email } = body as Record<string, unknown>;
    if (typeof name !== "string" || typeof email !== "string") {
      throw new Error("Expected registration request to include name and email");
    }

    const user = { id: "2", name, email, roles: [{ role: "diner" }] };
    users.push(user);
    return { body: { user, token: "mock-diner-token" } };
  });
  api.mock("PUT", "/api/auth", () => ({
    body: {
      user: users[0],
      token: "mock-admin-token",
    },
  }));
  api.mockJson("DELETE", "/api/auth", null);
  api.mockJson("GET", "/api/user/me", users[0]);
  api.mock("GET", "/api/user", ({ url }) => {
    const nameFilter = new URL(url).searchParams
      .get("name")
      ?.replace(/\*/g, "")
      .toLowerCase();
    const matchingUsers = nameFilter
      ? users.filter((user) => user.name.toLowerCase().includes(nameFilter))
      : users;
    return { body: { users: matchingUsers, more: false } };
  });
  api.mockJson("GET", "/api/franchise", { franchises: [], more: false });

  await page.goto("/");
  await registerUser(page, randomName, randomName + "@jwt.com", randomName);
  await page.getByRole("link", { name: "Logout" }).click();
  await page.getByRole("link", { name: "Login" }).click();
  await page.getByRole("textbox", { name: "Email address" }).fill("a@jwt.com");
  await page.getByRole("textbox", { name: "Email address" }).press("Tab");
  await page.getByRole("textbox", { name: "Password" }).fill("admin");
  await page.getByRole("button", { name: "Login" }).click();
  await page.getByRole("link", { name: "Admin" }).click();
  await page.getByRole("textbox", { name: "Filter users by name" }).click();
  await page
    .getByRole("textbox", { name: "Filter users by name" })
    .fill(randomName);
  await page.getByRole("button", { name: "Search" }).click();
  await expect(
    page.getByRole("cell", { name: randomName, exact: true }),
  ).toBeVisible();
});

test("Admin can delete a user", async ({ page, api }) => {
  const userToDelete = {
    id: "2",
    name: "Diner to delete",
    email: "diner-to-delete@jwt.com",
    roles: [{ role: "diner" }],
  };
  const users = [
    {
      id: "1",
      name: "常用名字",
      email: "a@jwt.com",
      roles: [{ role: "admin" }],
    },
    userToDelete,
  ];

  api.mock("PUT", "/api/auth", () => ({
    body: {
      user: users[0],
      token: "mock-admin-token",
    },
  }));
  api.mockJson("DELETE", "/api/auth", null);
  api.mockJson("GET", "/api/user/me", users[0]);
  api.mock("GET", "/api/user", () => ({
    body: { users, more: false },
  }));
  api.mock("DELETE", "/api/user/2", () => {
    const index = users.findIndex((user) => user.id === "2");
    if (index === -1) {
      throw new Error("Cannot delete a user that is not in the mock user list");
    }
    users.splice(index, 1);
    return { body: null };
  });
  api.mockJson("GET", "/api/franchise", { franchises: [], more: false });

  await page.goto("/");
  await login(page, "a@jwt.com", "admin");
  await page.getByRole("link", { name: "Admin" }).click();
  await expect(
    page.getByRole("cell", { name: userToDelete.name, exact: true }),
  ).toBeVisible();

  page.on("dialog", (dialog) => dialog.accept());
  await page.getByRole("button", { name: `Delete ${userToDelete.name}` }).click();

  await expect(
    page.getByRole("cell", { name: userToDelete.name, exact: true }),
  ).toHaveCount(0);
});

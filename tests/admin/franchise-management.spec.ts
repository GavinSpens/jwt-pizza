import { test, expect } from "../testSetup";
import { createFranchise, login, mockAdminApi, randomString } from "../helpers";

test.beforeEach(async ({ api }) => {
  mockAdminApi(api);
});

test("admin can create a franchise", async ({ page }) => {
  const randomName = randomString();
  await page.goto("/");
  await login(page, "a@jwt.com", "admin");
  await page.getByRole("link", { name: "Admin" }).click();
  await expect(page.getByText("Mama Ricci's kitchen")).toBeVisible();
  await createFranchise(page, randomName, "a@jwt.com");

  await page.getByRole("textbox", { name: "Filter franchises" }).click();
  await page
    .getByRole("textbox", { name: "Filter franchises" })
    .fill(randomName);
  await page.getByRole("button", { name: "Submit" }).click();
  await expect(
    page.getByRole("cell", { name: randomName, exact: true }),
  ).toBeVisible();
});

test("admin can close a franchise", async ({ page }) => {
  const randomName = randomString();
  await page.goto("/");
  await login(page, "a@jwt.com", "admin");
  await page.getByRole("link", { name: "Admin" }).click();
  await createFranchise(page, randomName, "a@jwt.com");
  await page.getByRole("textbox", { name: "Filter franchises" }).click();
  await page
    .getByRole("textbox", { name: "Filter franchises" })
    .fill(randomName);
  await page.getByRole("button", { name: "Submit" }).click();
  await page
    .getByRole("row", { name: randomName + " 常用名字 Close" })
    .getByRole("button")
    .click();
  await expect(page.getByText("Sorry to see you go")).toBeVisible();
  await page.getByRole("button", { name: "Close" }).click();
  await expect(page.getByText("Mama Ricci's kitchen")).toBeVisible();
});

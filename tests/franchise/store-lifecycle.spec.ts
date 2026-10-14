import { test, expect } from "../testSetup";
import {
  createFranchise,
  login,
  mockAdminApi,
  randomString,
} from "../helpers";

test("franchise manager can create and close a store", async ({ page, api }) => {
  const randomName = randomString();
  mockAdminApi(api);
  await page.goto("/");
  await login(page, "a@jwt.com", "admin");
  await page.getByRole("link", { name: "Admin" }).click();
  await createFranchise(page, randomName, "a@jwt.com");
  await page.goto("/franchise-dashboard");
  await page.getByRole("button", { name: "Create store" }).click();
  await page.getByRole("textbox", { name: "store name" }).click();
  await page.getByRole("textbox", { name: "store name" }).fill(randomName);
  await page.getByRole("button", { name: "Create" }).click();
  await expect(page.getByRole("cell", { name: randomName })).toBeVisible();
  await page.getByRole('link', { name: 'Admin' }).click();
  await expect(page.getByRole('cell', { name: randomName }).nth(1)).toBeVisible();
  await page.getByRole('row', { name: randomName + ' 0 ₿ Close' }).getByRole('button').click();
  await page.getByRole('button', { name: 'Close' }).click();
});

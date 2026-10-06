import { test, expect } from "playwright-test-coverage";
import { randomString } from "../helpers";

test("new user can register", async ({ page }) => {
  const randomName = randomString();
  await page.goto("http://localhost:5174/");
  await page.getByRole("link", { name: "Register" }).click();
  await page.getByRole("textbox", { name: "Full name" }).fill(randomName);
  await page
    .getByRole("textbox", { name: "Email address" })
    .fill(randomName + "@thingy.com");
  await page
    .getByRole("textbox", { name: "Password" })
    .fill(randomName + "rando");
  await page.getByRole("button", { name: "Register" }).click();
  await expect(page.getByRole("link", { name: "Logout" })).toBeVisible();
});

test("registered user can log out and back in", async ({ page }) => {
  const randomName = randomString();
  await page.goto("http://localhost:5174/");
  await page.getByRole("link", { name: "Register" }).click();
  await page.getByRole("textbox", { name: "Full name" }).fill(randomName);
  await page
    .getByRole("textbox", { name: "Email address" })
    .fill(randomName + "@a.com");
  await page.getByRole("textbox", { name: "Password" }).fill(randomName);
  await page.getByRole("button", { name: "Register" }).click();
  await page.getByRole("link", { name: "Logout" }).click();
  await page.getByRole("link", { name: "Login" }).click();
  await page
    .getByRole("textbox", { name: "Email address" })
    .fill(randomName + "@a.com");
  await page.getByRole("textbox", { name: "Password" }).fill(randomName);
  await page.getByRole("button", { name: "Login" }).click();
  await expect(page.getByRole("link", { name: "Logout" })).toBeVisible();
});
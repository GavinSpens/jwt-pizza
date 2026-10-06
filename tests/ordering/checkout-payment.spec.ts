import { test, expect } from "playwright-test-coverage";

test("diner can pay for an order and verify its JWT", async ({ page }) => {
  await page.goto("http://localhost:5174/");
  await page.getByRole("link", { name: "Order" }).click();
  await page.getByRole("combobox").selectOption("2");
  await page.getByRole("link", { name: "Image Description Charred" }).click();
  await page.getByRole("button", { name: "Checkout" }).click();
  await page.getByRole("textbox", { name: "Email address" }).fill("a@jwt.com");
  await page.getByRole("textbox", { name: "Email address" }).press("Tab");
  await page.getByRole("textbox", { name: "Password" }).fill("admin");
  await page.getByRole("button", { name: "Login" }).click();
  await page.getByRole("button", { name: "Pay now" }).click();
  await page.getByRole("button", { name: "Verify" }).click();
  await expect(page.locator("#hs-jwt-modal")).toContainText(
    "JWT Pizza - valid",
  );
});
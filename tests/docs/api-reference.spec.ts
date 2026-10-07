import { test, expect } from "../testSetup";

test("API documentation page is available", async ({ page, api }) => {
  api.mockJson("GET", "/api/docs", { endpoints: [] });

  await page.goto("/docs");
  await expect(page.getByText("JWT Pizza API")).toBeVisible();
});

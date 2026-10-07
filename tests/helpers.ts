import type { Page } from "@playwright/test";
import type { ApiMocks, ApiMockRequest } from "./testSetup";

interface MockStore {
  id: string;
  name: string;
  totalRevenue: number;
}

interface MockFranchise {
  id: string;
  name: string;
  stores: MockStore[];
  admins: { email: string; id: string; name: string }[];
}

function requestObject(body: unknown): Record<string, unknown> {
  if (typeof body !== "object" || body === null || Array.isArray(body)) {
    throw new Error("Expected API request body to be an object");
  }
  return body as Record<string, unknown>;
}

function createFranchiseRecord(request: ApiMockRequest): MockFranchise {
  const body = requestObject(request.body);
  const name = body.name;
  if (typeof name !== "string") {
    throw new Error("Expected franchise request to include a name");
  }

  const inputAdmins = Array.isArray(body.admins) ? body.admins : [];
  const admins = inputAdmins.map((admin) => {
    const value = requestObject(admin);
    if (typeof value.email !== "string") {
      throw new Error("Expected franchise admin to include an email");
    }
    return { email: value.email, id: "1", name: "常用名字" };
  });

  return { id: "1", name, stores: [], admins };
}

export function randomString(): string {
  return Math.random().toString(36).substring(2, 15);
}

export function mockAdminApi(api: ApiMocks): void {
  const franchises: MockFranchise[] = [];

  api.mock("PUT", "/api/auth", () => ({
    body: {
      user: {
        id: "1",
        name: "常用名字",
        email: "a@jwt.com",
        roles: [{ role: "admin" }],
      },
      token: "mock-admin-token",
    },
  }));
  api.mockJson("GET", "/api/user/me", {
    id: "1",
    name: "常用名字",
    email: "a@jwt.com",
    roles: [{ role: "admin" }],
  });

  api.mock("GET", "/api/franchise", ({ url }) => {
    const filter = new URL(url).searchParams
      .get("name")
      ?.replace(/\*/g, "")
      .toLowerCase();
    const matches = filter
      ? franchises.filter((franchise) =>
          franchise.name.toLowerCase().includes(filter),
        )
      : franchises;
    return { body: { franchises: matches, more: false } };
  });

  api.mock("POST", "/api/franchise", (request) => {
    const franchise = createFranchiseRecord(request);
    franchises.push(franchise);
    return { body: franchise };
  });

  api.mock("GET", "/api/franchise/1", () => ({ body: franchises }));

  api.mock("DELETE", "/api/franchise/1", () => {
    franchises.splice(0, franchises.length);
    return { body: null };
  });

  api.mock("POST", "/api/franchise/1/store", (request) => {
    const body = requestObject(request.body);
    if (typeof body.name !== "string") {
      throw new Error("Expected store request to include a name");
    }
    const store: MockStore = {
      id: "2",
      name: body.name,
      totalRevenue: 0,
    };
    const franchise = franchises.find((entry) => entry.id === "1");
    if (!franchise) {
      throw new Error("Cannot add a store before creating a franchise");
    }
    franchise.stores.push(store);
    return { body: store };
  });

  api.mock("DELETE", "/api/franchise/1/store/2", () => {
    const franchise = franchises.find((entry) => entry.id === "1");
    if (!franchise) {
      throw new Error("Cannot close a store without a franchise");
    }
    franchise.stores = franchise.stores.filter((store) => store.id !== "2");
    return { body: null };
  });
}

export async function fillLoginForm(
  page: Page,
  email: string,
  password: string,
): Promise<void> {
  await page.getByRole("textbox", { name: "Email address" }).fill(email);
  await page.getByRole("textbox", { name: "Password" }).fill(password);
}

export async function login(
  page: Page,
  email: string,
  password: string,
): Promise<void> {
  await page.getByRole("link", { name: "Login" }).click();
  await fillLoginForm(page, email, password);
  await page.getByRole("button", { name: "Login" }).click();
}

export async function registerUser(
  page: Page,
  name: string,
  email: string,
  password: string,
): Promise<void> {
  await page.getByRole("link", { name: "Register" }).click();
  await page.getByRole("textbox", { name: "Full name" }).fill(name);
  await page.getByRole("textbox", { name: "Email address" }).fill(email);
  await page.getByRole("textbox", { name: "Password" }).fill(password);
  await page.getByRole("button", { name: "Register" }).click();
}

export async function createFranchise(
  page: Page,
  name: string,
  adminEmail: string,
): Promise<void> {
  await page.getByRole("button", { name: "Add Franchise" }).click();
  await page.getByRole("textbox", { name: "franchise name" }).fill(name);
  await page
    .getByRole("textbox", { name: "franchisee admin email" })
    .fill(adminEmail);
  await page.getByRole("button", { name: "Create" }).click();
}

import { test as base, expect } from "playwright-test-coverage";

export interface ApiMockRequest {
  method: string;
  path: string;
  url: string;
  body: unknown;
}

export interface ApiMockResponse {
  status?: number;
  body: unknown;
}

export type ApiMockHandler = (
  request: ApiMockRequest,
) => ApiMockResponse | Promise<ApiMockResponse>;

export interface ApiMocks {
  mock(method: string, path: string, handler: ApiMockHandler): void;
  mockJson(method: string, path: string, body: unknown, status?: number): void;
}

interface TestFixtures {
  api: ApiMocks;
}

const apiMockHandlers = new WeakMap<ApiMocks, Map<string, ApiMockHandler>>();

const test = base.extend<TestFixtures>({
  api: async ({}, use) => {
    const handlers = new Map<string, ApiMockHandler>();
    const api: ApiMocks = {
      mock(method, path, handler) {
        const key = `${method.toUpperCase()} ${path}`;
        if (handlers.has(key)) {
          throw new Error(`An API mock is already registered for ${key}`);
        }
        handlers.set(key, handler);
      },
      mockJson(method, path, body, status = 200) {
        api.mock(method, path, () => ({ status, body }));
      },
    };

    apiMockHandlers.set(api, handlers);
    await use(api);
  },
  page: async ({ page, api }, use) => {
    const unhandledRequests: string[] = [];
    const handlers = apiMockHandlers.get(api);
    if (!handlers) {
      throw new Error("API mock registry was not initialized");
    }

    await page.route("**/*", async (route) => {
      const request = route.request();
      const url = new URL(request.url());
      if (!url.pathname.startsWith("/api/")) {
        await route.continue();
        return;
      }

      const method = request.method().toUpperCase();
      const key = `${method} ${url.pathname}`;
      const resolver = handlers.get(key);

      if (!resolver) {
        unhandledRequests.push(`${method} ${url.href}`);
        await route.abort();
        return;
      }

      const postData = request.postData();
      const response = await resolver({
        method,
        path: url.pathname,
        url: url.href,
        body: postData ? JSON.parse(postData) : undefined,
      });

      await route.fulfill({
        status: response.status ?? 200,
        contentType: "application/json",
        body: JSON.stringify(response.body),
      });
    });

    await use(page);

    expect(
      unhandledRequests,
      "Unhandled API requests; add explicit mocks for these endpoints",
    ).toEqual([]);
  },
});

export { test, expect };

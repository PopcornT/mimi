import { test, expect } from "@playwright/test";
test("search closes, focus returns, and mobile controls remain usable", async ({
  page,
}) => {
  await page.goto("http://127.0.0.1:4317/zh-TW/docs/grade-appeal/");
  const trigger = page.getByRole("button", { name: "搜尋文件", exact: true });
  await trigger.click();
  await page.getByRole("searchbox").fill("申訴");
  await expect(page.locator(".qd-searchResults")).toContainText("成績申訴");
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toBeHidden();
  await expect(trigger).toBeFocused();
  await page.setViewportSize({ width: 390, height: 844 });
  const header = page.getByRole("banner");
  expect(await header.evaluate((el) => el.scrollWidth <= el.clientWidth)).toBe(
    true,
  );
  await page.getByRole("button", { name: "文件選單", exact: true }).click();
  await expect(
    page.getByRole("navigation", { name: "文件選單" }),
  ).toBeVisible();
});
test("static article is readable without JS and unknown route is 404", async ({
  browser,
}) => {
  const c = await browser.newContext({ javaScriptEnabled: false });
  const p = await c.newPage();
  await p.goto("http://127.0.0.1:4317/zh-TW/docs/grade-appeal/");
  await expect(
    p.getByRole("heading", { name: "成績申訴", exact: true }),
  ).toBeVisible();
  expect(
    (await p.goto("http://127.0.0.1:4317/zh-TW/docs/missing/"))?.status(),
  ).toBe(404);
  await c.close();
});
test("legacy links, language fallback, dark theme and Mermaid render", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("http://127.0.0.1:4317/#/docs/grade-appeal");
  await expect(page).toHaveURL(/\/zh-TW\/docs\/grade-appeal\/$/);
  await page.locator("#docs-theme").click();
  await page.getByRole("option", { name: "深色", exact: true }).click();
  await expect
    .poll(() =>
      page
        .locator(".qd-root")
        .evaluate((el) => getComputedStyle(el).backgroundColor),
    )
    .toBe("rgb(22, 22, 22)");
  await page.screenshot({ path: "output/education-dark.png" });
  await page.goto("http://127.0.0.1:4317/zh-TW/docs/exam-precheck-anticheat/");
  await expect(
    page.locator('[data-testid="mermaid-diagram"] svg').first(),
  ).toBeVisible();
  expect(errors).toEqual([]);
});
test("fallback remains labeled and canonical references the real translation", async ({
  page,
}) => {
  await page.goto("http://127.0.0.1:4318/en/docs/nested/setup/");
  await expect(page.getByText("Translation unavailable")).toBeVisible();
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    "href",
    "https://business-docs.example.com/zh-TW/docs/nested/setup/",
  );
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  await expect(page.locator('article [lang="zh-TW"]')).toContainText(
    "固定版本",
  );
  await expect(
    page.locator('link[rel="alternate"][hreflang="en"]'),
  ).toHaveCount(0);
});
test("table-of-contents anchors remain below the fixed Carbon header", async ({
  page,
}) => {
  await page.goto("http://127.0.0.1:4317/zh-TW/docs/grade-appeal/");
  await page.locator("aside a").nth(1).click();
  const top = await page
    .locator("h2")
    .nth(1)
    .evaluate((el) => el.getBoundingClientRect().top);
  expect(top).toBeGreaterThanOrEqual(48);
});
test("search index failures are recoverable after reopening search", async ({
  page,
}) => {
  await page.route("**/search-index.zh-TW.json", (route) =>
    route.fulfill({ status: 503, body: "Unavailable" }),
  );
  await page.goto("http://127.0.0.1:4317/zh-TW/docs/grade-appeal/");
  const trigger = page.getByRole("button", { name: "搜尋文件", exact: true });
  await trigger.click();
  await expect(page.locator('.qd-searchResults [role="alert"]')).toBeVisible();
  await page.keyboard.press("Escape");
  await page.unroute("**/search-index.zh-TW.json");
  await trigger.click();
  await page.getByRole("searchbox").fill("申訴");
  const result = page
    .locator(".qd-searchResults a")
    .filter({ hasText: "成績申訴" })
    .first();
  await expect(result).toBeVisible();
  await result.click();
  await expect(page).toHaveURL(/\/zh-TW\/docs\/grade-appeal\/$/);
});

test("embedded docs preserve query-language navigation, local search and host Markdown styles", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("http://127.0.0.1:4316/");
  await expect(page.getByRole("heading", { name: "Host renderer" })).toHaveCSS(
    "font-size",
    "19px",
  );
  await page.getByRole("link", { name: "Docs", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "成績申訴", exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "搜尋文件", exact: true }).click();
  await page.getByRole("searchbox").fill("申訴");
  await page.evaluate(() => {
    (window as unknown as { mimiNavigationCheck: number }).mimiNavigationCheck =
      42;
  });
  await page.locator(".qd-searchResults a").first().click();
  expect(
    await page.evaluate(
      () =>
        (window as unknown as { mimiNavigationCheck: number })
          .mimiNavigationCheck,
    ),
  ).toBe(42);
  await expect(page).toHaveURL(/\/docs\/grade-appeal\?lang=zh-TW$/);
  await expect(page.getByRole("dialog")).toBeHidden();
  await page.locator("#docs-language").click();
  await page.getByRole("option", { name: "English", exact: true }).click();
  await expect(page).toHaveURL(/\/docs\/grade-appeal\?lang=en$/);
  await expect(page.getByText("Translation unavailable")).toBeVisible();
  await page.goto("http://127.0.0.1:4316/docs");
  await expect(page).toHaveURL(/\/docs\/overview\?lang=zh-TW$/);
  await page.goto("http://127.0.0.1:4316/docs/no-such-document");
  await expect(
    page.getByRole("heading", { name: "找不到此文件" }),
  ).toBeVisible();
  await page.goto("http://127.0.0.1:4316/");
  await expect(page.getByRole("heading", { name: "Host renderer" })).toHaveCSS(
    "font-size",
    "19px",
  );
  expect(errors).toEqual([]);
});

test("embedded theme and language selections update the host preferences", async ({
  page,
}) => {
  await page.goto("http://127.0.0.1:4316/docs/grade-appeal");
  await page.locator("#docs-theme").click();
  await page.getByRole("option", { name: "深色", exact: true }).click();
  await expect(page.locator("#host-settings")).toHaveText("dark/zh-TW");
  await expect(page.locator(".qd-root")).toHaveCSS(
    "background-color",
    "rgb(22, 22, 22)",
  );
  await page.locator("#docs-language").click();
  await page.getByRole("option", { name: "English", exact: true }).click();
  await expect(page.locator("#host-settings")).toHaveText("dark/en");
});

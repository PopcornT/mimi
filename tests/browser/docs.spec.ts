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

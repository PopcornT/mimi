import { chromium, expect } from "@playwright/test";
const b = await chromium.launch({ channel: "chrome", headless: true });
const p = await b.newPage({ viewport: { width: 1440, height: 1000 } });
const errors = [];
p.on("pageerror", (e) => errors.push(e.message));
await p.goto("http://127.0.0.1:4319/zh-TW/docs/grade-appeal/");
await expect(
  p.getByRole("heading", { name: "成績申訴", exact: true }),
).toBeVisible();
await p.screenshot({ path: "output/qjudge-final-desktop.png" });
await p.getByRole("button", { name: "搜尋文件", exact: true }).click();
await p.getByRole("searchbox").fill("申訴");
await expect(p.locator(".qd-searchResults")).toContainText("成績申訴");
await p.keyboard.press("Escape");
await expect(p.getByRole("dialog")).toBeHidden();
await p.setViewportSize({ width: 390, height: 844 });
await p.screenshot({ path: "output/qjudge-final-mobile.png" });
expect(
  await p.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
).toBe(true);
await p.getByRole("button", { name: "文件選單", exact: true }).click();
await expect(p.getByRole("navigation", { name: "文件選單" })).toBeVisible();
await p.goto("http://127.0.0.1:4319/ja/docs/overview/");
await expect(
  p.getByRole("button", { name: "ドキュメントを検索", exact: true }),
).toBeVisible();
expect(
  (await p.goto("http://127.0.0.1:4319/ja/docs/no-such-doc/")).status(),
).toBe(404);
console.log(JSON.stringify({ browserErrors: errors }));
expect(errors).toEqual([]);
await b.close();

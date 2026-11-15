import { chromium } from "@playwright/test";
const browser = await chromium.launch({ headless: true, channel: "chrome" });
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
const errors = [];
page.on("pageerror", (e) => errors.push(e.message));
await page.goto("http://127.0.0.1:4317/zh-TW/docs/grade-appeal/");
await page.waitForTimeout(1000);
await page.screenshot({ path: "output/education-desktop.png", fullPage: true });
console.log(
  "heading",
  await page.locator("h1").textContent(),
  "overflow",
  await page.evaluate(() => document.documentElement.scrollWidth > innerWidth),
  "errors",
  errors,
);
await page.getByRole("button", { name: "搜尋文件", exact: true }).click();
await page.getByRole("searchbox").fill("申訴");
await page.waitForTimeout(1000);
console.log("search", await page.locator(".qd-searchResults").innerText());
await page.keyboard.press("Escape");
await page.getByRole("dialog").waitFor({ state: "hidden" });
await page.waitForTimeout(300);
await page.setViewportSize({ width: 390, height: 844 });
await page.screenshot({ path: "output/education-mobile.png", fullPage: true });
console.log(
  "mobile overflow",
  await page.evaluate(() => document.documentElement.scrollWidth > innerWidth),
);
await page.goto("http://127.0.0.1:4318/zh-TW/docs/overview/");
console.log(
  "business",
  await page.locator("h1").textContent(),
  "errors",
  errors,
);
await browser.close();

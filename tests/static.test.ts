import { it, expect } from "vitest";
import { existsSync, readFileSync } from "node:fs";
it("ships a readable education article before JavaScript runs", () => {
  const p =
    "examples/education/build/client/zh-TW/docs/grade-appeal/index.html";
  expect(existsSync(p), "prerendered article exists").toBe(true);
  const html = readFileSync(p, "utf8");
  expect(html).toContain("提出申訴");
  expect(html).toContain('rel="canonical"');
  expect(html).toContain("/docs/images/grade-appeal/01-results.png");
});
it("isolates business content and emits a real not-found document", () => {
  const p = "examples/business/build/client/zh-TW/docs/overview/index.html";
  expect(existsSync(p)).toBe(true);
  const html = readFileSync(p, "utf8");
  expect(html).toContain("Business");
  expect(html).not.toContain("grade-appeal");
  expect(existsSync("examples/business/build/client/404.html")).toBe(true);
});
it("ships a static 404 without hydration for an unknown route", () => {
  const html = readFileSync("examples/business/build/client/404.html", "utf8");
  expect(html).not.toMatch(/<script\b/i);
  expect(html).toContain("Document not found");
});

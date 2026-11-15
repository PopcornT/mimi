import http from "node:http";
import fs from "node:fs";
import path from "node:path";
const root = path.resolve(process.argv[2]);
const port = Number(process.argv[3]);
const types = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript",
  ".css": "text/css",
  ".json": "application/json",
  ".data": "text/x-script",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".woff2": "font/woff2",
  ".md": "text/markdown; charset=utf-8",
};
http
  .createServer((req, res) => {
    let pathname;
    try {
      pathname = decodeURIComponent(new URL(req.url, "http://local").pathname);
    } catch {
      res.writeHead(400).end();
      return;
    }
    let file = path.resolve(root, "." + pathname);
    if (file !== root && !file.startsWith(root + path.sep)) {
      res.writeHead(403).end();
      return;
    }
    if (fs.existsSync(file) && fs.statSync(file).isDirectory())
      file = path.join(file, "index.html");
    const found = fs.existsSync(file) && fs.statSync(file).isFile();
    if (!found) file = path.join(root, "404.html");
    res.writeHead(found ? 200 : 404, {
      "Content-Type": types[path.extname(file)] || "application/octet-stream",
    });
    if (fs.existsSync(file)) fs.createReadStream(file).pipe(res);
    else res.end("Not found");
  })
  .listen(port, "127.0.0.1", () =>
    console.log(`Static preview http://127.0.0.1:${port}`),
  );

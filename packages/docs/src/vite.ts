import type { Plugin } from "vite";
import path from "node:path";
import { readDocsSource } from "./content/files.js";
/** Compile Markdown into a lazy client-only data module; no parser or fs in the browser. */
export function mimiDocs(options: {
  contentDir: string;
  configPath?: string;
}): Plugin {
  const contentDir = path.resolve(options.contentDir);
  const configPath = options.configPath
    ? path.resolve(options.configPath)
    : undefined;
  return {
    name: "mimi-docs",
    resolveId(id) {
      if (id === "virtual:mimi/docs") return "\0virtual:mimi/docs";
    },
    load(id) {
      if (id !== "\0virtual:mimi/docs") return;
      return `export default ${JSON.stringify(readDocsSource({ contentDir, configPath }).snapshot())}`;
    },
    configureServer(server) {
      server.watcher.add(contentDir);
      const reload = (file: string) => {
        if (file.startsWith(contentDir + path.sep) || file === configPath) {
          const mod = server.moduleGraph.getModuleById("\0virtual:mimi/docs");
          if (mod) server.moduleGraph.invalidateModule(mod);
          server.ws.send({ type: "full-reload" });
        }
      };
      server.watcher
        .on("add", reload)
        .on("change", reload)
        .on("unlink", reload);
      server.httpServer?.once("close", () => {
        server.watcher
          .off("add", reload)
          .off("change", reload)
          .off("unlink", reload);
      });
    },
  };
}

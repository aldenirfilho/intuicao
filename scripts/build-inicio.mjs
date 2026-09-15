import { copyFile, lstat, mkdir, readdir, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

// Explicit allowlist: archived modules and downloads must not enter the site.
const files = ["index.html", "styles.css", "app.js"];
const source = new URL("../inicio/", import.meta.url);
const output = new URL("../_site/", import.meta.url);

// Refuse to erase or reuse existing content. This also prevents stale artifacts.
await mkdir(output, { recursive: true });
if ((await lstat(output)).isSymbolicLink() || (await readdir(output)).length > 0) {
  throw new Error("_site must be an empty, real directory. Use a clean checkout; no files were removed.");
}
for (const name of files) {
  const input = new URL(name, source);
  const info = await lstat(input);
  if (!info.isFile() || info.isSymbolicLink()) throw new Error(`Expected regular file: ${name}`);
  await copyFile(input, new URL(name, output));
}
await writeFile(new URL(".nojekyll", output), "");
await writeFile(new URL("404.html", output), `<!doctype html>
<html lang="pt-BR"><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>Intuição — página indisponível</title>
<body><main><h1>Esta página não faz parte do início atual.</h1>
<p>Volte à ficha para organizar uma dúvida e escolher um pequeno passo.</p>
<a href="/intuicao/">Abrir o Intuição</a></main></body></html>\n`);
console.log(`Início preparado em ${fileURLToPath(output)}. Apenas ${files.join(", ")}, 404.html e .nojekyll.`);

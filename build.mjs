import fs from "node:fs/promises";
import path from "node:path";
import { optimize } from "npm:svgo";
import pMap from "npm:p-map-series";

async function sha256(msg, algo) {
  const hashBuffer = await crypto.subtle.digest(
    algo || "SHA-256",
    typeof msg === "string" ? new TextEncoder().encode(msg) : msg
  );

  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  return hashHex;
}

const OUTS = path.join(Deno.cwd(), "./files");
try {
  await fs.rm(OUTS, { recursive: true });
} catch (e) {}
await fs.mkdir(OUTS);

const collections = [];
let items = await Promise.all(
  (
    await fs.readdir("./sources")
  )
    .reduce((acc, name) => {
      const [_, ...rest] = name.split("-");
      const key = rest.join("-");

      return acc.concat({ name, key });
    }, [])
    .map(async ({ name, key }) => {
      const svgDir = path.join("./sources", name, "svg");
      const svgFiles = (
        await fs.readdir(path.join("./sources", name, "svg"))
      ).map((x) => path.join(Deno.cwd(), svgDir, x));

      collections.push([key, ...svgFiles]);
    })
);

const all = collections.reduce((acc, item) => {
  const [key, ...filenames] = item;

  return acc.concat(filenames.map((filename) => ({ key, filename })));
}, []);

const foo = await pMap(all, async ({ key, filename }, idx) => {
  const [_, name] = path.basename(filename, path.extname(filename)).split("-");

  const hsh = await sha256(
    String(Date.now() * Math.floor(Date.now() / 1_550_000)),
    "SHA-1"
  );
  const id = `${idx + 1}-${hsh.slice(5, 20)}-${name}`;
  const index = idx + 1;

  let svg = await fs.readFile(filename, "utf-8");
  svg = svg.replace('height="100"', "").replace('width="100"', "");
  svg = optimize(svg).data;
  svg = svg.replace("<svg", `<svg data-id="${id}"`);

  const sha = await sha256(svg);
  const meta = {
    category: key,
    index,
    id,
    svg: svg,
    sha,
  };

  await fs.writeFile(path.join(OUTS, `${idx + 1}.svg`), svg);
  await fs.writeFile(path.join(OUTS, `${idx + 1}.json`), JSON.stringify(meta));

  console.log(id, "->", path.join(OUTS, `${idx + 1}`));
  return meta;
});

// console.log(items);

// const res = optimize(temp);

// console.log(res.data);
// console.log(res.data.length, temp.length);

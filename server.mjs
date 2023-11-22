import * as path from "https://deno.land/std@0.194.0/path/mod.ts";
import * as base64 from "https://deno.land/std@0.207.0/encoding/base64.ts";
import { Hono } from "https://deno.land/x/hono/mod.ts";
import { compress, serveStatic } from "https://deno.land/x/hono/middleware.ts";
import pMap from "https://esm.sh/p-map";
import { fromBytes } from "viem";

const app = new Hono();
const db = await Deno.openKv();

// // const items = [];
// // for await (const item of Deno.readDir("./files")) {
// //   items.push(path.join(Deno.cwd(), "./files", item.name));
// // }

app.use("*", compress());
app.get("/", async (c) => {
  return c.html(await Deno.readTextFile("./index.html"), {
    status: 200,
    headers: { "content-type": "text/html" },
  });
});

// // app.use("/files/*", serveStatic({ root: "./" }));
app.get("/assets/:fp", async (c) => {
  // serveStatic({ root: "./assets" })
  const filename = c.req.param("fp");
  const ext = path.extname(filename).slice(1);
  const extmap = {
    svg: "image/svg+xml",
    json: "application/json",
    js: "text/javascript",
    html: "text/html",
  };

  const content = await Deno.readTextFile(
    path.join(Deno.cwd(), "./assets", filename)
  );

  return new Response(content, {
    headers: { "content-type": extmap[ext] },
    status: 200,
  });
});

async function getAllEntries(prefix = ["minted"]) {
  const all = [];
  for await (const entry of db.list({ prefix })) {
    all.push(entry.value);
  }

  return all;
}

function random(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

async function randomHash() {
  return (
    await sha256(
      String(Date.now() * Math.floor(Date.now() / 1_550_000)),
      "SHA-1"
    )
  ).slice(15, 25);
}

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

async function getAllFiles() {
  console.log("call");
  const files = [];
  const extmap = {
    svg: "image/svg+xml",
    json: "application/json",
    js: "text/javascript",
    html: "text/html",
    png: "image/png",
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
  };

  let index = 0;

  for await (const entry of Deno.readDir("./files")) {
    if (entry.isFile) {
      const filepath = path.join(Deno.cwd(), "./files", entry.name);
      const bytes = await Deno.readFile(filepath);

      const b64data = base64.encode(bytes);
      const ext = path.extname(filepath).slice(1).toLowerCase();
      const type = extmap[ext];
      const content_uri = `data:${type};base64,${b64data}`;
      const sha = await sha256(content_uri);

      files.push({
        // index: Number(path.basename(filepath, path.extname(filepath))),
        index,
        name: entry.name,
        path: filepath,
        content_uri,
        bytes,
        sha,
        ext,
        type,
      });

      index += 1;
    }
  }

  return files;
}

let FILES = await getAllFiles();
// let ITEM = null;

app.get("/random", async (c) => {
  const format = c.req.query("format") || "svg";
  const noMint = Boolean(c.req.query("nomint"));
  let num = Number(c.req.query("num") || 0);

  const files = FILES || (await getAllFiles());
  FILES = files;

  const idx = num || random(0, files.length - 1);
  const item = files[idx];
  // ITEM = item;

  console.log(item);

  const resp = await fetch(
    "https://api.ethscriptions.com/api/ethscriptions/exists/" + item.sha
  ).then((x) => x.json());

  if (resp.result) {
    return format === item.ext
      ? new Response("Already minted", { status: 200 })
      : c.json({ error: "Already minted" }, { status: 200 });
  }

  if (noMint === false) {
    // await db.set(["minted", minted.length], item);
  }

  return format === item.ext
    ? new Response(
        // todo: better handling
        item.ext === "svg" ? fromBytes(item.bytes, "string") : item.bytes,
        {
          headers: { "content-type": item.type },
          status: 200,
        }
      )
    : c.json({ data: item }, { status: 200 });

  // return c.json({ data: item }, { status: 200 });
});

// app.get("/state", async (c) => {
//   const duplicatesOnly = c.req.query("duplicatesOnly");
//   const allMinted = await getAll();
//   const filtered = Boolean(duplicatesOnly)
//     ? allMinted.filter((x) => x.oldSha)
//     : allMinted;

//   return c.json({ mintedCount: filtered.length, minted: filtered });
// });

// // Specific to EthCreatures
// // app.get(
// //   "/random",

// //   // cors({
// //   //   origin: "https://quick-whale-85.deno.dev",
// //   //   allowMethods: ["GET", "OPTIONS"],
// //   // }),

// //   async (c) => {
// //     const format = c.req.query("format") || "svg";
// //     const noMint = Boolean(c.req.query("nomint"));
// //     let num = Number(c.req.query("num") || 0);

// //     let minted = await getAll();

// //     if (minted.length > 5000) {
// //       return format === "svg"
// //         ? new Response("No More Available", { status: 405 })
// //         : c.json({ error: "No More Available" }, { status: 405 });
// //     }

// //     const rnd = (x) =>
// //       x === 222 ||
// //       x === 204 || // black succubus
// //       x == 182 || // red succubus
// //       x == 156 ||
// //       x == 130 ||
// //       x == 88 || // cat 1 of 1
// //       x == 53
// //         ? random(1, 255)
// //         : x;

// //     let idx = num || random(1, 255);
// //     idx = rnd(idx);
// //     idx = rnd(idx);
// //     idx = rnd(idx);
// //     idx = rnd(idx);
// //     idx = rnd(idx);
// //     idx = rnd(idx);

// //     const item = JSON.parse(
// //       await Deno.readTextFile(path.join(Deno.cwd(), "./files", `${idx}.json`))
// //     );

// //     for (const token of minted) {
// //       if (token.id === item.id) {
// //         console.log("already minted, changing the id to make the svg unique");

// //         const hash = await randomHash();
// //         const name = token.id.split("-")[2];
// //         const newId = `${item.index}-${hash}-${name}-${minted.length}`;

// //         item.oldSha = item.sha;
// //         item.svg = item.svg.replace(item.id, newId);
// //         item.sha = await sha256(item.svg);
// //       }
// //     }

// //     // item.mintedLen = minted.length;

// //     if (noMint === false) {
// //       await db.set(["minted", minted.length], item);
// //     }

// //     return format === "svg"
// //       ? new Response(item.svg, {
// //           headers: { "content-type": "image/svg+xml" },
// //           status: 200,
// //         })
// //       : c.json({ data: item }, { status: 200 });
// //   }
// // );

// app.get("/genesis", async (c) => {
//   const url = `https://api.ethscriptions.com/api/ethscriptions/filtered?creator=0x963469bffce4534f1e7ed7217f7fb3740acb21d9`;
//   let result = null;

//   try {
//     result = await fetch(url)
//       .then((x) => {
//         if (!x.ok) {
//           throw new Error(
//             `Failing to fetch from the upstream official API. Status: ${x.status} - ${x.statusText}`
//           );
//         }

//         return x;
//       })
//       .then((x) => x.json());
//   } catch (error) {
//     console.log("err fetching", error);

//     return c.html(error.message, { status: 500 });
//   }

//   const truncate = (x) => x.slice(0, 8) + "…" + x.slice(x.length - 8);
//   const mapper = (x) => {
//     if (x.mimetype !== "image/svg+xml" || x.ethscription_number === 1202089) {
//       return false;
//     }

//     let [date, time] = x.creation_timestamp.split("T");
//     const [year, _, day] = date.split("-");
//     date = `Sept ${day} ${year}, ${time.split(".")[0]}`;

//     return {
//       id: x.transaction_hash,
//       number: x.ethscription_number,
//       minter: x.initial_owner.toLowerCase(),
//       owner: x.current_owner.toLowerCase(),
//       createdAt: date,
//     };
//   };

//   const pages = Math.ceil(result.total_count / 25) - 2;
//   const items = result.ethscriptions.map(mapper).filter(Boolean);

//   await pMap(
//     Array(pages)
//       .fill(0)
//       .map((_, i) => i + 3),
//     async (pageNum) => {
//       const resp = await fetch(url + `&page=${pageNum}`).then((x) => x.json());
//       const eths = resp.ethscriptions.map(mapper).filter(Boolean);

//       items.push(...eths);
//       // await delay(300);
//       // console.log(`Fetched page %s for %s`, pageNum, collectionName);
//       // console.log("first item of page %s:", pageNum, items[0]);
//     },
//     { concurrency: 15 }
//   );

//   // 204, 182
//   const cardHtml = (
//     x
//   ) => `<div class="border rounded-md shadow bg-white/50 flex flex-col w-screen justify-between sm:w-80 md:w-64 h-96">
//     <a href="https://ethscriptions.com/ethscriptions/${
//       x.number
//     }" target="_blank">
//       <img src="https://api.ethscriptions.com/api/ethscriptions/${
//         x.number
//       }/data" class="w-full h-64" />
//     </a>
//     <div class="w-full flex flex-col p-4 gap-2">
//       <h2 class="text-lg font-bold">Ethscription #${x.number}</h2>
//       <ul class="text-xs text-gray-600 flex flex-col gap-2">
//       <li><strong>Minter:</strong> <a href="https://ethscriptions.com/${
//         x.minter
//       }" class="text-blue-500">${truncate(x.minter)}</a></li>
//         ${
//           x.minter === x.owner
//             ? ""
//             : `<li class="text-ellipsis overflow-hidden"><strong>Owner:</strong> <a href="https://ethscriptions.com/${
//                 x.owner
//               }" class="text-blue-500">${truncate(x.owner)}</a></li>`
//         }
//         <li><strong>Created At:</strong> <a href="https://etherscan.io/tx/${
//           x.id
//         }" class="text-blue-500">${x.createdAt}</a></li>
//       </ul>
//     </div>
//   </div>`;

//   const imagesGridHtml = `
//     <div class="w-full flex flex-wrap items-center justify-center mx-auto mt-3 p-2 gap-x-4 gap-y-4">
//       ${items.map(cardHtml).join("")}
//     </div>
//   `;

//   return c.html(
//     `<!DOCTYPE html>
//   <html lang="en">
//     <head>
//       <meta charset="UTF-8" />
//       <meta name="viewport" content="width=device-width, initial-scale=1.0" />
//       <script src="https://cdn.tailwindcss.com"></script>
//       <title>${TITLE} collection</title>
//     </head>
//     <body>
//       <div class="flex flex-col items-center justify-center bg-gray-100">

//         <h1 class="text-5xl font-extrabold text-center mt-10 mb-5">${TITLE}</h1>
//         ${imagesGridHtml}
//       </div>
//     </body>
//   </html>
//   `,
//     { status: 200 }
//   );
// });

// app.get("/auction", async (c) => {
//   return c.html("<h1>Auction House</h1><p>Coming soon</p>", { status: 200 });
// });

// // app.use("/delete-all", async (c) => {
// //   for await (const entry of db.list({ prefix: [] })) {
// //     await db.delete(entry.key);
// //   }
// //   return c.json({ deleted: true });
// // });

Deno.serve(app.fetch);

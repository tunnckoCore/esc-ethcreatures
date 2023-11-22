import { Hono } from "https://deno.land/x/hono/mod.ts";
import {
  compress,
  // cors,
  // serveStatic,
} from "https://deno.land/x/hono/middleware.ts";

const app = new Hono();

app.use("*", compress());
app.get("/", (c) => c.text("You can access: /:id.{json,svg}"));
app.use("/files/:fp", async (c) => {
  // return fetch(`https://funny-rook-46.deno.dev/files/${c.req.param("fp")}`);
  const resp = await fetch(
    `https://funny-rook-46.deno.dev/files/${c.req.param("fp")}`
  );

  const svg = await resp.text();
  const type = resp.headers.get("content-type");

  console.log({
    svg,
    type,
    url: `https://funny-rook-46.deno.dev/files/${c.req.param("fp")}`,
  });

  return new Response(svg, { headers: { "content-type": type }, status: 200 });
});

Deno.serve(app.fetch);

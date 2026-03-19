const express = require("express");
const http = require("http");
const path = require("path");
const { createBareServer } = require("@tomphttp/bare-server-node");

const app = express();
const bare = createBareServer("/bare/");
const PORT = process.env.PORT || 8080;

app.use("/uv/", express.static(path.join(__dirname, "node_modules/uv/dist")));

app.get("/uv/uv.config.js", (req, res) => {
  res.setHeader("Content-Type", "application/javascript");
  res.send(`
self.__uv$config = {
  prefix: "/service/",
  bare: "/bare/",
  encodeUrl: Ultraviolet.codec.xor.encode,
  decodeUrl: Ultraviolet.codec.xor.decode,
  handler: "/uv/uv.handler.js",
  bundle: "/uv/uv.bundle.js",
  config: "/uv/uv.config.js",
  sw: "/uv/uv.sw.js",
};
  `);
});

app.use(express.static(path.join(__dirname, "public")));

const server = http.createServer((req, res) => {
  if (bare.shouldRoute(req)) {
    bare.routeRequest(req, res);
  } else {
    app(req, res);
  }
});

server.on("upgrade", (req, socket, head) => {
  if (bare.shouldRoute(req)) {
    bare.routeUpgrade(req, socket, head);
  } else {
    socket.destroy();
  }
});

server.listen(PORT, () => {
  console.log(`✅ Running on port ${PORT}`);
});

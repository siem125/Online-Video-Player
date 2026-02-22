// server.js
import { createServer } from "https";
import { parse } from "url";
import next from "next";
import fs from "fs";

const port = process.env.NEXTJS_PORT || 3000;
const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();

const httpsOptions = {
  key: fs.readFileSync("./videoplayer.local-key.pem"),
  cert: fs.readFileSync("./videoplayer.local.pem"),
};

app.prepare().then(() => {
  createServer(httpsOptions, (req, res) => {
    const parsedUrl = parse(req.url, true);
    handle(req, res, parsedUrl);
  }).listen(port, "0.0.0.0", (err) => {
    if (err) throw err;
    console.log("> Server running at https://videoplayer.local:" + port);
  });
});

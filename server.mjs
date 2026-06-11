// Production server with optional HTTPS.
//
// Plain HTTP (same as `npm start`):
//   node server.mjs
//
// HTTPS (for PWA install / remote access, e.g. certs from `tailscale cert`
// or mkcert):
//   HTTPS_KEY_PATH=./certs/key.pem HTTPS_CERT_PATH=./certs/cert.pem node server.mjs
//
// Binds to 0.0.0.0 so phones on the same LAN / VPN can connect.

import { createServer as createHttpsServer } from "node:https";
import { createServer as createHttpServer } from "node:http";
import { readFileSync } from "node:fs";
import next from "next";

const port = parseInt(process.env.PORT ?? "3000", 10);
const hostname = process.env.HOSTNAME ?? "0.0.0.0";
const keyPath = process.env.HTTPS_KEY_PATH;
const certPath = process.env.HTTPS_CERT_PATH;
const useHttps = Boolean(keyPath && certPath);

const app = next({ dev: false });
const handle = app.getRequestHandler();

await app.prepare();

const server = useHttps
  ? createHttpsServer(
      {
        key: readFileSync(keyPath),
        cert: readFileSync(certPath),
      },
      (req, res) => handle(req, res)
    )
  : createHttpServer((req, res) => handle(req, res));

server.listen(port, hostname, () => {
  const scheme = useHttps ? "https" : "http";
  console.log(`> FitCoach AI ready on ${scheme}://${hostname}:${port}`);
  if (!useHttps) {
    console.log(
      "> Hint: set HTTPS_KEY_PATH and HTTPS_CERT_PATH to serve over HTTPS (required for PWA install on remote devices)"
    );
  }
});

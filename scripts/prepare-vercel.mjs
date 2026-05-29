/**
 * Reorganiza o output do Nitro (dist/) para o formato que a Vercel espera (.vercel/output/).
 *
 * Nitro preset "vercel" gera:
 *   dist/config.json          → .vercel/output/config.json
 *   dist/client/              → .vercel/output/static/
 *   dist/server/              → .vercel/output/functions/__server.func/
 */

import { cpSync, mkdirSync, copyFileSync, existsSync, rmSync } from "fs";

const dist = "./dist";
const output = "./.vercel/output";

// Limpa e recria .vercel/output
if (existsSync(output)) rmSync(output, { recursive: true });
mkdirSync(`${output}/static`, { recursive: true });
mkdirSync(`${output}/functions/__server.func`, { recursive: true });

// config.json da raiz do dist
copyFileSync(`${dist}/config.json`, `${output}/config.json`);

// Assets estáticos: dist/client/ → .vercel/output/static/
cpSync(`${dist}/client`, `${output}/static`, { recursive: true });

// Servidor: dist/server/ → .vercel/output/functions/__server.func/
cpSync(`${dist}/server`, `${output}/functions/__server.func`, { recursive: true });

console.log("✅ .vercel/output/ pronto para deploy na Vercel");

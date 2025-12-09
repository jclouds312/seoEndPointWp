import { build as esbuild } from "esbuild";
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function buildServer() {
  console.log('building server...');

  await esbuild({
    entryPoints: [resolve(__dirname, '../server/index.ts')],
    bundle: true,
    platform: 'node',
    target: 'node20',
    format: 'cjs',
    outfile: resolve(__dirname, '../dist/index.cjs'),
    external: ['./node_modules/*'],
    logLevel: 'info',
  });
}

buildServer().catch((e) => {
    console.error(e);
    process.exit(1);
});

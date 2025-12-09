import { build as esbuild } from "esbuild";
import { build as viteBuild } from "vite";
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import { rm, readFile } from "fs/promises";
import { existsSync } from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function getProjectDependencies() {
  const packageJsonPath = resolve(__dirname, '../package.json');
  if (!existsSync(packageJsonPath)) {
    throw new Error('package.json not found');
  }
  const packageJsonContent = await readFile(packageJsonPath, 'utf-8');
  const packageJson = JSON.parse(packageJsonContent);

  return [
    ...Object.keys(packageJson.dependencies || {}),
    ...Object.keys(packageJson.devDependencies || {}),
    ...Object.keys(packageJson.optionalDependencies || {}),
  ];
}


async function buildServer() {
  console.log('building server...');
  const externals = await getProjectDependencies();

  await esbuild({
    entryPoints: [resolve(__dirname, '../server/index.ts')],
    bundle: true,
    platform: 'node',
    target: 'node20',
    format: 'cjs',
    outfile: resolve(__dirname, '../dist/index.cjs'),
    external: externals,
    logLevel: 'info',
  });
}

async function buildClient() {
  console.log("building client...");
  await viteBuild({
    root: resolve(__dirname, '../client'),
    build: {
      outDir: resolve(__dirname, '../dist/public'),
      emptyOutDir: true,
    },
    logLevel: "info",
  });
}

async function build() {
  await rm(resolve(__dirname, "../dist"), { recursive: true, force: true });

  try {
    await Promise.all([
      buildServer(),
      buildClient()
    ]);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

build();

const esbuild = require('esbuild')
const { nodeExternalsPlugin } = require('esbuild-node-externals')

const esmConfig = {
  entryPoints: ['./src/main/ts/index.ts'],
  outdir: './target/esm',
  bundle: true,
  minify: true,
  sourcemap: true,
  sourcesContent: false,
  platform: 'node',
  target: 'ES2020',
  format: 'esm',
  outExtension: {
    '.js': '.mjs'
  },
  plugins: [nodeExternalsPlugin()],
  tsconfig: './tsconfig.json'
}

const cjsConfig = {
  ...esmConfig,
  outdir: './target/cjs',
  platform: 'node',
  target: 'es6',
  format: 'cjs',
  outExtension: {
    '.js': '.cjs'
  }
}

const config = process.argv.includes('--cjs')
  ? cjsConfig
  : esmConfig

esbuild
  .build(config)
  .catch(() => process.exit(1))

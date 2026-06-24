import { defineConfig } from 'tsup'

export default defineConfig([
  {
    entry: { index: 'src/index.ts' },
    format: ['esm'],
    outDir: 'dist/esm',
    outExtension: () => ({ js: '.js' }),
    dts: true,
    clean: true,
    noExternal: ['string-length'],
  },
  {
    entry: { index: 'src/index.ts', cli: 'src/cli.ts' },
    format: ['cjs'],
    outDir: 'dist/cjs',
    clean: true,
    noExternal: ['string-length'],
  },
])

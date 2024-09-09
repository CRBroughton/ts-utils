import { dirname, join } from 'node:path'
import { existsSync, mkdirSync } from 'node:fs'
import dts from 'bun-plugin-dts'

const entrypoints = [
  './src/await/index.ts',
  './src/enum/index.ts',
  './src/utils/index.ts',
]

function ensureDirectoryExists(path: string) {
  const dir = dirname(path)
  if (!existsSync(dir))
    mkdirSync(dir, { recursive: true })
}

await Promise.all(
  entrypoints.map((entry) => {
    const outputDir = join('dist', entry.replace('./src/', '').replace('/index.ts', ''))
    ensureDirectoryExists(outputDir)

    return Bun.build({
      entrypoints: [entry],
      outdir: outputDir,
      plugins: [dts()],
    })
  }),
)

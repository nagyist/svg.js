const fs = require('node:fs')
const os = require('node:os')
const path = require('node:path')
const { execFileSync } = require('node:child_process')

const repo = path.resolve(__dirname, '../..')
const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'svgjs-package-'))
const consumer = path.join(temp, 'consumer')
fs.mkdirSync(consumer)

try {
  execFileSync(
    process.platform === 'win32' ? 'pnpm.cmd' : 'pnpm',
    ['run', 'rollup'],
    { cwd: repo, stdio: 'inherit' }
  )

  const packed = JSON.parse(
    execFileSync(
      process.platform === 'win32' ? 'npm.cmd' : 'npm',
      ['pack', '--json', '--pack-destination', temp],
      { cwd: repo, encoding: 'utf8' }
    )
  )[0].filename

  const tarball = path.join(temp, packed)
  execFileSync(
    process.platform === 'win32' ? 'npm.cmd' : 'npm',
    ['install', '--ignore-scripts', '--no-audit', '--no-fund', tarball],
    { cwd: consumer, stdio: 'inherit' }
  )

  execFileSync(
    process.execPath,
    [
      '-e',
      "const api = require('@svgdotjs/svg.js'); if (!api || typeof api !== 'object') throw new Error('Expected a CommonJS export object'); if (typeof api.SVG !== 'function') throw new Error('Expected SVG export'); if (typeof api.registerWindow !== 'function') throw new Error('Expected registerWindow export')"
    ],
    { cwd: consumer, stdio: 'inherit' }
  )

  execFileSync(
    process.execPath,
    [
      '--input-type=module',
      '-e',
      "import * as api from '@svgdotjs/svg.js'; if (typeof api.SVG !== 'function') throw new Error('Expected ESM SVG export'); if (typeof api.registerWindow !== 'function') throw new Error('Expected ESM registerWindow export')"
    ],
    { cwd: consumer, stdio: 'inherit' }
  )
} finally {
  fs.rmSync(temp, { recursive: true, force: true })
}

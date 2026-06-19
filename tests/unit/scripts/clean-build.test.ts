import { mkdtempSync, mkdirSync, writeFileSync, existsSync, rmSync } from 'fs'
import { tmpdir } from 'os'
import { join } from 'path'

const { cleanDirectories } = require('../../../scripts/clean-build.cjs')

describe('cleanDirectories', () => {
  it('removes stale build directories and their contents', () => {
    const root = mkdtempSync(join(tmpdir(), 'taskflow-clean-'))
    const output = join(root, 'dist-server')
    mkdirSync(output)
    writeFileSync(join(output, 'stale-module.js'), 'stale')

    cleanDirectories([output])

    expect(existsSync(output)).toBe(false)
    rmSync(root, { recursive: true, force: true })
  })
})

import { gzipSync } from 'zlib'
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'fs'
import { tmpdir } from 'os'
import { join } from 'path'

const {
  assertWithinBudget,
  measureJavaScriptGzip,
} = require('../../../scripts/check-bundle-size.cjs')

describe('bundle size budget', () => {
  it('sums gzip bytes for JavaScript assets only', () => {
    const root = mkdtempSync(join(tmpdir(), 'taskflow-bundle-'))
    const nested = join(root, 'assets')
    mkdirSync(nested)
    writeFileSync(join(root, 'entry.js'), 'console.log("entry")')
    writeFileSync(join(nested, 'chunk.js'), 'console.log("chunk")')
    writeFileSync(join(nested, 'styles.css'), '.unused {}')

    expect(measureJavaScriptGzip(root)).toBe(
      gzipSync('console.log("entry")').length + gzipSync('console.log("chunk")').length
    )
    rmSync(root, { recursive: true, force: true })
  })

  it('rejects bundles that exceed the configured limit', () => {
    expect(() => assertWithinBudget(101, 100)).toThrow('exceeds budget by 1 byte')
  })
})

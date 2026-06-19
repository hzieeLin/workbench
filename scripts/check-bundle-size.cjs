const { readFileSync, readdirSync } = require('fs')
const { join } = require('path')
const { gzipSync } = require('zlib')

function findJavaScriptFiles(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name)
    if (entry.isDirectory()) return findJavaScriptFiles(path)
    return entry.isFile() && entry.name.endsWith('.js') ? [path] : []
  })
}

function measureJavaScriptGzip(directory) {
  return findJavaScriptFiles(directory).reduce(
    (total, file) => total + gzipSync(readFileSync(file)).length,
    0
  )
}

function assertWithinBudget(actualBytes, maxBytes) {
  if (actualBytes > maxBytes) {
    throw new Error(
      `Renderer JavaScript gzip size ${actualBytes} bytes exceeds budget by ${actualBytes - maxBytes} byte${actualBytes - maxBytes === 1 ? '' : 's'} (limit: ${maxBytes} bytes)`
    )
  }
}

if (require.main === module) {
  const budget = JSON.parse(readFileSync(join(__dirname, 'bundle-budget.json'), 'utf8'))
  const actualBytes = measureJavaScriptGzip(join(__dirname, '..', 'dist'))
  try {
    assertWithinBudget(actualBytes, budget.maxGzipBytes)
    console.log(`Renderer JavaScript gzip: ${actualBytes} / ${budget.maxGzipBytes} bytes`)
  } catch (error) {
    console.error(error.message)
    process.exit(1)
  }
}

module.exports = { assertWithinBudget, measureJavaScriptGzip }

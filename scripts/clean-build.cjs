const { rmSync } = require('fs')
const { resolve } = require('path')

function cleanDirectories(directories) {
  for (const directory of directories) {
    rmSync(resolve(directory), { recursive: true, force: true })
  }
}

if (require.main === module) {
  const directories = process.argv.slice(2)
  if (directories.length === 0) {
    console.error('Usage: node scripts/clean-build.cjs <directory...>')
    process.exit(1)
  }
  cleanDirectories(directories)
}

module.exports = { cleanDirectories }

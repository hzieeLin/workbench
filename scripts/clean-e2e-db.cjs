const { mkdirSync, rmSync } = require('fs')
const { join } = require('path')

const directory = join(__dirname, '..', '.playwright-cli')
mkdirSync(directory, { recursive: true })
rmSync(join(directory, 'e2e-data.db'), { force: true })

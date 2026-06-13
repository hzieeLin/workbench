const { process: vue3Process } = require('@vue/vue3-jest')

module.exports = {
  process(src, filename, config) {
    const result = vue3Process(src, filename, config)

    if (typeof result === 'string') {
      return { code: result }
    }

    let code = result.code

    // Handle Vue 3.5+ SFC compiler output that separates CJS and ESM parts
    if (!code.includes('export function render(')) {
      return { code, map: result.map }
    }

    // Find where the ESM import starts (may be on same line as base64 sourcemap)
    const importIdx = code.indexOf('import { renderList')
    if (importIdx === -1) {
      return { code, map: result.map }
    }

    const cjsPart = code.substring(0, importIdx)
    const esmPart = code.substring(importIdx)

    // Extract imports and convert to CJS requires
    const importRegex = /import\s*\{([^}]+)\}\s*from\s*"([^"]+)"\s*;?/
    const importMatch = esmPart.match(importRegex)

    let requiresCode = ''
    let esmBody = esmPart

    if (importMatch) {
      const imports = importMatch[1].split(',').map((s) => {
        const parts = s.trim().split(' as ')
        const localName = parts.length > 1 ? parts[1].trim() : parts[0].trim()
        const exportName = parts[0].trim()
        return `var ${localName} = require("${importMatch[2]}")["${exportName}"];`
      })
      requiresCode = imports.join('\n') + '\n'

      // Remove import line(s) from esmBody
      esmBody = esmBody.replace(importRegex, '')
    }

    // Convert export function render to function render
    esmBody = esmBody.replace(/export function render\(/, 'function render(')
    esmBody = esmBody.trim()

    // Add render to defineComponent options
    // The CJS part ends with: }\n});  (setup function close, then defineComponent close)
    let newCjs = cjsPart

    // Find the last }); which closes defineComponent
    const lastCloseIdx = newCjs.lastIndexOf('});')
    if (lastCloseIdx !== -1) {
      newCjs = newCjs.substring(0, lastCloseIdx) + ',\n  render\n});'
    }

    // Find where to insert requires (after existing require statements)
    const lastReqIdx = newCjs.lastIndexOf('require("vue")')
    if (lastReqIdx !== -1) {
      const lineEnd = newCjs.indexOf('\n', lastReqIdx)
      if (lineEnd !== -1) {
        newCjs = newCjs.substring(0, lineEnd + 1) + requiresCode + newCjs.substring(lineEnd + 1)
      }
    }

    // Combine everything
    code = newCjs + '\n' + esmBody

    return { code, map: result.map }
  },
}

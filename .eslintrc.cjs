module.exports = {
  root: true,
  env: { browser: true, es2020: true },
  parser: 'vue-eslint-parser',
  parserOptions: {
    parser: '@typescript-eslint/parser',
    sourceType: 'module',
    ecmaVersion: 2020
  },
  extends: [
    'eslint:recommended',
    '@vue/eslint-config-typescript',
    '@vue/eslint-config-prettier'
  ],
  ignorePatterns: ['dist', 'dist-electron'],
  overrides: [
    {
      files: ['electron/**/*.ts'],
      env: { node: true },
      parser: '@typescript-eslint/parser',
      parserOptions: {
        sourceType: 'module'
      }
    }
  ]
}

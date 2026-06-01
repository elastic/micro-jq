const js = require('@eslint/js')
const { FlatCompat } = require('@eslint/eslintrc')

const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
})

module.exports = [
  {
    ignores: ['node_modules/**', 'dist/**', 'src/parser.ts', 'package.json'],
  },
  ...compat.config({
    env: {
      browser: true,
      commonjs: true,
      es6: true,
      node: true,
    },
    plugins: ['@typescript-eslint', 'jest', 'prettier'],
    extends: [
      'eslint:recommended',
      'plugin:jest/recommended',
      'plugin:prettier/recommended',
      'plugin:@typescript-eslint/recommended',
    ],
    parser: '@typescript-eslint/parser',
    parserOptions: {
      ecmaVersion: 2018,
    },
    rules: {
      indent: ['error', 2, { SwitchCase: 1 }],
      'linebreak-style': ['error', 'unix'],
      quotes: ['error', 'single', { avoidEscape: true }],
      semi: ['error', 'never'],
      'comma-dangle': [
        'error',
        {
          arrays: 'always-multiline',
          objects: 'always-multiline',
          imports: 'always-multiline',
          exports: 'always-multiline',
          functions: 'only-multiline',
        },
      ],
      'prettier/prettier': ['error'],
      curly: ['error', 'all'],
      '@typescript-eslint/ban-ts-comment': 'off',
    },
  }),
]

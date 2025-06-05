import eslintPluginPrettier from 'eslint-plugin-prettier';
import prettierConfig from './.prettierrc.json' assert { type: 'json' }; // optional

export default [
  {
    files: ['**/*.js'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
    },
    plugins: {
      prettier: eslintPluginPrettier,
    },
    rules: {
      'prettier/prettier': ['error', prettierConfig],
    },
  },
];

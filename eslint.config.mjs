import eslint from '@eslint/js';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  {
    ignores: ['eslint.config.mjs'],
  },
  eslint.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  eslintPluginPrettierRecommended,
  {
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.jest,
      },
      sourceType: 'commonjs',
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  {
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-floating-promises': 'warn',
      '@typescript-eslint/no-unsafe-argument': 'warn',
      'prettier/prettier': ['error', { endOfLine: 'auto' }],
    },
  },
  {
    files: ['**/*.spec.ts', '**/*.test.ts'],
    rules: {
      // Permite passar métodos sem .bind() (essencial para o Jest expect)
      '@typescript-eslint/unbound-method': 'off',
      // Permite atribuições "inseguras" (comum em mocks)
      '@typescript-eslint/no-unsafe-assignment': 'off',
      // Permite chamadas inseguras
      '@typescript-eslint/no-unsafe-call': 'off',
      // Permite acesso a membros inseguros
      '@typescript-eslint/no-unsafe-member-access': 'off',
      // Permite retorno inseguro
      '@typescript-eslint/no-unsafe-return': 'off',
    },
  },
);
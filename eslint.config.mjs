// @ts-check

import { globalIgnores } from "eslint/config";
import eslint from "@eslint/js";
import tseslint from "typescript-eslint";
import vueParser from "vue-eslint-parser"
import pluginVue from "eslint-plugin-vue";
import globals from "globals";
import eslintConfigPrettier from "eslint-config-prettier";

export default tseslint.config(
  [
    globalIgnores([
      "vite.config.js",
      ".vite/",
      "public/dropbox-examples/",
      ".dependency-cruiser.cjs",
    ]),
  ],
  eslint.configs.recommended,
  tseslint.configs.recommended,
  // tseslint.configs.strict,
  // tseslint.configs.stylistic,
  pluginVue?.configs["flat/recommended"],
  {
    files: ['*.vue', '**/*.vue'],
    plugins: {
      "typescript-eslint": tseslint.plugin,
    },
    rules: {
      // override/add rules settings here, such as:
      // 'vue/no-unused-vars': 'error'
    },
    languageOptions: {
      parser: vueParser,
      parserOptions: {
        parser: tseslint.parser,
        project: "./tsconfig.json",
        extraFileExtensions: [".vue"],
        sourceType: "module",
        globals: {
          ...globals['shared-node-browser'],
        },
      },
    },
  },
  eslintConfigPrettier
);

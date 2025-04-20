// @ts-check

import eslint from "@eslint/js";
import { globalIgnores } from "eslint/config";
import tseslint from "typescript-eslint";
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
  ...tseslint.configs.recommended,
  // tseslint.configs.strict,
  // tseslint.configs.stylistic,
  ...pluginVue.configs["flat/recommended"],
  {
    plugins: {
      "typescript-eslint": tseslint.plugin,
    },
    rules: {
      // override/add rules settings here, such as:
      // 'vue/no-unused-vars': 'error'
    },
    languageOptions: {
      parserOptions: {
        parser: tseslint.parser,
        project: "./tsconfig.json",
        extraFileExtensions: [".vue"],
        sourceType: "module",
        globals: {
          ...globals.browser,
        },
      },
    },
  },
  eslintConfigPrettier
);

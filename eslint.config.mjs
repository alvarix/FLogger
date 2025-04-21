// @ts-check

import eslint from "@eslint/js";
import { globalIgnores } from "eslint/config";
import tseslint from "typescript-eslint";

// export default defineConfig([globalIgnores([".config/"])]);

export default tseslint.config(
  [globalIgnores(["vite.config.js", ".vite/", "public/dropbox-examples/", ".dependency-cruiser.cjs"])],
  eslint.configs.recommended,
  tseslint.configs.recommended
);

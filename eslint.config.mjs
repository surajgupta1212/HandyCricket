import globals from "globals";
import pluginJs from "@eslint/js";


export default [
  {
    files: ["**/*.js"],
    languageOptions: {
      sourceType: "commonjs",
      globals: { ...globals.browser, ...globals.node }
    }
  },
  pluginJs.configs.recommended,
  {
    rules: {
      "no-console": "off",
      "no-unused-vars": "error",
      "no-undef": "warn",
      "semi": ["error", "always"],
      "prefer-const": "error",
      "no-multiple-empty-lines": ["error", { "max": 1, "maxEOF": 0 }],
    }
}
];
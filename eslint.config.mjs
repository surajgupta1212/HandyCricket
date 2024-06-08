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
      "no-unused-vars": "warn",
      "no-undef": "warn",
      "semi": ["warn", "always"],
      "prefer-const": "warn",
      "no-multiple-empty-lines": ["warn", { "max": 1, "maxEOF": 0 }],
    }
}
];
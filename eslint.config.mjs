import globals from "globals";
import pluginJs from "@eslint/js";


export default [
  {files: ["**/*.js"], languageOptions: {sourceType: "commonjs"}},
  {languageOptions: { globals: {...globals.browser, ...globals.node} }},
  pluginJs.configs.recommended,
  {
    rules: {
      "no-console": "warn",
      "no-unused-vars": "error",
      "no-undef": "error",
      "semi": ["error", "always"],
      "prefer-const": "error",
      "no-multiple-empty-lines": ["error", { "max": 1, "maxEOF": 0 }],
    }
}
];
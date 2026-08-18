const { FlatCompat } = require("@eslint/eslintrc");
const js = require("@eslint/js");

const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
});

module.exports = [
  {
    ignores: ["lib/**", "generated/**", "eslint.config.js"],
  },
  ...compat.extends(
    "eslint:recommended",
    "plugin:import/errors",
    "plugin:import/warnings",
    "plugin:import/typescript",
    "google",
    "plugin:@typescript-eslint/recommended"
  ),
  {
    files: ["**/*.ts", "**/*.tsx"],
    languageOptions: {
      parser: require("@typescript-eslint/parser"),
      parserOptions: {
        project: ["tsconfig.json", "tsconfig.dev.json"],
        sourceType: "module",
      },
    },
    rules: {
      "quotes": ["error", "double"],
      "import/no-unresolved": 0,
      "indent": ["error", 2],
    },
  },
  {
    // Plantillas copiadas tal cual desde react-email-starter/emails - se
    // eximen de max-len/require-jsdoc para que sigan siendo un diff nulo
    // contra el original (más fácil re-sincronizar si el template cambia).
    files: ["src/emails/**/*.ts", "src/emails/**/*.tsx"],
    rules: {
      "max-len": "off",
      "require-jsdoc": "off",
    },
  },
];

module.exports = {
    parser: "@typescript-eslint/parser", // Specifies the ESLint parser
    parserOptions: {
      ecmaVersion: 2020, // Allows for the parsing of modern ECMAScript features
      sourceType: "module", // Allows for the use of imports
      project: "./tsconfig.json"
    },
    extends: [
      "plugin:@typescript-eslint/recommended",
      "prettier/@typescript-eslint",
      "plugin:prettier/recommended"
    ],
    plugins: [
        "@typescript-eslint"
    ],
    rules: {
      "@typescript-eslint/no-explicit-any": "off"
    }
  };
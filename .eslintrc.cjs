/** @type {import("eslint").Linter.Config} */
module.exports = {
    root: true,
    env: { browser: true, es2022: true, node: true },
    parser: "@typescript-eslint/parser",
    parserOptions: { project: "./tsconfig.base.json", tsconfigRootDir: __dirname },
    plugins: ["@typescript-eslint", "react", "react-hooks"],
    extends: [
      "eslint:recommended",
      "plugin:@typescript-eslint/recommended",
      "plugin:react/recommended",
      "plugin:react-hooks/recommended",
      "prettier"
    ],
    settings: {
      react: { version: "detect" }
    },
    overrides: [
      {
        files: ["apps/web/**/*.{ts,tsx}"],
        env: { browser: true },
        parserOptions: { project: "./apps/web/tsconfig.json" }
      },
      {
        files: ["packages/runtime/**/*.ts"],
        env: { browser: true },           // PixiJS はブラウザ想定
        parserOptions: { project: "./packages/runtime/tsconfig.json" }
      }
    ]
  }
  
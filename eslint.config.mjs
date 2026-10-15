import { defineConfig, globalIgnores } from "eslint/config";
import { fixupPluginRules } from "@eslint/compat";
import sortImportsEs6Autofix from "eslint-plugin-sort-imports-es6-autofix";
import stylistic from "@stylistic/eslint-plugin";
import typescriptEslint from "@typescript-eslint/eslint-plugin";
import globals from "globals";
import tsParser from "@typescript-eslint/parser";
import path from "node:path";
import { fileURLToPath } from "node:url";
import js from "@eslint/js";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
    baseDirectory: __dirname,
    recommendedConfig: js.configs.recommended,
    allConfig: js.configs.all
});

export default defineConfig([globalIgnores([
    "dist/**/*",
    "docs/**/*",
    "ts*/**/*",
    "types/**/*",
    "**/rollup.config.js",
]), {
    extends: compat.extends(
        "eslint:recommended",
        "plugin:@typescript-eslint/eslint-recommended",
        "plugin:@typescript-eslint/recommended",
    ),

    plugins: {
        "@stylistic": stylistic,
        "sort-imports-es6-autofix": fixupPluginRules(sortImportsEs6Autofix),
        "@typescript-eslint": typescriptEslint,
    },

    languageOptions: {
        globals: {
            ...globals.commonjs,
            process: true,
        },

        parser: tsParser,
        ecmaVersion: 2017,
        sourceType: "module",
    },

    rules: {
        "@stylistic/indent": ["error", 2, {
            SwitchCase: 0,
            flatTernaryExpressions: true,
            MemberExpression: 1,
            ignoredNodes: ["TSTypeParameterInstantiation"],
        }],

        "linebreak-style": ["error", "unix"],
        quotes: ["error", "single"],
        eqeqeq: ["error", "smart"],

        "max-len": ["error", {
            code: 100,
            ignoreComments: true,
            ignoreStrings: true,
            ignoreTemplateLiterals: true,
            ignoreRegExpLiterals: true,
        }],

        "sort-imports-es6-autofix/sort-imports-es6": ["error"],
        "eol-last": ["error", "always"],

        "@typescript-eslint/no-unused-vars": ["warn", {
            argsIgnorePattern: "^_",
        }],

        "no-var": ["error"],
        "prefer-const": ["error"],
        semi: ["error", "always"],
        curly: ["error"],
        "arrow-parens": ["error", "always"],
        "array-bracket-spacing": ["error", "always"],

        "arrow-spacing": ["error", {
            before: true,
            after: true,
        }],

        "block-spacing": ["error", "always"],

        "comma-spacing": ["error", {
            before: false,
            after: true,
        }],

        "computed-property-spacing": ["error", "always"],

        "key-spacing": ["error", {
            beforeColon: false,
            afterColon: true,
        }],

        "keyword-spacing": ["error", {
            before: true,
            after: true,
        }],

        "object-curly-spacing": ["error", "always"],

        "semi-spacing": ["error", {
            before: false,
            after: true,
        }],

        "space-before-blocks": ["error", "always"],
        "space-in-parens": ["error", "always"],
        "space-infix-ops": ["error"],

        "space-unary-ops": ["error", {
            words: true,
            nonwords: false,

            overrides: {
                "++": true,
                "--": true,
            },
        }],

        "spaced-comment": ["error", "always"],
        "func-call-spacing": ["error", "never"],
        "no-trailing-spaces": ["error"],
        "no-whitespace-before-property": ["error"],

        "space-before-function-paren": ["error", {
            anonymous: "never",
            named: "never",
            asyncArrow: "always",
        }],

        "no-eval": ["off"],
        "no-implied-eval": ["warn"],

        "no-console": ["error", {
            allow: ["info", "warn", "error"],
        }],

        "@typescript-eslint/no-explicit-any": ["off"],
        "@typescript-eslint/explicit-module-boundary-types": ["off"],
        "@typescript-eslint/no-inferrable-types": ["off"],
        "@typescript-eslint/no-non-null-assertion": ["off"],
        "@typescript-eslint/no-empty-interface": ["off"],

        "@typescript-eslint/explicit-function-return-type": ["error", {
            allowExpressions: true,
        }],

        "@typescript-eslint/explicit-member-accessibility": ["error"],
    },
}]);
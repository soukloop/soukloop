import { projectStructurePlugin } from "eslint-plugin-project-structure";
import tsParser from "@typescript-eslint/parser";
import tsPlugin from "@typescript-eslint/eslint-plugin";

const eslintConfig = [
    {
        ignores: [".next/*", "node_modules/*", "coverage/*", "dist/*", "build/*"]
    },
    {
        files: ["**/*.ts", "**/*.tsx"],
        languageOptions: {
            parser: tsParser,
            parserOptions: {
                ecmaVersion: "latest",
                sourceType: "module",
                ecmaFeatures: {
                    jsx: true
                }
            }
        },
        plugins: {
            "@typescript-eslint": tsPlugin
        }
    },
    {
        plugins: {
            "project-structure": projectStructurePlugin
        },
        settings: {
            "project-structure/folder-structure-config-path": "projectStructure.json"
        },
        rules: {
            "project-structure/folder-structure": "error"
        }
    },
    {
        files: ["app/**/*.tsx", "components/**/*.tsx", "features/**/components/**/*.tsx"],
        rules: {
            "no-restricted-imports": [
                "error",
                {
                    "name": "server-only",
                    "message": "Importing 'server-only' in Client Components is strictly prohibited."
                }
            ]
        }
    }
];

export default eslintConfig;

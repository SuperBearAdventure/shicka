// @ts-check
/** @import {Config} from "eslint/config" */
import {parser, plugin} from "typescript-eslint";
/** @type {Config[]} */
export default [
	{
		files: [
			"src/**/*.ts",
		],
		languageOptions: {
			parser: parser,
			parserOptions: {
				projectService: true,
			},
			sourceType: "module",
		},
		plugins: {
			"@typescript-eslint": plugin,
		},
		rules:{
			"@typescript-eslint/explicit-function-return-type": [
				"error",
				{
					allowTypedFunctionExpressions: false,
					allowHigherOrderFunctions: false,
					allowDirectConstAssertionInArrowFunctions: false,
				},
			],
			"@typescript-eslint/explicit-module-boundary-types": [
				"error",
				{
					allowTypedFunctionExpressions: false,
					allowHigherOrderFunctions: false,
					allowDirectConstAssertionInArrowFunctions: false,
				},
			],
			"@typescript-eslint/typedef": [
				"error",
				{
					arrayDestructuring: true,
					arrowParameter: true,
					memberVariableDeclaration: true,
					objectDestructuring: true,
					parameter: true,
					propertyDeclaration: true,
					variableDeclaration: true,
					variableDeclarationIgnoreFunction: true,
				},
			],
		},
	},
];

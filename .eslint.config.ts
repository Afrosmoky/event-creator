import antfu from '@antfu/eslint-config';

export default antfu({
	stylistic: {
		jsx: true,
		semi: true,
		indent: 'tab',
		quotes: 'single',
	},

	typescript: {
		tsconfigPath: 'tsconfig.json',

		overrides: {
			'ts/consistent-type-imports': [
				'error',
				{
					prefer: 'type-imports',
					fixStyle: 'separate-type-imports',
				},
			],
		},

		overridesTypeAware: {
			'ts/no-misused-promises': [
				'error',
				{
					checksVoidReturn: {
						attributes: false,
					},
				},
			],

			'ts/switch-exhaustiveness-check': [
				'error',
				{
					considerDefaultExhaustiveForUnions: true,
				},
			],

			'ts/no-unsafe-return': 'off',
			'ts/no-unsafe-assignment': 'off',
			'ts/no-unsafe-member-access': 'off',
		},
	},

	solid: true,
	formatters: false, // I use dprint

	ignores: [
		'package.json',
		'pnpm-lock.yaml',
	],

	rules: {
		'no-labels': 'off',
		'no-console': 'off',
		'prefer-template': 'off',
		'jsonc/sort-keys': 'off', // lmaoooo
		'ts/no-empty-object-type': 'off', // SHIT
		'style/jsx-quotes': ['error', 'prefer-single'],
		'style/brace-style': ['error', '1tbs', { allowSingleLine: true }],

		'perfectionist/sort-imports': [
			'error',
			{
				type: 'line-length',
				order: 'asc',
				partitionByNewLine: true,
				newlinesBetween: 'ignore',
			},
		],

		'perfectionist/sort-named-imports': [
			'error',
			{
				type: 'line-length',
				order: 'asc',
				partitionByNewLine: true,
			},
		],
	},
});

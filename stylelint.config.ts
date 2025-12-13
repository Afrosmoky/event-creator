import type { Config } from 'stylelint';

export default {
	extends: 'stylelint-config-standard',
	rules: {
		'at-rule-no-unknown': [
			true,
			{
				ignoreAtRules: [
					'tailwind',
					'apply',
					'variants',
					'responsive',
					'screen',
				],
			},
		],
		'color-hex-length': false,
	},
} satisfies Config;

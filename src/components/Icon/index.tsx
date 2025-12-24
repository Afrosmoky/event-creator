import { SPRITES_META } from '@/sprite.gen.ts';

import { clsx } from 'clsx';

import type { JSX } from 'solid-js';
import { createMemo, splitProps } from 'solid-js';

import * as css from './styles.module.css';

export interface IconProps extends JSX.SvgSVGAttributes<SVGSVGElement> {
	name: keyof typeof SPRITES_META;
}

export function Icon(props: IconProps) {
	const [, rest] = splitProps(props, ['name', 'class']);

	return (
		<svg
			class={clsx(css.icon, props.class)}
			{...rest}
		>
			<use href={`/assets/${props.name}.svg`} />
		</svg>
	);
}

import type { SpritesMap } from '@/sprite.gen.ts';
import { SPRITES_META } from '@/sprite.gen.ts';

import { clsx } from 'clsx';

import type { JSX } from 'solid-js';
import { createMemo, splitProps } from 'solid-js';

import * as css from './styles.module.css';

export type IconName<Key extends keyof SpritesMap> = `${Key}/${SpritesMap[Key]}`;
export type AnyIconName = { [Key in keyof SpritesMap]: IconName<Key> }[keyof SpritesMap];

export interface IconProps extends JSX.SvgSVGAttributes<SVGSVGElement> {
	name: AnyIconName;
}

export function Icon(props: IconProps) {
	const [, rest] = splitProps(props, ['name', 'class']);

	const meta = createMemo(() => getIconMeta(props.name));

	return (
		<svg
			class={clsx(css.icon, props.class)}
			{...rest}
		>
			<use href={`/${meta()?.filePath}#${meta()?.iconName}`} />
		</svg>
	);
}

export function getIconMeta<Key extends keyof SpritesMap>(name: IconName<Key>) {
	const [spriteName, iconName] = name.split('/') as [Key, SpritesMap[Key]];
	const { filePath } = SPRITES_META[spriteName];

	return { filePath, iconName };
}

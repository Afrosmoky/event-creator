import { clsx } from 'clsx';

import type { ComponentProps } from 'solid-js';
import { splitProps } from 'solid-js';

export function Label(props: ComponentProps<'label'>) {
	const [, rest] = splitProps(props, ['class']);
	return (
		<label
			class={clsx(
				'text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
				props.class,
			)}
			{...rest}
		/>
	);
};

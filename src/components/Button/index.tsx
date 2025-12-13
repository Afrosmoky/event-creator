import type { VariantProps } from 'class-variance-authority';
import { cva } from 'class-variance-authority';

import { clsx } from 'clsx';

import type { PolymorphicProps } from '@kobalte/core/polymorphic';
import * as KButton from '@kobalte/core/button';

import type { ParentProps, ValidComponent } from 'solid-js';
import { splitProps } from 'solid-js';

const variants = cva(
	'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0',
	{
		variants: {
			variant: {
				default: 'bg-primary text-primary-foreground shadow-sm hover:bg-primary/90',
				destructive: 'bg-destructive text-destructive-foreground shadow-xs hover:bg-destructive/90',
				outline: 'border border-input bg-background shadow-xs hover:bg-accent hover:text-accent-foreground',
				secondary: 'bg-secondary text-secondary-foreground shadow-xs hover:bg-secondary/80',
				ghost: 'hover:bg-accent hover:text-accent-foreground',
				link: 'text-primary underline-offset-4 hover:underline',
			},
			size: {
				default: 'h-9 px-4 py-2',
				sm: 'h-8 rounded-md px-3 text-xs',
				lg: 'h-10 rounded-md px-8',
				icon: 'h-9 w-9',
			},
		},
		defaultVariants: {
			variant: 'default',
			size: 'default',
		},
	},
);

export type ButtonProps<T extends ValidComponent = 'button'> =
	& ParentProps
	& KButton.ButtonRootProps<T>
	& VariantProps<typeof variants>
	& { class?: string };

export function Button<T extends ValidComponent = 'button'>(props: PolymorphicProps<T, ButtonProps<T>>) {
	const [, rest] = splitProps(props as ButtonProps, ['variant', 'size', 'class']);

	return (
		<KButton.Root
			class={clsx(variants({ variant: props.variant, size: props.size }), props.class)}
			{...rest}
		/>
	);
}

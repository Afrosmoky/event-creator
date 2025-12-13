import { clsx } from 'clsx';

import type { Component, ComponentProps } from 'solid-js';
import { splitProps } from 'solid-js';

export const Card: Component<ComponentProps<'div'>> = (props) => {
	const [local, rest] = splitProps(props, ['class']);
	return (
		<div
			class={clsx('rounded-xl border bg-card text-card-foreground shadow', local.class)}
			{...rest}
		/>
	);
};

export function CardHeader(props: ComponentProps<'div'>) {
	const [, rest] = splitProps(props, ['class']);
	return <div class={clsx('flex flex-col space-y-1.5 p-6', props.class)} {...rest} />;
};

export function CardTitle(props: ComponentProps<'h3'>) {
	const [, rest] = splitProps(props, ['class']);
	return (
		<h3 class={clsx('font-semibold leading-none tracking-tight', props.class)} {...rest} />
	);
};

export function CardDescription(props: ComponentProps<'p'>) {
	const [, rest] = splitProps(props, ['class']);
	return <p class={clsx('text-sm text-muted-foreground', props.class)} {...rest} />;
};

export function CardContent(props: ComponentProps<'div'>) {
	const [, rest] = splitProps(props, ['class']);
	return <div class={clsx('p-6 pt-0', props.class)} {...rest} />;
};

export function CardFooter(props: ComponentProps<'div'>) {
	const [, rest] = splitProps(props, ['class']);
	return <div class={clsx('flex items-center p-6 pt-0', props.class)} {...rest} />;
};

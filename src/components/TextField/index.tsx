import { clsx } from 'clsx';
import { cva } from 'class-variance-authority';

import type { PolymorphicProps } from '@kobalte/core/polymorphic';
import * as KTextField from '@kobalte/core/text-field';

import type { VoidProps, ValidComponent } from 'solid-js';
import { splitProps } from 'solid-js';

type TextFieldRootProps<T extends ValidComponent = 'div'> =
	& KTextField.TextFieldRootProps<T>
	& { class?: string };

export function TextFieldRoot<T extends ValidComponent = 'div'>(props: PolymorphicProps<T, TextFieldRootProps<T>>) {
	const [, rest] = splitProps(props as TextFieldRootProps, ['class']);

	return (
		<KTextField.Root
			class={clsx('space-y-1', props.class)}
			{...rest}
		/>
	);
}

const labelVariants = cva(
	'text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
	{
		variants: {
			variant: {
				label: 'data-invalid:text-destructive',
				description: 'font-normal text-muted-foreground',
				error: 'text-xs text-destructive',
			},
		},
		defaultVariants: {
			variant: 'label',
		},
	},
);

type TextFieldLabelProps<T extends ValidComponent = 'label'> =
	& KTextField.TextFieldLabelProps<T>
	& { class?: string };

export function TextFieldLabel<T extends ValidComponent = 'label'>(props: PolymorphicProps<T, TextFieldLabelProps<T>>) {
	const [, rest] = splitProps(props as TextFieldLabelProps, ['class']);

	return (
		<KTextField.Label
			class={clsx(labelVariants(), props.class)}
			{...rest}
		/>
	);
}

type TextFieldErrorMessageProps<T extends ValidComponent = 'div'> =
	& KTextField.TextFieldErrorMessageProps<T>
	& { class?: string };

export function TextFieldErrorMessage<T extends ValidComponent = 'div'>(props: PolymorphicProps<T, TextFieldErrorMessageProps<T>>) {
	const [, rest] = splitProps(props as TextFieldErrorMessageProps, ['class']);

	return (
		<KTextField.ErrorMessage
			class={clsx(labelVariants({ variant: 'error' }), props.class)}
			{...rest}
		/>
	);
}

type TextFieldDescriptionProps<T extends ValidComponent = 'div'> =
	& KTextField.TextFieldDescriptionProps<T>
	& { class?: string };

export function TextFieldDescription<T extends ValidComponent = 'div'>(props: PolymorphicProps<T, TextFieldDescriptionProps<T>>) {
	const [, rest] = splitProps(props as TextFieldDescriptionProps, ['class']);

	return (
		<KTextField.Description
			class={clsx(
				labelVariants({ variant: 'description' }),
				props.class,
			)}
			{...rest}
		/>
	);
}

type TextFieldInputProps<T extends ValidComponent = 'input'> = VoidProps<
	& KTextField.TextFieldInputProps<T>
	& { class?: string }
>;

export function TextFieldInput<T extends ValidComponent = 'input'>(props: PolymorphicProps<T, TextFieldInputProps<T>>) {
	const [local, rest] = splitProps(props as TextFieldInputProps, ['class']);

	return (
		<KTextField.Input
			class={clsx(
				'flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-shadow file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-hidden focus-visible:ring-[1.5px] focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50',
				local.class,
			)}
			{...rest}
		/>
	);
}

import { clsx } from 'clsx';

import type { PolymorphicProps } from '@kobalte/core/polymorphic';
import * as KSlider from '@kobalte/core/slider';

import { Label } from '@/components/Label';

import type { JSX, ValidComponent } from 'solid-js';
import { splitProps } from 'solid-js';

export type SliderRootProps<T extends ValidComponent = 'div'> =
	& KSlider.SliderRootProps<T>
	& { class?: string | undefined };

export function Slider<T extends ValidComponent = 'div'>(props: PolymorphicProps<T, SliderRootProps<T>>) {
	const [local, others] = splitProps(props as SliderRootProps, ['class']);
	return (
		<KSlider.Root
			class={clsx('relative flex w-full touch-none select-none flex-col items-center', local.class)}
			{...others}
		/>
	);
}

export type SliderTrackProps<T extends ValidComponent = 'div'> = KSlider.SliderTrackProps<T> & {
	class?: string | undefined;
};

export function SliderTrack<T extends ValidComponent = 'div'>(props: PolymorphicProps<T, SliderTrackProps<T>>) {
	const [local, others] = splitProps(props as SliderTrackProps, ['class']);
	return (
		<KSlider.Track
			class={clsx('relative h-2 w-full grow rounded-full bg-secondary', local.class)}
			{...others}
		/>
	);
}

export type SliderFillProps<T extends ValidComponent = 'div'> = KSlider.SliderFillProps<T> & {
	class?: string | undefined;
};

export function SliderFill<T extends ValidComponent = 'div'>(props: PolymorphicProps<T, SliderFillProps<T>>) {
	const [local, others] = splitProps(props as SliderFillProps, ['class']);
	return (
		<KSlider.Fill
			class={clsx('absolute h-full rounded-full bg-primary', local.class)}
			{...others}
		/>
	);
}

export type SliderThumbProps<T extends ValidComponent = 'span'> = KSlider.SliderThumbProps<T> & {
	class?: string | undefined;
	children?: JSX.Element;
};

export function SliderThumb<T extends ValidComponent = 'span'>(props: PolymorphicProps<T, SliderThumbProps<T>>) {
	const [local, others] = splitProps(props as SliderThumbProps, ['class', 'children']);
	return (
		<KSlider.Thumb
			class={clsx(
				'top-[-6px] block size-5 rounded-full border-2 border-primary bg-background transition-colors focus-visible:outline-hidden disabled:pointer-events-none disabled:opacity-50',
				local.class,
			)}
			{...others}
		>
			<KSlider.Input />
		</KSlider.Thumb>
	);
}

export function SliderLabel<T extends ValidComponent = 'label'>(props: PolymorphicProps<T, KSlider.SliderLabelProps<T>>) {
	return <KSlider.Label as={Label} {...props} />;
}

export function SliderValueLabel<T extends ValidComponent = 'label'>(props: PolymorphicProps<T, KSlider.SliderValueLabelProps<T>>) {
	return <KSlider.ValueLabel as={Label} {...props} />;
}

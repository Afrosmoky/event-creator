import { clsx } from 'clsx';

import type { PolymorphicProps } from '@kobalte/core/polymorphic';
import * as KPopover from '@kobalte/core/popover';

import type { ValidComponent } from 'solid-js';
import { splitProps } from 'solid-js';

export const PopoverTrigger = KPopover.Trigger;
export const PopoverAnchor = KPopover.Anchor;

export function Popover(props: KPopover.PopoverRootProps) {
	return <KPopover.Root gutter={4} modal={true} {...props} />;
};

type PopoverContentProps<T extends ValidComponent = 'div'> =
	& KPopover.PopoverContentProps<T>
	& { class?: string };

export function PopoverContent<T extends ValidComponent = 'div'>(props: PolymorphicProps<T, PopoverContentProps<T>>) {
	const [, rest] = splitProps(props as PopoverContentProps, ['class']);
	return (
		<KPopover.Portal>
			<KPopover.Content
				class={clsx(
					'z-50 w-72 origin-[var(--kb-popover-content-transform-origin)] rounded-md border bg-popover p-1 text-popover-foreground',
					'shadow-md outline-none data-[expanded]:animate-in data-[closed]:animate-out data-[closed]:fade-out-0 data-[expanded]:fade-in-0 data-[closed]:zoom-out-95 data-[expanded]:zoom-in-95',
					props.class,
				)}
				{...rest}
			/>
		</KPopover.Portal>
	);
}

import { clsx } from 'clsx';

import { Check, Circle, ChevronRight } from 'lucide-solid';

import type { PolymorphicProps } from '@kobalte/core/polymorphic';
import * as KDropdownMenu from '@kobalte/core/dropdown-menu';

import type { ParentProps, ComponentProps, ValidComponent } from 'solid-js';
import { splitProps } from 'solid-js';

export const DropdownMenuTrigger = KDropdownMenu.Trigger;
export const DropdownMenuPortal = KDropdownMenu.Portal;
export const DropdownMenuSub = KDropdownMenu.Sub;
export const DropdownMenuGroup = KDropdownMenu.Group;
export const DropdownMenuRadioGroup = KDropdownMenu.RadioGroup;

export function DropdownMenu(props: KDropdownMenu.DropdownMenuRootProps) {
	return <KDropdownMenu.Root gutter={4} {...props} />;
};

export type DropdownMenuContentProps<T extends ValidComponent = 'div'> =
	& KDropdownMenu.DropdownMenuContentProps<T>
	& { class?: string };

export function DropdownMenuContent<T extends ValidComponent = 'div'>(props: PolymorphicProps<T, DropdownMenuContentProps<T>>) {
	const [, rest] = splitProps(props as DropdownMenuContentProps, ['class']);
	return (
		<KDropdownMenu.Portal>
			<KDropdownMenu.Content
				class={clsx(
					'z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md',
					'data-[expanded]:animate-in data-[closed]:animate-out data-[closed]:fade-out-0 data-[expanded]:fade-in-0 data-[closed]:zoom-out-95 data-[expanded]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2',
					props.class,
				)}
				{...rest}
			/>
		</KDropdownMenu.Portal>
	);
}

export type DropdownMenuItemProps<T extends ValidComponent = 'div'> =
	& KDropdownMenu.DropdownMenuItemProps<T>
	& {
		inset?: boolean;
		class?: string;
	};

export function DropdownMenuItem<T extends ValidComponent = 'div'>(props: PolymorphicProps<T, DropdownMenuItemProps<T>>) {
	const [, rest] = splitProps(props as DropdownMenuItemProps, ['class']);
	return (
		<KDropdownMenu.Item
			class={clsx(
				'relative flex cursor-default select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-hidden transition-colors focus:bg-accent focus:text-accent-foreground data-disabled:pointer-events-none data-disabled:opacity-50 [&>svg]:size-4 [&>svg]:shrink-0',
				props.inset && 'pl-8',
				props.class,
			)}
			{...rest}
		/>
	);
}

export function DropdownMenuShortcut(props: ComponentProps<'span'>) {
	const [, rest] = splitProps(props, ['class']);
	return <span class={clsx('ml-auto text-xs tracking-widest opacity-60', props.class)} {...rest} />;
};

type DropdownMenuLabelProps<T extends ValidComponent = 'div'> =
	& KDropdownMenu.DropdownMenuGroupLabelProps<T>
	& {
		inset?: boolean;
		class?: string;
	};

export function DropdownMenuLabel<T extends ValidComponent = 'div'>(props: PolymorphicProps<T, DropdownMenuLabelProps<T>>) {
	const [, rest] = splitProps(props as DropdownMenuLabelProps, ['class', 'inset']);
	return (
		<KDropdownMenu.GroupLabel
			class={clsx(
				'px-2 py-1.5 text-sm font-semibold',
				props.inset && 'pl-8',
				props.class,
			)}
			{...rest}
		/>
	);
};

export type DropdownMenuSeparatorProps<T extends ValidComponent = 'hr'> =
	& KDropdownMenu.DropdownMenuSeparatorProps<T>
	& { class?: string };

export function DropdownMenuSeparator<T extends ValidComponent = 'hr'>(props: PolymorphicProps<T, DropdownMenuSeparatorProps<T>>) {
	const [, rest] = splitProps(props as DropdownMenuSeparatorProps, ['class']);
	return (
		<KDropdownMenu.Separator
			class={clsx('-mx-1 my-1 h-px bg-muted', props.class)}
			{...rest}
		/>
	);
}

export type DropdownMenuSubTriggerProps<T extends ValidComponent = 'div'> =
	& ParentProps
	& KDropdownMenu.DropdownMenuSubTriggerProps<T>
	& {
		inset?: boolean;
		class?: string;
	};

export function DropdownMenuSubTrigger<T extends ValidComponent = 'div'>(props: PolymorphicProps<T, DropdownMenuSubTriggerProps<T>>) {
	const [, rest] = splitProps(props as DropdownMenuSubTriggerProps, ['class', 'children']);
	return (
		<KDropdownMenu.SubTrigger
			class={clsx(
				'flex cursor-default gap-2 select-none items-center rounded-sm px-2 py-1.5 text-sm outline-hidden focus:bg-accent data-[expanded]:bg-accent [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0',
				props.inset && 'pl-8',
				props.class,
			)}
			{...rest}
		>
			{props.children}
			<ChevronRight class='ml-auto' />
		</KDropdownMenu.SubTrigger>
	);
}

export type DropdownMenuSubContentProps<T extends ValidComponent = 'div'> =
	& KDropdownMenu.DropdownMenuSubContentProps<T>
	& { class?: string };

export function DropdownMenuSubContent<T extends ValidComponent = 'div'>(props: PolymorphicProps<T, DropdownMenuSubContentProps<T>>) {
	const [, rest] = splitProps(props as DropdownMenuSubContentProps, ['class']);
	return (
		<KDropdownMenu.SubContent
			class={clsx('z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-lg data-[expanded]:animate-in data-[closed]:animate-out data-[closed]:fade-out-0 data-[expanded]:fade-in-0 data-[closed]:zoom-out-95 data-[expanded]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2', props.class)}
			{...rest}
		/>
	);
}

export type DropdownMenuCheckboxItemProps<T extends ValidComponent = 'div'> =
	& ParentProps
	& KDropdownMenu.DropdownMenuCheckboxItemProps<T>
	& { class?: string };

export function DropdownMenuCheckboxItem<T extends ValidComponent = 'div'>(props: PolymorphicProps<T, DropdownMenuCheckboxItemProps<T>>) {
	const [, rest] = splitProps(props as DropdownMenuCheckboxItemProps, ['class', 'children']);
	return (
		<KDropdownMenu.CheckboxItem
			class={clsx('relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-hidden transition-colors focus:bg-accent focus:text-accent-foreground data-disabled:pointer-events-none data-disabled:opacity-50', props.class)}
			{...rest}
		>
			<span class='absolute left-2 flex h-3.5 w-3.5 items-center justify-center'>
				<KDropdownMenu.ItemIndicator>
					<Check class='h-4 w-4' />
				</KDropdownMenu.ItemIndicator>
			</span>
			{props.children}
		</KDropdownMenu.CheckboxItem>
	);
}

export type DropdownMenuRadioItemProps<T extends ValidComponent = 'div'> =
	& ParentProps
	& KDropdownMenu.DropdownMenuRadioItemProps<T>
	& { class?: string };

export function DropdownMenuRadioItem<T extends ValidComponent = 'div'>(props: PolymorphicProps<T, DropdownMenuRadioItemProps<T>>) {
	const [, rest] = splitProps(props as DropdownMenuRadioItemProps, ['class', 'children']);
	return (
		<KDropdownMenu.RadioItem
			class={clsx('relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-hidden transition-colors focus:bg-accent focus:text-accent-foreground data-disabled:pointer-events-none data-disabled:opacity-50', props.class)}
			{...rest}
		>
			<span class='absolute left-2 flex h-3.5 w-3.5 items-center justify-center'>
				<KDropdownMenu.ItemIndicator>
					<Circle class='h-2 w-2 fill-current' />
				</KDropdownMenu.ItemIndicator>
			</span>
			{props.children}
		</KDropdownMenu.RadioItem>
	);
}

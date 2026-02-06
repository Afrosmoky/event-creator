import { ParentProps, Show } from "solid-js";

interface InspectorProps extends ParentProps {
    show: boolean
}

export function Inspector(props: InspectorProps) {
    return (
        <div 
            class="
                absolute transition-transform translate-x-0 right-0 w-86 top-1 bottom-1 flex flex-col rounded-l-lg bg-card border border-border
                shadow-sm shadow-black/20 z-20
            "
            classList={{
                "translate-x-full": !props.show
            }}

            on:pointerdown={(e) => e.stopPropagation()}
        >
            <Show when={props.show}>
                {props.children}
            </Show>
        </div>
    );
}

export function InspectorHead(props: ParentProps) {
    return (
        <div class="flex flex-col items-center py-2 px-4">
            {props.children}
            <div class="w-full border-border border-b border-dashed"></div>
        </div>
    );
}

export function InspectorTitle(props: ParentProps) {
    return (
        <h1 class="grow p-2 font-bold text-xl text-center text-foreground">
            {props.children}
        </h1>
    );
}

export function InspectorContent(props: ParentProps) {
    return (
        <div class="grow flex flex-col gap-6 overflow-y-auto overflow-x-hidden py-2 px-3">
            {props.children}
        </div>
    );
}

export function InspectorCategory(props: ParentProps) {
    return (
        <div class="flex flex-col gap-3">
            {props.children}
        </div>
    )
}

export function InspectorCategoryTitle(props: ParentProps) {
    return (
        <label class="font-semibold uppercase text-sm text-accent">
            {props.children}
        </label>
    );
}

export function InspectorCategoryContent(props: ParentProps) {
    return (
        <div class="flex flex-col gap-4">
            {props.children}
        </div>
    );
}
import { createMemo, createSignal, For, Show } from "solid-js";

interface PropertyDropdownProps {
    value: string;
    updateValue: (value: string) => void;

    invalidOptionFallback?: string;

    options: {
        key: string;
        label: string;
    }[];
}

export default function PropertyDropdown(
    props: PropertyDropdownProps
) {
    const [menuOpen, setMenuOpen] = createSignal(false);
    const options = createMemo(() => props.options);

    const currentOptionValue = createMemo(() => {
        const found = options().find(o => o.key === props.value);
        return found ? found.label : props.invalidOptionFallback || props.value;
    });

    return (
        <div class="relative">
            <button
                class="w-full rounded-md min-w-0 bg-primary-soft border-border border px-3 py-2 flex items-center justify-start gap-2 cursor-pointer"
                on:click={() => setMenuOpen(!menuOpen())}
            >
                <label class="text-sm text-foreground">{currentOptionValue()}</label>
            </button>
            <div 
                class="-bottom-1 w-full max-h-96 translate-y-full rounded-md bg-card border-border border overflow-y-scroll overscroll-none no-scrollbar z-50"
                classList={{
                    "absolute": menuOpen(),
                    "hidden": !menuOpen()
                }}
            >
                <div class="flex flex-col gap-1">
                    <For each={options()}>
                        {option => {
                            return (
                                <button
                                    class="w-full min-w-0 px-3 py-2 bg-card flex items-center justify-start gap-2 cursor-pointer"
                                    on:click={() => {
                                        props.updateValue(option.key);
                                        setMenuOpen(false);
                                    }}
                                >
                                    <label class="text-sm text-foreground">{option.label}</label>
                                </button>
                            );
                        }}
                    </For>
                </div>
            </div>
        </div>
    )
}
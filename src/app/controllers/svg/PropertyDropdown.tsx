import { createMemo, createSignal, For, onMount, Show } from "solid-js";
import { Portal } from "solid-js/web";

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
    let dropdownRef: HTMLDivElement;
    let selectorRef: HTMLDivElement;

    const [menuOpen, setMenuOpen] = createSignal(false);
    const options = createMemo(() => props.options);

    const currentOptionValue = createMemo(() => {
        const found = options().find(o => o.key === props.value);
        return found ? found.label : props.invalidOptionFallback || props.value;
    });

    function getPositionStyle() {
        if(!dropdownRef) return {};

        const rect = dropdownRef.getBoundingClientRect();
        return {
            top: rect.top + rect.height + 4 + "px",
            left: rect.left + "px",
            width: rect.width + "px"
        };
    }

    onMount(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if(selectorRef && !selectorRef.contains(event.target as Node) && !dropdownRef?.contains(event.target as Node)) {
                setMenuOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    });

    return (
        <div class="relative" ref={dropdownRef}>
            <button
                class="w-full rounded-md min-w-0 bg-primary-soft border-border border px-3 py-2 flex items-center justify-start gap-2 cursor-pointer"
                on:click={() => setMenuOpen(!menuOpen())}
            >
                <label class="text-sm text-foreground">{currentOptionValue()}</label>
            </button>
            <Show when={menuOpen()}>
                <Portal>
                    <div 
                        ref={selectorRef}
                        class="absolute max-h-72 rounded-md bg-card border-border border overflow-y-scroll overscroll-none z-50"
                        style={getPositionStyle()}
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
                </Portal>
            </Show>
        </div>
    )
}
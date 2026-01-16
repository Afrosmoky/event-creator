import { useI18nContext } from "@/app/context/I18nContext";
import { EnumLike, SvgItem } from "./SvgItem";
import { createMemo, createSignal, For, Match, onCleanup, onMount, Show, Switch } from "solid-js";
import Slider from "./Slider";
import { ChevronDownIcon, ChevronUpIcon, MinusIcon, PlusIcon } from "lucide-solid";
import { isIconAvailable, SvgIcon } from "./SvgItemIcon";
import { SPRITES_META, VALID_ICONS } from "@/sprite.gen";

interface PropertyInputProps {
    title: string,
    type: "number" | "string" | "color" | "icon" | EnumLike,
    theme?: "normal" | "slider" | "standout",
    placeholder?: string,
    item?: SvgItem,
    value: [any, (value: any) => void],
    is_int?: boolean,
    min?: number,
    max?: number
}

export default function PropertyInput(
    props: PropertyInputProps
) {
    let dom: HTMLDivElement = null!;

    const i18n = useI18nContext();
    const [menuOpen, setMenuOpen] = createSignal(false);
    const formattedValue = createMemo(() => {
        if(props.type == "number") {
            if(props.is_int) {
                return props.value[0] as number;
            } else {
                return (props.value[0] as number).toFixed(2).replace(',', '.');
            }
        } else {
            return props.value[0];
        }
    });

    onMount(() => {
        if(props.type == "icon") {
            window.addEventListener('pointerdown', onWindowPointerDown);
            window.addEventListener('wheel', onWindowScroll);
        }
    });

    onCleanup(() => {
        window.removeEventListener('pointerdown', onWindowPointerDown);
        window.removeEventListener('wheel', onWindowScroll);
    })

    function onWindowPointerDown(e: PointerEvent) {
        const target = e.target as Node;
        const isTargetingMenu = target == dom || dom.contains(target);

        if(!isTargetingMenu) {
            setMenuOpen(false);
        }
    }

    function onWindowScroll(e: Event) {
        const target = e.target as Node;
        const isTargetingMenu = target == dom || dom.contains(target);

        if(!isTargetingMenu) {
            setMenuOpen(false);
        }
    }

    function updateValue(value: any) {
        if(props.type == "number" ) {
            value = props.is_int ? parseInt(value) : parseFloat(value);

            if(Number.isNaN(value)) {
                value = props.value[0];
            } else if(props.min != undefined) {
                value = Math.max(value, props.min);
            }
        } else if(props.type == "string") {
            value = value;
        } else if(props.type == "color") {
            value = value;
        } else {
            value = value;
        }

        props.value[1]?.(value);
    }

    function onInput(e: Event) {
        const input = e.target as HTMLInputElement;
        updateValue(input.value);
    }

    function onNumberInput(e: Event) {
        const input = e.target as HTMLInputElement;
        let value = input.value
            .replace(/,/g, '.')
            .replace(/[^0-9.-]+/g, '');

        value = value.slice(0, 1) + value.slice(1).replace(/-/g, '');

        const dotIndex = value.indexOf('.');
        if(dotIndex != -1) {
            value = value.slice(0, dotIndex + 1) + value.slice(dotIndex + 1).replace(/\./g, '');
        }

        input.value = value;
    }

    function onNumberChange(e: Event) {
        const input = e.target as HTMLInputElement;
        
        updateValue(input.value);
        input.value = formattedValue();
    }

    return (
        <div class="flex flex-col items-start gap-1 text-sm">
            <Show when={props.type != "color"}>
                <label class="text-xs pl-1 italic text-foreground-muted">
                    {i18n.t(props.title as any) ?? props.title}
                </label>
            </Show>
            <div class="w-full text-foreground" ref={dom}>
                <Show when={props.type == "string"}>
                    <input 
                        class="w-full rounded-md h-full bg-primary-soft border-border border px-3 py-2 outline-accent focus:outline-2"
                        value={formattedValue()} onInput={onInput} placeholder={props.placeholder} type="text"></input>
                </Show>
                <Show when={props.type == "number"}>
                    <Switch>
                        <Match when={props.theme === "slider"}>
                            <Slider value={props.value[0]} onChange={props.value[1]} min={props.min ?? 0} max={props.max ?? 100}></Slider>
                        </Match>
                        <Match when={props.theme == "standout"}>
                            <div class="flex items-center justify-center gap-2">
                                <button 
                                    class="rounded-full p-2 bg-primary-soft cursor-pointer"
                                    on:pointerdown={() => updateValue(props.value[0] - 1)}
                                >
                                    <MinusIcon width={16} height="auto" stroke="gray" />
                                </button>
                                <input 
                                    class="
                                        bg-primary rounded-3xl py-1.5 text-foreground font-semibold 
                                        text-lg w-20 text-center outline-accent focus:outline-2
                                    "
                                    value={formattedValue()} onChange={onNumberChange} onInput={onNumberInput}
                                >
                                </input>
                                <button 
                                    class="rounded-full p-2 bg-primary-soft cursor-pointer"
                                    on:pointerdown={() => updateValue(props.value[0] + 1)}
                                >
                                    <PlusIcon width={16} height="auto" stroke="gray" />
                                </button>
                            </div>
                        </Match>
                        <Match when={true}>
                            <div class="flex items-center h-full gap-1 rounded-sm text-foreground bg-primary-soft border-border border">
                                <div class="w-full h-full relative">
                                    <input 
                                        class="w-full px-3 py-2 rounded-sm min-w-0 h-full outline-accent focus:outline"
                                        value={formattedValue()} onChange={onNumberChange} onInput={onNumberInput}
                                    />
                                    <button 
                                        class="absolute top-1 right-2 cursor-pointer"
                                        on:pointerdown={() => updateValue(props.value[0] + 1)}
                                    >
                                        <ChevronUpIcon width={16} height={16} stroke="gray" pointer-events="none"/>
                                    </button>
                                    <button 
                                        class="absolute bottom-1 right-2 cursor-pointer"
                                        on:pointerdown={() => updateValue(props.value[0] - 1)}
                                    >
                                        <ChevronDownIcon width={16} height={16} stroke="gray" pointer-events="none"/>
                                    </button>
                                </div>
                            </div>
                        </Match>
                    </Switch>
                </Show>
                <Show when={props.type == "color"}>
                    <div class="relative flex items-center gap-3">
                        <div class="w-8 h-8 rounded-lg border border-border" style={{ "background-color": formattedValue() }}>

                        </div>
                        <input 
                            class="absolute top-0 left-0 w-8 h-8 rounded-lg cursor-pointer opacity-0"
                            value={formattedValue()} onInput={onInput} type="color" 
                        />
                        <label class="text-sm text-foreground">{props.title}</label>
                    </div>
                    
                    
                </Show>
                <Show when={props.type == "icon"}>
                    <div class="relative">
                        <button
                            class="w-full rounded-md min-w-0 bg-primary-soft border-border border px-3 py-2 flex items-center justify-center gap-2 cursor-pointer"
                            on:click={() => setMenuOpen(!menuOpen())}
                        >
                            <SvgIcon icon={formattedValue()} width="86" height="86"/>
                        </button>
                        <div 
                            class="-bottom-1 w-full h-96 translate-y-full rounded-md bg-card border-border border overflow-y-scroll overscroll-none no-scrollbar z-50"
                            classList={{
                                "absolute": menuOpen(),
                                "hidden": !menuOpen()
                            }}
                        >
                            <div class="grid grid-cols-4">
                                <For each={[...VALID_ICONS]}>
                                    {key => {
                                        return (
                                            <button
                                                class="w-full min-w-0 px-3 py-2 bg-card flex items-center justify-center gap-2 cursor-pointer"
                                                on:click={() => {
                                                    updateValue(key);
                                                    setMenuOpen(false);
                                                }}
                                            >
                                                <SvgIcon icon={key} width="48" height="48"/>
                                            </button>
                                        );
                                    }}
                                </For>
                            </div>
                        </div>
                        <Show when={!isIconAvailable(formattedValue())}>
                            <p class="text-sm text-error mt-1">
                                Ikona "{formattedValue()}" nie jest dostępna.
                            </p>
                        </Show>
                    </div>
                </Show>
            </div>
        </div>
    )
}
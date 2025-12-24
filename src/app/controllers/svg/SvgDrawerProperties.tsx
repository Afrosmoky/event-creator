import { useSvgDrawerContext } from "@/app/context/SvgDrawerContext";
import { createMemo, createSignal, For, Match, onCleanup, onMount, Show, Switch } from "solid-js";
import { SvgItem, SvgItems, type EnumLike, type PropertiesDescriptor, type PropertyDescriptor, type SvgItemBlueprint } from "./SvgItem";
import { SPRITES_META } from "@/sprite.gen";
import { useI18nContext } from "@/app/context/I18nContext";
import { SvgIcon } from "./SvgItemIcon";
import { ChevronDownIcon, ChevronUpIcon, Trash2Icon } from "lucide-solid";

export function SvgDrawerProperties() {
    const i18n = useI18nContext();
    const context = useSvgDrawerContext();
    const focusedItem = createMemo(() => {
        const index = context.focusedItemIndex();
        return context.items[index];
    });

    const focusedItemExtraProps = createMemo(() => {
        const item = focusedItem();
        if(!item) {
            return [];
        }

        const blueprint = (SvgItems as any)[item.kind] as SvgItemBlueprint;
        if(!blueprint) {
            return [];
        }

        return blueprint.props as PropertiesDescriptor;
    });

    function onDeleteItem() {
        const item = focusedItem();
        if(!item) {
            return;
        }

        context.setFocusedItemIndex(-1);
        context.removeItem(item.id);
    }

    return (
        <Show when={focusedItem()}>
            <div class="absolute w-82 top-0 bottom-0 right-0 flex flex-col bg-white border border-gray-400">
                <div class="flex items-center p-2">
                    <h1 class="grow p-2 font-bold text-xl">Obiekt ID #{focusedItem()!.id}</h1>
                    <button 
                        class="rounded-md shadow-inner shadow-black/40 p-3 flex justify-center items-center cursor-pointer"
                        on:click={onDeleteItem}
                    >
                        <Trash2Icon stroke="#bd50bd" width="20" height="20"/>
                    </button>
                </div>
                
                <div class="grow flex flex-col gap-2 overflow-y-auto overflow-x-hidden p-4">
                    <h2 class="font-bold uppercase text-lg border-gray-100 border-b-2">
                        {i18n.t("category_transform")}
                    </h2>
                    <div class="flex flex-col gap-4">
                        <PropertyInput
                            title="prop_x"
                            type="number"
                            value={[focusedItem()!.x, (value) => context.modifyItem(focusedItem()!.id, { x: value }) ]}
                        />
                        <PropertyInput
                            title="prop_y"
                            type="number"
                            value={[focusedItem()!.y, (value) => context.modifyItem(focusedItem()!.id, { y: value }) ]}
                        />
                        <Switch>
                            <Match when={focusedItem()!.kind === "TABLE_CIRCLE"}>
                                <PropertyInput
                                    title="prop_radius"
                                    type="number"
                                    min={1}
                                    value={[focusedItem()!.w, (value) => context.modifyItem(focusedItem()!.id, {
                                        w: value,
                                        h: value
                                    })]}
                                />
                            </Match>
                            <Match when={true}>
                                <PropertyInput 
                                    title="prop_width"
                                    type="number"
                                    min={64}
                                    value={[focusedItem()!.w, (value) => context.modifyItem(focusedItem()!.id, { w: value }) ]}
                                />
                                <PropertyInput 
                                    title="prop_height"
                                    type="number"
                                    min={64}
                                    value={[focusedItem()!.h, (value) => context.modifyItem(focusedItem()!.id, { h: value }) ]}
                                />
                            </Match>
                        </Switch>
                        
                        <PropertyInput 
                            title="prop_angle"
                            type="number"
                            value={[focusedItem()!.angle, (value) => context.modifyItem(focusedItem()!.id, { angle: value }) ]}
                        />
                    </div>
                    <div class="h-4"></div>
                    <h2 class="font-bold uppercase text-lg border-gray-100 border-b-2">
                        {i18n.t("category_parameters")}
                    </h2>
                    <div class="flex flex-col gap-4">
                        <For each={Object.keys(focusedItemExtraProps())}>
                            {key => {
                                const descr = (focusedItemExtraProps() as any)[key] as PropertyDescriptor;
                                if(descr.hide_in_inspector) {
                                    return;
                                }

                                return (
                                    <PropertyInput 
                                        title={descr.name}
                                        type={descr.type}
                                        item={focusedItem()}
                                        is_int={descr.is_int}
                                        min={descr.min}
                                        value={[
                                            focusedItem()?.props?.[key],
                                            (value) => context.modifyItem(focusedItem()!.id, {
                                                props: {
                                                    [key]: value
                                                }
                                            })
                                        ]}
                                    />
                                );
                            }}
                        </For>
                    </div>
                </div>
            </div>
            <div class="absolute top-2 left-2 text-[0.5rem]">
                <pre>
                    {JSON.stringify(focusedItem(), null, 2)}
                </pre>
            </div>
        </Show>
    );
}

function PropertyInput(
    props: {
        title: string,
        type: "number" | "string" | "color" | "icon" | EnumLike,
        item?: SvgItem,
        value: [any, (value: any) => void],
        is_int?: boolean,
        min?: number
    }
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
        <Show when={!props.item || !(props.item.kind != "TABLE_CIRCLE" && props.title === "prop_seats")}>
        <div class="flex items-center gap-2 text-sm">
            <div class="flex items-center rounded-md shadow-sm shadow-black/40 h-full border-gray-100 border px-3 py-2">
                <label class="font-semibold text-nowrap">{i18n.t(props.title as any) ?? props.title}</label>
            </div>
            <div class="grow h-full" ref={dom}>
                <Show when={props.type == "string"}>
                    <input 
                        class="w-full rounded-md shadow-sm min-w-0 shadow-black/40 h-full border-gray-100 border px-2 py-1"
                        value={formattedValue()} onInput={onInput} type="text"></input>
                </Show>
                <Show when={props.type == "number"}>
                    <div class="flex items-center h-full gap-1 rounded-md shadow-sm shadow-black/40 border-gray-100 border">
                        <div class="w-full h-full relative">
                            <input 
                                class="w-full px-2 py-1 rounded-md min-w-0 h-full"
                                value={formattedValue()} onChange={onNumberChange} onInput={onNumberInput}/>
                            <button 
                                class="absolute top-0.5 right-2 cursor-pointer bg-white"
                                on:pointerdown={() => updateValue(props.value[0] + 1)}
                            >
                                <ChevronUpIcon width={16} height={16} pointer-events="none"/>
                            </button>
                            <button 
                                class="absolute bottom-0.5 right-2 cursor-pointer bg-white"
                                on:pointerdown={() => updateValue(props.value[0] - 1)}
                            >
                                <ChevronDownIcon width={16} height={16} pointer-events="none"/>
                            </button>
                        </div>
                        
                        <Show when={props.title !== "prop_seats" && props.title !== "prop_angle"}>
                            <div class="text-xs font-bold pr-3">CM</div>
                        </Show>
                    </div>
                    
                    
                </Show>
                <Show when={props.type == "color"}>
                    <input 
                        class="min-w-27.5 w-full rounded-md shadow-sm shadow-black/40 h-full border-gray-100 border px-1.5 py-1.5"
                        value={formattedValue()} onInput={onInput} type="color"></input>
                </Show>
                <Show when={props.type == "icon"}>
                    <div class="w-fit relative">
                        <button
                            class="w-full rounded-md shadow-sm min-w-0 shadow-black/40 border-gray-100 border px-3 py-2 flex items-center justify-center gap-2 cursor-pointer"
                            on:click={() => setMenuOpen(!menuOpen())}
                        >
                            <SvgIcon icon={formattedValue()} width="48" height="48"/>
                        </button>
                        <div 
                            class="-top-2 w-full h-96 -translate-y-full rounded-md shadow-sm shadow-black/40 bg-white border-gray-100 border overflow-y-scroll overscroll-none no-scrollbar"
                            classList={{
                                "absolute": menuOpen(),
                                "hidden": !menuOpen()
                            }}
                        >
                            <div class="flex flex-col ">
                                <For each={Object.keys(SPRITES_META) as (keyof typeof SPRITES_META)[]}>
                                    {key => {
                                        return (
                                            <button
                                                class="w-full min-w-0 border-gray-200 border-b border-dashed px-3 py-2 flex items-center justify-center gap-2 cursor-pointer"
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
                    </div>
                </Show>
            </div>
        </div>
        </Show>
    )
}
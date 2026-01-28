import { useSvgDrawerContext } from "@/app/context/SvgDrawerContext";
import { Match, Switch } from "solid-js";
import { cloneSvgItem, MAX_SEAT_SPACING, MIN_SEAT_SPACING, SvgItem, SvgItemTableProps, SvgItemTableSeatFacing, SvgItemType } from "./SvgItem";
import { useI18nContext } from "@/app/context/I18nContext";
import { Bold, CopyIcon, EyeIcon, EyeOffIcon, Italic, Trash2Icon, UnlinkIcon } from "lucide-solid";
import { InspectorCategory, InspectorCategoryContent, InspectorCategoryTitle } from "./InspectorPresets";
import PropertyInput from "./PropertyInput";
import { Button } from "./UI";

interface ItemTableInspectorProps {
    item: SvgItem<SvgItemTableProps>;
}

export default function ItemTableInspector(
    props: ItemTableInspectorProps
) {
    const i18n = useI18nContext();
    const context = useSvgDrawerContext();

    function onDeleteItem() {
        context.removeItem(props.item.id);
    }

    function onDuplicateItem() {
        const clone = cloneSvgItem(props.item);
        clone.x += 10;
        clone.y += 10;

        context.addItem(clone.id, clone);
        context.setFocusedItemIndex(clone.id);
    }

    function onReleaseAllSeats() {
        const seatedGuests = context.seats.filter(o => o.table_id === props.item.id);
        for(const seated of seatedGuests) {
            context.unseatGuest(seated.guest_id);
        }
    }

    function onSeatVisibilityToggle() {
        context.modifyItem(props.item.id, {
            props: {
                show_unseated: !props.item.props.show_unseated
            }
        })
    }

    function onSeatsUpdate(value: number) {
        context.modifyItem(props.item.id, {
            props: {
                preferred_seats: value
            }
        }, false);
    }

    function onSpacingUpdate(value: number) {
        context.modifyItem(props.item.id, {
            props: {
                seat_spacing: value
            }
        });
    }

    return (
        <>
            <InspectorCategory>
                <InspectorCategoryContent>
                    <PropertyInput
                        title="prop_name"
                        type="string"
                        placeholder="Np. Stół państwa młodych"
                        value={[
                            props.item.props.name,
                            value => context.modifyItem(props.item.id, { props: { name: value }})
                        ]}
                    />

                    <PropertyInput
                        title="Ilość miejsc"
                        type="number"
                        is_int={true}
                        theme="standout"
                        min={0}
                        value={[
                            props.item.props.seats,
                            value => onSeatsUpdate(value)
                        ]}
                    />

                    <PropertyInput
                        title="Rozstaw miejsc"
                        type="number"
                        theme="slider"
                        min={MIN_SEAT_SPACING}
                        max={MAX_SEAT_SPACING}
                        value={[
                            props.item.props.seat_spacing,
                            value => onSpacingUpdate(value)
                        ]}
                    />
                </InspectorCategoryContent>
            </InspectorCategory>
            <InspectorCategory>
                <InspectorCategoryTitle>
                    Wymiary
                </InspectorCategoryTitle>
                <InspectorCategoryContent>
                    <div class="grid grid-cols-2 gap-3">
                        <PropertyInput
                            title="prop_x"
                            type="number"
                            value={[props.item.x, (value) => context.modifyItem(props.item.id, { x: value }) ]}
                        />
                        <PropertyInput
                            title="prop_y"
                            type="number"
                            value={[props.item.y, (value) => context.modifyItem(props.item.id, { y: value }) ]}
                        />
                    </div>
                    
                    <Switch>
                        <Match when={props.item.kind === SvgItemType.TABLE_CIRCLE}>
                            <PropertyInput
                                title="prop_radius"
                                type="number"
                                min={1}
                                // @ts-ignore
                                value={[props.item.w / 2, (value) => context.modifyItem(props.item.id, { w: value * 2 })]}
                            />
                        </Match>
                        <Match when={true}>
                            <div class="grid grid-cols-2 gap-3">
                                <PropertyInput 
                                    title="prop_width"
                                    type="number"
                                    min={64}
                                    value={[props.item.w, (value) => context.modifyItem(props.item.id, { w: value }) ]}
                                />
                                <PropertyInput 
                                    title="prop_height"
                                    type="number"
                                    min={64}
                                    value={[props.item.h, (value) => context.modifyItem(props.item.id, { h: value }) ]}
                                />
                            </div>
                        </Match>
                    </Switch>

                    <Switch>
                        <Match when={props.item.kind === SvgItemType.TABLE_U}>
                            <div class="grid grid-cols-2 gap-3">
                                <PropertyInput 
                                    title="Szerokość ramion"
                                    type="number"
                                    min={32}
                                    // @ts-ignore
                                    value={[props.item.props.arms_width, (value) => context.modifyItem(props.item.id, { props: { arms_width: value } }) ]}
                                />
                                <PropertyInput 
                                    title="Szerokość dołu"
                                    type="number"
                                    min={32}
                                    // @ts-ignore
                                    value={[props.item.props.bottom_height, (value) => context.modifyItem(props.item.id, { props: { bottom_height: value } }) ]}
                                />
                            </div>
                        </Match>
                        <Match when={props.item.kind === SvgItemType.TABLE_T}>
                            <div class="grid grid-cols-2 gap-3">
                                <PropertyInput 
                                    title="Szerokość góry"
                                    type="number"
                                    min={32}
                                    // @ts-ignore
                                    value={[props.item.props.top_height, (value) => context.modifyItem(props.item.id, { props: { top_height: value } }) ]}
                                />
                                <PropertyInput 
                                    title="Szerokość dołu"
                                    type="number"
                                    min={32}
                                    // @ts-ignore
                                    value={[props.item.props.middle_width, (value) => context.modifyItem(props.item.id, { props: { middle_width: value } }) ]}
                                />
                            </div>
                        </Match>
                    </Switch>
                    
                    <PropertyInput 
                        title="prop_angle"
                        type="number"
                        is_int={true}
                        value={[props.item.angle, (value) => context.modifyItem(props.item.id, { angle: value }) ]}
                    />
                </InspectorCategoryContent>
            </InspectorCategory>
            <InspectorCategory>
                <InspectorCategoryTitle>
                    Wygląd
                </InspectorCategoryTitle>
                
                <div class="flex gap-2 items-end">
                    <PropertyInput
                        class="grow"

                        title="Rozmiar i styl nazwy"
                        type="number"
                        min={8}
                        value={[
                            props.item.props.name_font_size,
                            value => context.modifyItem(props.item.id, { props: { name_font_size: value }})
                        ]}
                    />

                    <Button 
                        class="h-9.5 text-foreground-muted"
                        classList={{
                            "text-foreground!": props.item.props.name_bold
                        }}
                        onClick={() => {
                            context.modifyItem(props.item.id, {
                                props: {
                                    name_bold: !props.item.props.name_bold
                                }
                            });
                        }}
                    >
                        <Bold height={18} width={18} />
                    </Button>

                    <Button 
                        class="h-9.5 text-foreground-muted"
                        classList={{
                            "text-foreground!": props.item.props.name_italic
                        }}
                        onClick={() => {
                            context.modifyItem(props.item.id, {
                                props: {
                                    name_italic: !props.item.props.name_italic
                                }
                            });
                        }}
                    >
                        <Italic height={18} width={18} />
                    </Button>
                </div>
                

                <PropertyInput
                    title="Grubość ramki"
                    type="number"
                    min={0}
                    value={[
                        props.item.props.border_width,
                        value => context.modifyItem(props.item.id, { props: { border_width: value }})
                    ]}
                />

                <div class="flex flex-col gap-1">
                    <label class="text-xs pl-1 italic text-foreground-muted">
                        Orientacja krzeseł
                    </label>
                    <div class="flex gap-2">
                        <Button 
                            class="flex-1 h-9.5 text-foreground-muted"
                            classList={{
                                "text-foreground!": props.item.props.seat_facing === SvgItemTableSeatFacing.TABLE
                            }}
                            onClick={() => {
                                context.modifyItem(props.item.id, {
                                    props: {
                                        seat_facing: SvgItemTableSeatFacing.TABLE
                                    }
                                });
                            }}
                        >
                            Stół
                        </Button>
                        <Button 
                            class="flex-1 h-9.5 text-foreground-muted"
                            classList={{
                                "text-foreground!": props.item.props.seat_facing === SvgItemTableSeatFacing.USER
                            }}
                            onClick={() => {
                                context.modifyItem(props.item.id, {
                                    props: {
                                        seat_facing: SvgItemTableSeatFacing.USER
                                    }
                                });
                            }}
                        >
                            Użytkownik
                        </Button>
                    </div>
                </div>

                <PropertyInput
                    title="Kolor stołu"
                    type="color"
                    value={[
                        props.item.props.color,
                        value => context.modifyItem(props.item.id, { props: { color: value }})
                    ]}
                />

                <PropertyInput
                    title="Kolor ramki"
                    type="color"
                    value={[
                        props.item.props.border_color,
                        value => context.modifyItem(props.item.id, { props: { border_color: value }})
                    ]}
                />

                <PropertyInput
                    title="Kolor nazwy"
                    type="color"
                    value={[
                        props.item.props.name_color,
                        value => context.modifyItem(props.item.id, { props: { name_color: value }})
                    ]}
                />
            </InspectorCategory>
            <div class="grow"></div>
            <div class="grid grid-cols-2 gap-2 pt-4 border-t border-border border-dashed">
                <button 
                    class="col-span-2 bg-primary-soft py-2 rounded-sm text-sm text-foreground border border-border flex items-center justify-center gap-2 cursor-pointer"
                    on:click={() => onSeatVisibilityToggle()}
                >
                    <Switch>
                        <Match when={props.item.props.show_unseated}>
                            <EyeOffIcon stroke-width={1.5} height={20} width="auto" />
                            <p>Ukryj nieprzypisane krzesła</p>
                        </Match>
                        <Match when={!props.item.props.show_unseated}>
                            <EyeIcon stroke-width={1.5} height={20} width="auto" />
                            <p>Pokaż nieprzypisane krzesła</p>
                        </Match>
                    </Switch>
                    
                </button>
                <button 
                    class="col-span-2 bg-primary-soft py-2 rounded-sm text-sm text-foreground border border-border flex items-center justify-center gap-2 cursor-pointer"
                    on:click={() => onReleaseAllSeats()}
                >
                    <UnlinkIcon stroke-width={1.5} height={20} width="auto" />
                    <p>Zwolnij wszystkie krzesła</p>
                </button>
                <button 
                    class="bg-primary-soft py-2 rounded-sm text-sm text-foreground border border-border flex items-center justify-center gap-2 cursor-pointer"
                    on:click={() => onDuplicateItem()}
                >
                    <CopyIcon stroke-width={1.5} height={20} width="auto" />
                    <p>Duplikuj</p>
                </button>
                <button 
                    class="bg-primary-soft py-2 rounded-sm text-sm text-error border border-border flex items-center justify-center gap-2 cursor-pointer"
                    on:click={() => onDeleteItem()}
                >
                    <Trash2Icon stroke-width={1.5} height={20} width="auto" />
                    <p>Usuń</p>
                </button>
            </div>
            {/*<div class="absolute top-1 right-1 text-xs text-muted-foreground bg-white px-2 py-1">
                <p>JSON: </p>
                <div class="max-h-32 overflow-y-auto">
                    <pre>{JSON.stringify(props.item, null, 2)}</pre>
                </div>
            </div>*/}
        </>
    );
}
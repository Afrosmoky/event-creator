import { useSvgDrawerContext } from "@/app/context/SvgDrawerContext";
import { cloneSvgItem, SvgItem, SvgItemIconProps } from "./SvgItem";
import { useI18nContext } from "@/app/context/I18nContext";
import { InspectorCategory, InspectorCategoryContent, InspectorCategoryTitle, InspectorContent, InspectorHead, InspectorTitle } from "./InspectorPresets";
import PropertyInput from "./PropertyInput";
import { CopyIcon, EyeIcon, EyeOffIcon, Trash2Icon } from "lucide-solid";
import { Match, Switch } from "solid-js";

interface ItemIconInspectorProps {
    item: SvgItem<SvgItemIconProps>;
}

export default function ItemIconInspector(
    props: ItemIconInspectorProps
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

    function onPositionLockToggle() {
        context.modifyItem(props.item.id, {
            position_locked: !props.item.position_locked
        })
    }

    return (
        <>
            <InspectorContent>
                <InspectorCategory>
                    <InspectorCategoryContent>
                        <PropertyInput
                            title="prop_name"
                            type="string"
                            placeholder="Np. Wentlacja, Mikrofon..."
                            value={[
                                props.item.props.label,
                                value => context.modifyItem(props.item.id, { props: { label: value }})
                            ]}
                        />
                        <PropertyInput
                            title="Ikona"
                            type="icon"
                            value={[
                                props.item.props.icon,
                                value => context.modifyItem(props.item.id, { props: { icon: value }})
                            ]}
                        />
                    </InspectorCategoryContent>
                </InspectorCategory>
                <InspectorCategory>
                    <InspectorCategoryTitle>
                        Wymiary
                    </InspectorCategoryTitle>
                    <InspectorCategoryContent>
                        {/*<div class="grid grid-cols-2 gap-3">
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
                        </div>*/}

                        <PropertyInput 
                                title="prop_width"
                                type="number"
                                min={64}
                                value={[props.item.w, (value) => context.modifyItem(props.item.id, { w: value }) ]}
                            />
                        
                        <PropertyInput 
                            title="prop_angle"
                            type="number"
                            is_int={true}
                            value={[props.item.angle, (value) => context.modifyItem(props.item.id, { angle: value }) ]}
                        />
                        
                    </InspectorCategoryContent>
                </InspectorCategory>
            </InspectorContent>
            <div class="flex flex-col gap-2 justify-end pt-4 border-t border-border border-dashed">
                <button 
                    class="col-span-2 bg-primary-soft py-2 rounded-sm text-sm text-foreground border border-border flex items-center justify-center gap-2 cursor-pointer"
                    on:click={() => onPositionLockToggle()}
                >
                    <Switch>
                        <Match when={props.item.position_locked}>
                            <EyeOffIcon stroke-width={1.5} height={20} width="auto" />
                            <p>Odblokuj ikonę</p>
                        </Match>
                        <Match when={!props.item.position_locked}>
                            <EyeIcon stroke-width={1.5} height={20} width="auto" />
                            <p>Zablokuj ikonę</p>
                        </Match>
                    </Switch>
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
        </>
    );
}
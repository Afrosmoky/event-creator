import { useSvgDrawerContext } from "@/app/context/SvgDrawerContext";
import { cloneSvgItem, SvgItem, SvgItemAreaProps, SvgItemIconProps } from "./SvgItem";
import { useI18nContext } from "@/app/context/I18nContext";
import { InspectorCategory, InspectorCategoryContent, InspectorCategoryTitle, InspectorContent, InspectorHead, InspectorTitle } from "./InspectorPresets";
import PropertyInput from "./PropertyInput";
import { CopyIcon, EyeIcon, EyeOffIcon, Trash2Icon } from "lucide-solid";
import { Match, Switch } from "solid-js";

interface ItemAreaInspectorProps {
    item: SvgItem<SvgItemAreaProps>;
}

export default function ItemAreaInspector(
    props: ItemAreaInspectorProps
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
        context.setFocusedItem({ id: clone.id });
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
                            placeholder="Np. Sala weselna, Teren, Parkiet taneczny..."
                            value={[
                                props.item.props.name,
                                value => context.modifyItem(props.item.id, { props: { name: value }})
                            ]}
                        />
                    </InspectorCategoryContent>
                </InspectorCategory>
                <InspectorCategory>
                    <InspectorCategoryTitle>
                        Wymiary
                    </InspectorCategoryTitle>
                    <InspectorCategoryContent>

                        <PropertyInput 
                            title="Szerokość (m)"
                            type="number"
                            min={1}
                            value={[props.item.w / 100, (value) => context.modifyItem(props.item.id, { w: value * 100 }) ]}
                        />

                        <PropertyInput 
                            title="Wysokość (m)"
                            type="number"
                            min={1}
                            value={[props.item.h / 100, (value) => context.modifyItem(props.item.id, { h: value * 100 }) ]}
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
                            <p>Odblokuj salę</p>
                        </Match>
                        <Match when={!props.item.position_locked}>
                            <EyeIcon stroke-width={1.5} height={20} width="auto" />
                            <p>Zablokuj salę</p>
                        </Match>
                    </Switch>
                </button>
                <button 
                    class="bg-primary-soft py-2 rounded-sm text-sm text-foreground border border-border flex items-center justify-center gap-2 cursor-pointer"
                    on:click={() => onDuplicateItem()}
                >
                    <CopyIcon stroke-width={1.5} height={20} width="auto" />
                    <p>Duplikuj salę</p>
                </button>
                <button 
                    class="bg-primary-soft py-2 rounded-sm text-sm text-error border border-border flex items-center justify-center gap-2 cursor-pointer"
                    on:click={() => onDeleteItem()}
                >
                    <Trash2Icon stroke-width={1.5} height={20} width="auto" />
                    <p>Usuń salę</p>
                </button>
            </div>
        </>
    );
}
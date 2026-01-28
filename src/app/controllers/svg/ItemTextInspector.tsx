import { useSvgDrawerContext } from "@/app/context/SvgDrawerContext";
import { Match, Switch } from "solid-js";
import { cloneSvgItem, SvgItem, SvgItemTextProps, SvgItemType } from "./SvgItem";
import { useI18nContext } from "@/app/context/I18nContext";
import { Bold, CopyIcon, Italic, Trash2Icon } from "lucide-solid";
import { InspectorCategory, InspectorCategoryContent, InspectorCategoryTitle } from "./InspectorPresets";
import PropertyInput from "./PropertyInput";
import { Button } from "./UI";

interface ItemTextInspectorProps {
    item: SvgItem<SvgItemTextProps>;
}

export default function ItemTextInspector(
    props: ItemTextInspectorProps
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

        context.addItem(undefined, clone);
        context.setFocusedItemIndex(clone.id);
    }

    return (
        <>
            <InspectorCategory>
                <InspectorCategoryContent>
                    <PropertyInput
                        title="Tekst"
                        type="string"
                        multiline={true}
                        placeholder="Np. Przykładowy tekst"
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

                        title="Czcionka"
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
                    title="Kolor tekstu"
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
import { createEffect, createMemo, Match, Show, Switch } from "solid-js";
import { cloneSvgItem, isSvgItemText, SvgItem, SvgItemTableProps, SvgItemType } from "./SvgItem";
import { useSvgDrawerContext } from "@/app/context/SvgDrawerContext";
import { Inspector, InspectorContent, InspectorHead, InspectorTitle } from "./InspectorPresets";
import ItemTableInspector from "./ItemTableInspector";
import { CopyIcon, Trash2Icon } from "lucide-solid";
import ItemIconInspector from "./ItemIconInspector";
import TableSeatInspector from "./TableSeatInspector";
import ItemTextInspector from "./ItemTextInspector";

export default function DrawerInspector(
    props: unknown
) {
    const context = useSvgDrawerContext();

    const focusedItem = createMemo(() => {
        if(context.focusedItemIndex() == -1) {
            return null;
        }

        return context.items[context.focusedItemIndex()];
    });

    createEffect(() => {
        console.log(`Focused item: ${focusedItem()?.id ?? -1}`)
    })

    function isTable(item: SvgItem): item is SvgItem<SvgItemTableProps> {
        return item.kind == SvgItemType.TABLE_U
            || item.kind == SvgItemType.TABLE_T
            || item.kind == SvgItemType.TABLE_RECT
            || item.kind == SvgItemType.TABLE_CIRCLE;
    }

    function isIcon(item: SvgItem) {
        return item.kind == SvgItemType.ICON;
    }

    function isSeat(item: SvgItem) {
        return item.kind == SvgItemType.TABLE_SEAT;
    }

    return (
        <Inspector show={focusedItem() != null}>
            <InspectorHead>
                <InspectorTitle>
                    <span>
                        {
                            isTable(focusedItem()) 
                            ? "Stół " :
                            isIcon(focusedItem())
                            ? "Ikona " : 
                            isSeat(focusedItem())
                            ? "Krzesło " : 
                            isSvgItemText(focusedItem())
                            ? "Tekst " :
                            "Nieznany "
                        }
                    </span>
                    <span class="text-xs italic font-normal text-foreground-muted">
                        #{focusedItem().id}
                    </span>
                </InspectorTitle>
            </InspectorHead>
            <InspectorContent>
                <Switch>
                    <Match when={isTable(focusedItem())}>
                        <ItemTableInspector item={focusedItem() as any} />
                    </Match>
                    <Match when={isIcon(focusedItem())}>
                        <ItemIconInspector item={focusedItem() as any} />
                    </Match>
                    <Match when={isSeat(focusedItem())}>
                        <TableSeatInspector item={focusedItem() as any} />
                    </Match>
                    <Match when={isSvgItemText(focusedItem())}>
                        <ItemTextInspector item={focusedItem() as any} />
                    </Match>
                </Switch>
            </InspectorContent>
        </Inspector>  
    )
}
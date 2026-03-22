import { createEffect, createMemo, Match, Show, Switch } from "solid-js";
import { cloneSvgItem, isSvgItemText, SvgItem, SvgItemTableProps, SvgItemType } from "./SvgItem";
import { FocusedItem, useSvgDrawerContext } from "@/app/context/SvgDrawerContext";
import { Inspector, InspectorContent, InspectorHead, InspectorTitle } from "./InspectorPresets";
import ItemTableInspector from "./ItemTableInspector";
import { CopyIcon, Trash2Icon } from "lucide-solid";
import ItemIconInspector from "./ItemIconInspector";
import TableSeatInspector from "./TableSeatInspector";
import ItemTextInspector from "./ItemTextInspector";
import ItemAreaInspector from "./ItemAreaInspector";

export default function DrawerInspector(
    props: unknown
) {
    const context = useSvgDrawerContext();

    const focusedItem = createMemo(() => {
        const item = context.focusedItem();
        if(!item) return null;

        return item;
    });

    createEffect(() => {
        console.log(`Focused item: ${focusedItem()?.id ?? -1}`)
    })

    function isTable(item: FocusedItem) {
        return context.items[item.id]?.kind === SvgItemType.TABLE_U
            || context.items[item.id]?.kind === SvgItemType.TABLE_T
            || context.items[item.id]?.kind === SvgItemType.TABLE_RECT
            || context.items[item.id]?.kind === SvgItemType.TABLE_CIRCLE;
    }

    function isArea(item: FocusedItem) {
        return context.items[item.id]?.kind === SvgItemType.AREA;
    }

    function isSeat(item: FocusedItem) {
        return isTable(item) && item.props?.inspectSeat !== undefined;
    }

    function isIcon(item: FocusedItem) {
        return context.items[item.id]?.kind === SvgItemType.ICON;
    }

    function isText(item: FocusedItem) {
        return context.items[item.id]?.kind === SvgItemType.TEXT;
    }

    return (
        <Inspector show={focusedItem() != null}>
            <InspectorHead>
                <InspectorTitle>
                    <span>
                        {
                            isSeat(focusedItem())
                            ? `Krzesło ${(focusedItem().props?.inspectSeat ?? 0) + 1} ` : 
                            isTable(focusedItem()) 
                            ? "Stół " :
                            isIcon(focusedItem())
                            ? "Ikona " : 
                            isText(focusedItem())
                            ? "Tekst " :
                            isArea(focusedItem())
                            ? "Sala " :
                            "Nieznany "
                        }
                    </span>
                    <span class="text-xs italic font-normal text-foreground-muted">
                        {
                            isSeat(focusedItem()) 
                            ? `Stół #${focusedItem()?.id ?? ""}`
                            : `#${focusedItem()?.id ?? ""}`
                        }
                    </span>
                </InspectorTitle>
            </InspectorHead>
            <InspectorContent>
                <Switch>
                    <Match when={isSeat(focusedItem())}>
                        <TableSeatInspector table={context.items[focusedItem().id] as any} index={focusedItem().props?.inspectSeat} />
                    </Match>
                    <Match when={isTable(focusedItem())}>
                        <ItemTableInspector item={context.items[focusedItem().id] as any} />
                    </Match>
                    <Match when={isIcon(focusedItem())}>
                        <ItemIconInspector item={context.items[focusedItem().id] as any} />
                    </Match>
                    <Match when={isText(focusedItem())}>
                        <ItemTextInspector item={context.items[focusedItem().id] as any} />
                    </Match>
                    <Match when={isArea(focusedItem())}>
                        <ItemAreaInspector item={context.items[focusedItem().id] as any} />
                    </Match>
                </Switch>
            </InspectorContent>
        </Inspector>  
    )
}
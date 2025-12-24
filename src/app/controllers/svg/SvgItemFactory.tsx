import { createSignal, Match, Switch } from "solid-js";
import type { SvgItem } from "./SvgItem";
import { SvgItemTable } from "./SvgItemTable";
import { useSvgDrawerContext } from "@/app/context/SvgDrawerContext";
import { SvgItemIcon } from "./SvgItemIcon";
import { SvgItemTableCircle } from "./SvgItemTableCircle";

export interface SvgItemFactoryProps {
    item: SvgItem<any>;
}

export function SvgItemFactory(
    props: SvgItemFactoryProps
) {
    const context = useSvgDrawerContext();

    let [lastMouseX, setLastMouseX] = createSignal(0);
    let [lastMouseY, setLastMouseY] = createSignal(0);

    function onContainerPointerDown(e: PointerEvent) {
        const target = e.target as SVGGElement;

        e.stopPropagation();
        e.preventDefault();
        target.setPointerCapture(e.pointerId);

        setLastMouseX(e.clientX);
        setLastMouseY(e.clientY);

        context.setFocusedItemIndex(props.item.id);
    }

    function onContainerPointerMove(e: PointerEvent) {
        const target = e.target as SVGGElement;
        if (!target.hasPointerCapture(e.pointerId)) return;

        const deltaX = (e.clientX - lastMouseX()) / context.zoom();
        const deltaY = (e.clientY - lastMouseY()) / context.zoom();

        const isInContext = context.items[props.item.id];
        if(!isInContext) {
            console.warn(`Can't find object`)
            return;
        }

        context.modifyItem(props.item.id, {
            x: props.item.x + deltaX,
            y: props.item.y + deltaY
        });

        setLastMouseX(e.clientX);
        setLastMouseY(e.clientY);
    }

    function onContainerPointerUp(e: PointerEvent) {
        const target = e.target as SVGGElement;
        target.releasePointerCapture(e.pointerId);
    }

    function onFocus(e: FocusEvent) {
        e.stopPropagation();
        context.setFocusedItemIndex(props.item.id);
    }

    return (
        <g
            transform={`
                translate(${props.item.x - props.item.w / 2} ${props.item.y - props.item.h / 2}),
                rotate(${props.item.angle} ${props.item.w / 2} ${props.item.h / 2})
            `}
           
            tabIndex={0}
            on:focusin={onFocus}
            on:pointerdown={onContainerPointerDown}
            on:pointermove={onContainerPointerMove}
            on:pointerup={onContainerPointerUp}
        >
            <g
                transform={``}
            >
                <Switch>
                    <Match when={props.item.kind === "TABLE_RECT" || props.item.kind === "TABLE_T" || props.item.kind === "TABLE_U"}>
                        <SvgItemTable item={props.item}/>
                    </Match>
                    <Match when={props.item.kind === "TABLE_CIRCLE" }>
                        <SvgItemTableCircle item={props.item} />
                    </Match>
                    <Match when={props.item.kind === "ICON"}>
                        <SvgItemIcon item={props.item}/>
                    </Match>
                    <Match when={true}>
                        <div>Unknown item kind</div>
                    </Match>
                </Switch>
            </g>
        </g>
    )
}
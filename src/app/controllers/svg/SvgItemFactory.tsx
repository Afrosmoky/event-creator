import { batch, createEffect, createSignal, Match, Switch, untrack } from "solid-js";
import { SEAT_RADIUS, SvgItemType, type SvgItem } from "./SvgItem";
import { SvgItemTable } from "./SvgItemTable";
import { useSvgDrawerContext } from "@/app/context/SvgDrawerContext";
import { SvgItemIcon } from "./SvgItemIcon";
import { SvgItemTableCircle } from "./SvgItemTableCircle";
import { SvgItemTableSeat } from "./SvgItemTableSeat";
import { SvgItemText } from "./SvgItemText";

export interface SvgItemFactoryProps {
    item: SvgItem<any>;
}

export function SvgItemFactory(
    props: SvgItemFactoryProps
) {
    const context = useSvgDrawerContext();

    let [lastMouseX, setLastMouseX] = createSignal(0);
    let [lastMouseY, setLastMouseY] = createSignal(0);

    if(props.item.kind != SvgItemType.TABLE_SEAT) {
        createEffect(() => {
            context.canvasWidth();
            context.canvasHeight();

            const totalWidth = props.item.w + SEAT_RADIUS * 2 + 8;
            const totalHeight = props.item.h + SEAT_RADIUS * 2 + 8;

            const xMin = props.item.x - totalWidth / 2;
            const xMax = props.item.x + totalWidth / 2;
            const yMin = props.item.y - totalHeight / 2;
            const yMax = props.item.y + totalHeight / 2;

            untrack(() => {
                batch(() => {
                    if(totalWidth > context.canvasWidth()) {
                        console.warn(`Item is wider than canvas! Resizing canvas width to fit the item.`);
                        context.modifyItem(
                            props.item.id,
                            {
                                w: context.canvasWidth() - SEAT_RADIUS * 2 - 8
                            }
                        );
                    } else {
                        if(xMin < 0) {
                            console.warn(`Item is out of canvas bounds on the left! Moving it to the right.`);
                            context.modifyItem(props.item.id, { x: totalWidth / 2 });
                        } else if(xMax > context.canvasWidth()) {
                            console.warn(`Item is out of canvas bounds on the right! Moving it to the left.`);
                            context.modifyItem(props.item.id, { x: context.canvasWidth() - totalWidth / 2 });
                        }
                    }

                    if(totalHeight > context.canvasHeight()) {
                        console.warn(`Item is taller than canvas! Resizing canvas height to fit the item.`);
                        context.modifyItem(
                            props.item.id,
                            {
                                h: context.canvasHeight() - SEAT_RADIUS * 2 - 8
                            }
                        );
                    } else {
                        if(yMin < 0) {
                            console.warn(`Item is out of canvas bounds on the top! Moving it down.`);
                            context.modifyItem(props.item.id, { y: totalHeight / 2 });
                        } else if(yMax > context.canvasHeight()) {
                            console.warn(`Item is out of canvas bounds on the bottom! Moving it up.`);
                            context.modifyItem(props.item.id, { y: context.canvasHeight() - totalHeight / 2 });
                        }
                    }
                });
            });
        })
    }

    function onContainerPointerDown(e: PointerEvent) {
        e.stopPropagation();
        e.preventDefault();

        context.setFocusedItemIndex(props.item.id);
        if(props.item.position_locked) {
            console.warn(`Item is position locked!`);
            return;
        }

        const target = e.target as SVGGElement;
        target.setPointerCapture(e.pointerId);

        setLastMouseX(e.clientX);
        setLastMouseY(e.clientY);
    }

    function onContainerPointerMove(e: PointerEvent) {
        if(props.item.position_locked) {
            return;
        }

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

    return (
        <g
            transform={`
                translate(${props.item.x - props.item.w / 2} ${props.item.y - props.item.h / 2}),
                rotate(${props.item.angle} ${props.item.w / 2} ${props.item.h / 2})
            `}
           
            tabIndex={0}
            on:pointerdown={onContainerPointerDown}
            on:pointermove={onContainerPointerMove}
            on:pointerup={onContainerPointerUp}
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
                <Match when={props.item.kind == SvgItemType.TABLE_SEAT}>
                    <SvgItemTableSeat item={props.item}/>
                </Match>
                <Match when={props.item.kind === SvgItemType.TEXT}>
                    <SvgItemText item={props.item} />
                </Match>
                <Match when={true}>
                    <div>Unknown item kind</div>
                </Match>
            </Switch>
        </g>
    )
}
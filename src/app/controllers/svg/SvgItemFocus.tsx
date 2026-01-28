import { ArrowDownIcon, ArrowRightIcon, RotateCw } from "lucide-solid";
import { isSvgItemTableCircle, SvgItemType, type SvgItem } from "./SvgItem";
import { createMemo, Match, Show, Switch } from "solid-js";
import { useSvgDrawerContext } from "@/app/context/SvgDrawerContext";

interface PaddingType {
    l: number,
    r: number,
    t: number,
    b: number
}

interface SvgItemInspectorComponentProps {
    item: SvgItem
    padding?: PaddingType
}

export function SvgItemFocus(
    props: SvgItemInspectorComponentProps
) {
    const context = useSvgDrawerContext();

    const x = createMemo(() => 0);
    const y = createMemo(() => 0);
    const width = createMemo(() => props.item.w);
    const height = createMemo(() => props.item.h);

    function onResizeHandlePointerDown(e: PointerEvent) {
        const target = e.target as SVGCircleElement;

        e.stopPropagation();
        e.preventDefault();
        target.setPointerCapture(e.pointerId);
    }

    function onResizeHandlePointerMove(e: PointerEvent, type: "W" | "H") {
        const target = e.target as SVGCircleElement;
        if (!target.hasPointerCapture(e.pointerId)) return;

        e.stopPropagation();

        const worldX = e.clientX - context.clientWidth() / 2 - context.panX();
        const worldY = e.clientY - context.clientHeight() / 2 - context.panY();

        const zoom = context.zoom();

        const px = worldX / zoom;
        const py = worldY / zoom;

        const dx = px - props.item.x;
        const dy = py - props.item.y;

        // undo rotation
        const angle = -props.item.angle * Math.PI / 180;
        const cos = Math.cos(angle);
        const sin = Math.sin(angle);

        const localX = dx * cos - dy * sin;
        const localY = dx * sin + dy * cos;

        let newW = props.item.w;
        let newH = props.item.h;

        if (type === "W") {
            newW = Math.max(1, Math.floor(Math.abs(localX) * 2));
        }

        if (type === "H") {
            newH = Math.max(1, Math.floor(Math.abs(localY) * 2));
        }

        if (newW !== props.item.w || newH !== props.item.h) {
            context.modifyItem(props.item.id, {
                w: newW,
                h: newH
            });
        }
    }

    function onResizeHandlePointerUp(e: PointerEvent) {
        const target = e.target as SVGCircleElement;

        e.stopPropagation();
        target.releasePointerCapture(e.pointerId);
    }

    function onRotateHandlePointerDown(e: PointerEvent) {
        const target = e.target as SVGCircleElement;

        e.stopPropagation();
        e.preventDefault();
        target.setPointerCapture(e.pointerId);
    }

    function onRotateHandlePointerMove(e: PointerEvent, offsetAngle: number) {
        const target = e.target as SVGCircleElement;
        if (!target.hasPointerCapture(e.pointerId)) return;

        e.stopPropagation();

        const worldX = e.clientX - context.clientWidth() / 2 - context.panX();
        const worldY = e.clientY - context.clientHeight() / 2 - context.panY();

        const zoom = context.zoom();

        const px = worldX / zoom;
        const py = worldY / zoom;

        const dx = px - props.item.x;
        const dy = py - props.item.y;

        const angle = Math.floor(Math.atan2(dy, dx) * 180 / Math.PI + offsetAngle);
        if(angle != props.item.angle) {
            context.modifyItem(props.item.id, {
                angle: angle
            })
        }
    }

    function onRotateHandlePointerUp(e: PointerEvent) {
        const target = e.target as SVGCircleElement;

        e.stopPropagation();
        target.releasePointerCapture(e.pointerId);
    }

    const ControlResizePoint = (
        props: { x: number, y: number, type: "W" | "H" }
    ) => {
        return (
            <>
                <circle 
                    cx={props.x} 
                    cy={props.y} 
                    r={12}
                    fill="var(--color-accent)"
                    stroke="var(--color-white)"
                    stroke-width="2"
                    style={{ cursor: "e-resize" }}
                    on:pointerdown={onResizeHandlePointerDown}
                    on:pointermove={(e) => onResizeHandlePointerMove(e, props.type)}
                    on:pointerup={onResizeHandlePointerUp}
                />
                <Switch>
                    <Match when={props.type === "W"}>
                        <ArrowRightIcon x={props.x - 8} y={props.y - 8} width={16} height={16} stroke="white" pointer-events="none" />
                    </Match>
                    <Match when={props.type === "H"}>
                        <ArrowDownIcon x={props.x - 8} y={props.y - 8} width={16} height={16} stroke="white" pointer-events="none" />
                    </Match>
                </Switch>
                
            </>
        );
    }

    const ControlRotatePoint = (
        props2: { x: number, y: number }
    ) => {
        
        const dx = props2.x - props.item.w / 2;
        const dy = props2.y + props.item.h / 2;
        const offsetAngle = Math.atan2(dy, dx) * 180 / Math.PI

        console.log(`D ${dx} ${dy}`)
        console.log(`Angle ${offsetAngle}`)

        return (
            <>
                <circle 
                    cx={props2.x} 
                    cy={props2.y} 
                    r={12}
                    fill="var(--color-accent)"
                    stroke="var(--color-white)"
                    stroke-width="2"
                    style={{ cursor: "pointer" }}
                    on:pointerdown={onRotateHandlePointerDown}
                    on:pointermove={(e) => onRotateHandlePointerMove(e, offsetAngle)}
                    on:pointerup={onRotateHandlePointerUp}
                />
                <circle 
                    cx={props2.x} 
                    cy={props2.y} 
                    r={4}
                    fill="var(--color-white)"
                    style={{ cursor: "pointer" }}
                    on:pointerdown={onRotateHandlePointerDown}
                    on:pointermove={(e) => onRotateHandlePointerMove(e, offsetAngle)}
                    on:pointerup={onRotateHandlePointerUp}
                />
            </>
        );
    }

    return(
        <g
            transform={`
                translate(${props.item.parent?.x || 0} ${props.item.parent?.y || 0})
                translate(${props.item.x - props.item.w / 2} ${props.item.y - props.item.h / 2})
                rotate(${props.item.angle} ${props.item.w / 2} ${props.item.h / 2})
                rotate(${props.item.parent?.angle || 0} ${props.item.w / 2 - props.item.x} ${props.item.h / 2 - props.item.y})
            `}
            class="pointer-events-auto"
        >
            <Switch>
                <Match when={props.item.kind == SvgItemType.TABLE_SEAT}>
                    <circle
                        cx={props.item.props.radius}
                        cy={props.item.props.radius}
                        r={props.item.props.radius * 1.2}
                        fill="none"
                        stroke="var(--color-accent)"
                        stroke-width="2"
                        stroke-dasharray="6 4"
                    >
                        <animate
                            attributeName="stroke-dashoffset"
                            from="20"
                            to="0"
                            dur="1s"
                            repeatCount="indefinite"
                        />
                    </circle>
                </Match>
                <Match when={props.item.kind == SvgItemType.TABLE_CIRCLE}>
                    <circle
                        cx={props.item.w / 2}
                        cy={props.item.w / 2}
                        r={props.item.w / 2}
                        fill="none"
                        stroke="var(--color-accent)"
                        stroke-width="2"
                        stroke-dasharray="6 4"
                    >
                    </circle>
                </Match>
                <Match when={true}>
                    <rect
                        x={x()}
                        y={y()}
                        width={width()}
                        height={height()}
                        fill="none"
                        stroke="var(--color-accent)"
                        stroke-width="2"
                        stroke-dasharray="6 4"
                    >
                        <animate
                            attributeName="stroke-dashoffset"
                            from="20"
                            to="0"
                            dur="1s"
                            repeatCount="indefinite"
                        />
                    </rect>
                </Match>
            </Switch>
            

            <Show when={props.item.kind != SvgItemType.TABLE_SEAT}>
                <Show when={props.item.kind != SvgItemType.TEXT}>
                    <ControlResizePoint 
                        x={x() + width()}
                        y={y() + height() / 2}
                        type="W"
                    />
                </Show>

                <Show when={props.item.kind == SvgItemType.TABLE_CIRCLE}>
                    <ControlRotatePoint
                        x={x() + width() / 2}
                        y={y()}
                    />
                </Show>

                <Show when={props.item.kind != SvgItemType.TABLE_CIRCLE}>
                    <ControlRotatePoint
                        x={x()}
                        y={y()}
                    />
                </Show>

                <Show when={props.item.kind != SvgItemType.TABLE_CIRCLE && props.item.kind != SvgItemType.ICON && props.item.kind != SvgItemType.TEXT}>
                    <ControlResizePoint
                        x={x() + width() / 2}
                        y={y() + height()}
                        type="H"
                    />
                </Show>
            </Show>
        </g>
    )
}
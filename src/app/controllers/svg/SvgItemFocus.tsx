import { RotateCw } from "lucide-solid";
import { SvgItemType, type SvgItem } from "./SvgItem";
import { createMemo, Match, Show, Switch } from "solid-js";
import { createStore } from "solid-js/store";
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

    let lastMouseX = 0, lastMouseY = 0;

    function onResizeHandlePointerDown(e: PointerEvent) {
        const target = e.target as SVGCircleElement;

        e.stopPropagation();
        e.preventDefault();
        target.setPointerCapture(e.pointerId);

        lastMouseX = e.clientX;
        lastMouseY = e.clientY;
    }

    function onResizeTableCircle() {

    }

    function onResizeHandlePointerMove(e: PointerEvent, type: "LT" | "RT" | "LB" | "RB") {
        const target = e.target as SVGCircleElement;
        if (!target.hasPointerCapture(e.pointerId)) return;

        e.stopPropagation();

        const deltaX = (e.clientX - lastMouseX) / context.zoom();
        const deltaY = -(e.clientY - lastMouseY) / context.zoom();

        if(deltaX == 0 && deltaY == 0) {
            return;
        }

        const rad = props.item.angle * Math.PI / 180;
        const cos = Math.cos(rad);
        const sin = Math.sin(rad);

        const isInContext = context.items[props.item.id];
        if(!isInContext) {
            console.warn(`Can't find object`)
            return;
        }

        const rx = cos * deltaX - sin * deltaY;
        const ry = sin * deltaX + cos * deltaY;

        let deltaWidth = rx;
        let deltaHeight = ry;

        let finalWidth: number;
        let finalHeight: number;

        if(type == "RT" || type == "RB") {
            finalWidth = props.item.w + deltaWidth;
        } else {
            finalWidth = props.item.w - deltaWidth;
        }

        if(type == "RT" || type == "LT") {
            finalHeight = props.item.h + deltaHeight;
        } else {
            finalHeight = props.item.h - deltaHeight;
        }

        const minWidth = 64;
        const minHeight = 64;

        if(finalWidth >= minWidth && finalHeight >= minHeight) {
            if(props.item.kind === SvgItemType.TABLE_CIRCLE) {
                const radius = Math.max(finalWidth, finalHeight);

                context.modifyItem(props.item.id, {
                    x: props.item.x + deltaX / 2,
                    y: props.item.y - deltaY / 2,
                    w: radius,
                    h: radius
                });
            } else {
                context.modifyItem(props.item.id, {
                    x: props.item.x + deltaX / 2,
                    y: props.item.y - deltaY / 2,
                    w: finalWidth,
                    h: finalHeight
                });
            }
        }

        lastMouseX = e.clientX;
        lastMouseY = e.clientY;
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

        lastMouseX = e.clientX;
    }

    function onRotateHandlePointerMove(e: PointerEvent) {
        const target = e.target as SVGCircleElement;
        if (!target.hasPointerCapture(e.pointerId)) return;

        e.stopPropagation();

        const deltaX = e.clientX - lastMouseX;
        const newAngle = Math.floor(props.item.angle + deltaX * 0.25);
        if(newAngle === props.item.angle) {
            return;
        }

        const isInContext = context.items[props.item.id];
        if(!isInContext) {
            console.warn(`Can't find object`)
            return;
        }
        
        context.modifyItem(props.item.id, {
            angle: newAngle
        });
        lastMouseX = e.clientX;

        console.log("Rotate handle pointer move");
    }

    function onRotateHandlePointerUp(e: PointerEvent) {
        const target = e.target as SVGCircleElement;

        e.stopPropagation();
        target.releasePointerCapture(e.pointerId);
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
                <Match when={false}>
                    <circle
                        cx={props.item.props.radius}
                        cy={props.item.props.radius}
                        r={props.item.props.radius}
                        fill="none"
                        stroke="var(--color-accent)"
                        stroke-width="4"
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
                {/* Control point for resize, using circle svg element */}
                <circle 
                    cx={x() + width()} 
                    cy={y()} 
                    r={5}
                    fill="var(--color-white)"
                    stroke="var(--color-accent)"
                    stroke-width="1"
                    style={{ cursor: "ne-resize" }}
                    on:pointerdown={onResizeHandlePointerDown}
                    on:pointermove={(e) => onResizeHandlePointerMove(e, "RT")}
                    on:pointerup={onResizeHandlePointerUp}
                />

                {/* Control point for resize, using circle svg element */}
                <circle 
                    cx={x()} 
                    cy={y()} 
                    r={5}
                    fill="var(--color-white)"
                    stroke="var(--color-accent)"
                    stroke-width="1"
                    style={{ cursor: 'nw-resize' }}
                    on:pointerdown={onResizeHandlePointerDown}
                    on:pointermove={(e) => onResizeHandlePointerMove(e, "LT")}
                    on:pointerup={onResizeHandlePointerUp}
                />

                {/* Control point for resize, using circle svg element */}
                <circle 
                    cx={x()} 
                    cy={y() + height()} 
                    r={5}
                    fill="var(--color-white)"
                    stroke="var(--color-accent)"
                    stroke-width="1"
                    style={{ cursor: 'sw-resize' }}
                    on:pointerdown={onResizeHandlePointerDown}
                    on:pointermove={(e) => onResizeHandlePointerMove(e, "LB")}
                    on:pointerup={onResizeHandlePointerUp}
                />

                {/* Control point for resize, using circle svg element */}
                <circle 
                    cx={x() + width()} 
                    cy={y() + height()} 
                    r={5}
                    fill="var(--color-white)"
                    stroke="var(--color-accent)"
                    stroke-width="1"
                    style={{ cursor: 'se-resize' }}
                    on:pointerdown={onResizeHandlePointerDown}
                    on:pointermove={(e) => onResizeHandlePointerMove(e, "RB")}
                    on:pointerup={onResizeHandlePointerUp}
                />

                <line
                    x1={x() + width() / 2}
                    y1={y()}
                    x2={x() + width() / 2}
                    y2={y() - 16}
                    stroke="gray"
                    stroke-width="1"
                />

                {/* Rotate handle */}
                <g
                    
                    on:pointerdown={onRotateHandlePointerDown}
                    on:pointermove={onRotateHandlePointerMove}
                    on:pointerup={onRotateHandlePointerUp}
                >

                    {/* invisible hit area */}
                    <rect
                        x={x() + width() / 2 - 16 / context.zoom()}
                        y={y() - 24 - 16 / context.zoom()}
                        width={32 / context.zoom()}
                        height={32 / context.zoom()}
                        fill="transparent"
                        style={{ cursor: 'grab' }}
                        pointer-events="all"
                    />

                    <RotateCw
                        x={x() + width() / 2 - 6 / context.zoom()}
                        y={y() - 24 - 6 / context.zoom()}
                        width={12 / context.zoom()}
                        height={12 / context.zoom()}

                        stroke="gray"
                        stroke-width="3"
                        
                        pointer-events="none"
                        
                    />
                </g>
            </Show>
        </g>
    )
}
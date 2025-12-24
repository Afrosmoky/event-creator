import { RotateCw } from "lucide-solid";
import type { SvgItem } from "./SvgItem";
import { createMemo } from "solid-js";
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

export function SvgItemInspector(
    props: SvgItemInspectorComponentProps
) {
    const context = useSvgDrawerContext();
    const padding = createMemo(() => ({
        l: props.item.props?.seat_radius ?? 0,
        r: props.item.props?.seat_radius ?? 0,
        t: props.item.props?.seat_radius ?? 0,
        b: props.item.props?.seat_radius ?? 0
    }));

    const x = createMemo(() => -padding().l * 3);
    const y = createMemo(() => -padding().t * 3);
    const width = createMemo(() => props.item.w + padding().l * 3 + padding().r * 3);
    const height = createMemo(() => props.item.h + padding().t * 3 + padding().b * 3);

    let lastMouseX = 0, lastMouseY = 0;

    function onResizeHandlePointerDown(e: PointerEvent) {
        const target = e.target as SVGCircleElement;

        e.stopPropagation();
        e.preventDefault();
        target.setPointerCapture(e.pointerId);

        lastMouseX = e.clientX;
        lastMouseY = e.clientY;
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

        let finalWidth;
        let finalHeight;

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
            context.modifyItem(props.item.id, {
                x: props.item.x + deltaX / 2,
                y: props.item.y - deltaY / 2,
                w: finalWidth,
                h: finalHeight
            });
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
                translate(${props.item.x - props.item.w / 2} ${props.item.y - props.item.h / 2}),
                rotate(${props.item.angle} ${props.item.w / 2} ${props.item.h / 2})
            `}
            class="pointer-events-auto"
        >
            <rect
                x={x()}
                y={y()}
                width={width()}
                height={height()}
                fill="none"
                stroke="#64748B"
                stroke-width="2"
            />

            {/* Control point for resize, using circle svg element */}
            <circle 
                cx={x() + width()} 
                cy={y()} 
                r={4 / context.zoom()}
                fill="white"
                stroke="gray"
                stroke-width="2"
                style={{ cursor: "ne-resize" }}
                on:pointerdown={onResizeHandlePointerDown}
                on:pointermove={(e) => onResizeHandlePointerMove(e, "RT")}
                on:pointerup={onResizeHandlePointerUp}
            />

            {/* Control point for resize, using circle svg element */}
            <circle 
                cx={x()} 
                cy={y()} 
                r={4 / context.zoom()}
                fill="white"
                stroke="gray"
                stroke-width="2"
                style={{ cursor: 'nw-resize' }}
                on:pointerdown={onResizeHandlePointerDown}
                on:pointermove={(e) => onResizeHandlePointerMove(e, "LT")}
                on:pointerup={onResizeHandlePointerUp}
            />

            {/* Control point for resize, using circle svg element */}
            <circle 
                cx={x()} 
                cy={y() + height()} 
                r={4 / context.zoom()}
                fill="white"
                stroke="gray"
                stroke-width="2"
                style={{ cursor: 'sw-resize' }}
                on:pointerdown={onResizeHandlePointerDown}
                on:pointermove={(e) => onResizeHandlePointerMove(e, "LB")}
                on:pointerup={onResizeHandlePointerUp}
            />

            {/* Control point for resize, using circle svg element */}
            <circle 
                cx={x() + width()} 
                cy={y() + height()} 
                r={4 / context.zoom()}
                fill="white"
                stroke="gray"
                stroke-width="2"
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
        </g>
    )
}
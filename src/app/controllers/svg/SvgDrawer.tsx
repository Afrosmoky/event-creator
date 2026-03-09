import { createEffect, createMemo, createSignal, For, onCleanup, onMount, Show } from 'solid-js';
import { SvgItemFactory } from './SvgItemFactory';
import { createStore } from 'solid-js/store';
import { useSvgDrawerContext } from '@/app/context/SvgDrawerContext';
import { SvgItemFocus } from './SvgItemFocus';
import { createResizeObserver } from '@solid-primitives/resize-observer';
import { SvgLogo } from './SvgLogo';

export function SvgDrawer(
) {
    const context = useSvgDrawerContext();
    
    let svgDOM: SVGSVGElement = null!;

    let [cellX, setCellX] = createSignal(100);
    let [cellY, setCellY] = createSignal(100);

    onMount(() => {
        context.setRootDOM(svgDOM);

        context.setClientWidth(svgDOM.clientWidth);
        context.setClientHeight(svgDOM.clientHeight);

        context.zoomToFit();

        createResizeObserver(svgDOM, ({ width, height }, el) => {
            if(el === svgDOM) {
                console.log(`SVG DOM resized to ${width}x${height}`);

                context.setClientWidth(width);
                context.setClientHeight(height);

                context.zoomToFit();
            }
        });

        console.log("SvgDrawer mounted");
    });

    onCleanup(() => {
        if(context.rootDOM() === svgDOM) {
            context.setRootDOM(null);
        }
    })

    createEffect(() => {
        console.log(`Zoom: ${context.zoom()}`)
    })

    let lastMouseX: number = 0;
    let lastMouseY: number = 0;

    function onPointerDown(e: PointerEvent) {
        const target = e.currentTarget as SVGSVGElement;

        //e.stopPropagation();
        e.preventDefault();
        target.setPointerCapture(e.pointerId);

        lastMouseX = e.clientX;
        lastMouseY = e.clientY;
        
        context.setFocusedItemIndex(-1);
    }

    function onPointerMove(e: PointerEvent) {
        const target = e.currentTarget as SVGSVGElement;
        if (!target.hasPointerCapture(e.pointerId)) return;

        const deltaX = e.clientX - lastMouseX;
        const deltaY = e.clientY - lastMouseY;

        context.setPanX(context.panX() + deltaX);
        context.setPanY(context.panY() + deltaY);

        lastMouseX = e.clientX;
        lastMouseY = e.clientY;
    }

    function onPointerUp(e: PointerEvent) {
        const target = e.currentTarget as SVGSVGElement;
        target.releasePointerCapture(e.pointerId);
    }

    function onWheel(e: WheelEvent) {
        e.preventDefault();

        const oldZoom = context.zoom();
        context.setZoom(Math.max(0.1, context.zoom() - e.deltaY * 0.001));

        const newZoom = context.zoom();

        const oldMouseX = (e.clientX - context.panX() - context.clientWidth() / 2) / oldZoom;
        const oldMouseY = (e.clientY - context.panY() - context.clientHeight() / 2) / oldZoom;

        const newMouseX = (e.clientX - context.panX() - context.clientWidth() / 2) / newZoom;
        const newMouseY = (e.clientY - context.panY() - context.clientHeight() / 2) / newZoom;

        context.setPanX(context.panX() + (newMouseX - oldMouseX) * newZoom);
        context.setPanY(context.panY() + (newMouseY - oldMouseY) * newZoom);
    }

    const backgroundSizeX = createMemo(() => Math.floor(50 * context.zoom()));
    const backgroundSizeY = createMemo(() => Math.floor(50 * context.zoom()));

    return (
        <div class="relative w-full h-full select-none cursor-move overflow-hidden">
            <svg 
                ref={svgDOM}

                viewBox={`0 0 ${context.clientWidth()} ${context.clientHeight()}`}

                width="100%"
                height="100%"

                style={{
                    "background-color": "white",
                    "background-image": `radial-gradient(rgb(200 200 200 / ${Math.min(context.zoom() * 2, 1)}) ${Math.max(1.2 * context.zoom(), 1)}px, transparent 0)`,
                    "background-size": `${backgroundSizeX()}px ${backgroundSizeY()}px`,
                    "background-position": `${((context.panX() + context.clientWidth() / 2 + backgroundSizeX() / 2) % backgroundSizeX())}px ${((context.panY() + context.clientHeight() / 2 + backgroundSizeY() / 2) % backgroundSizeY())}px`,
                }}
                
                on:wheel={onWheel}
                on:pointerdown={onPointerDown}
                on:pointermove={onPointerMove}
                on:pointerup={onPointerUp}
            >
                
                <style innerHTML={`
                    @font-face { 
                        font-family: "Sora";
                        font-weight: 100 800;
                        font-display: swap;
                        src: url(https://fonts.gstatic.com/s/sora/v17/xMQbuFFYT72XzQUpDqW1KX4.woff2) format('woff2');
                    }

                    /* Style the text */
                    text {
                        /* Specify the system or custom font to use */
                        font-family: "Sora", sans-serif;
                        font-optical-sizing: auto;
                    }
                `} />

                <defs>
                    <pattern id="grid" width={cellX()} height={cellY()} patternUnits="userSpaceOnUse">
                        <path d={`M ${cellX()} 0 L 0 0 0 ${cellY()}`} fill="none" stroke="#cccccc" stroke-width="1" />
                    </pattern>
                </defs>

                <g transform={`translate(${context.panX() + context.clientWidth() / 2}, ${context.panY() + context.clientHeight() / 2}) scale(${context.zoom()})`}>
                    <text y="-16">
                        Sala o wymiarach {context.canvasWidth() / 100}x{context.canvasHeight() / 100} metrów
                    </text>
                    <rect 
                        x="0"
                        y="0"
                        rx="8"
                        ry="8"
                        width={context.canvasWidth()}
                        height={context.canvasHeight()}
                        fill="#FAF9F7"
                    />
                    <rect
                        id="canvas_frame"
                        x="-2"
                        y="-2"
                        rx="8"
                        ry="8"
                        width={context.canvasWidth() + 4}
                        height={context.canvasHeight() + 4}
                        fill="url(#grid)"
                        stroke="black"
                        stroke-width="4"
                    />
                    <For each={context.itemsArray}>
                        {item => {
                            return (
                                <SvgItemFactory item={item} />
                            );
                        }}
                    </For>
                </g>
                <SvgLogo />
            </svg>

            <svg class="absolute top-0 left-0 pointer-events-none" width="100%" height="100%">
                <g transform={`translate(${context.panX() + context.clientWidth() / 2}, ${context.panY() + context.clientHeight() / 2}) scale(${context.zoom()})`}>
                    <Show when={context.focusedItemIndex() != -1}>
                        <SvgItemFocus item={context.items[context.focusedItemIndex()]!} />
                        {/*<SvgItemBBox item={context.items[context.focusedItemIndex()]!} />*/}
                    </Show>
                </g>
            </svg>
        </div>
    );
}

function SvgItemBBox(props: { item: any }) {
    const totalWidth = createMemo(() => props.item.w + (props.item.props?.seat_radius || 0) * 4 + 8 * 2);
    const totalHeight = createMemo(() => props.item.h + (props.item.props?.seat_radius || 0) * 4 + 8 * 2);

    return (
        <rect
            x={props.item.x - totalWidth() / 2}
            y={props.item.y - totalHeight() / 2}
            width={totalWidth()}
            height={totalHeight()}
            fill="none"
            stroke="red"
            stroke-width="1"
        />
    );
}
import { createEffect, createSignal, For, onCleanup, onMount, Show } from 'solid-js';
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

    let [cellX, setCellX] = createSignal(32);
    let [cellY, setCellY] = createSignal(32);

    onMount(() => {
        context.setRootDOM(svgDOM);

        context.setClientWidth(svgDOM.clientWidth);
        context.setClientHeight(svgDOM.clientHeight);

        createResizeObserver(svgDOM, ({ width, height }, el) => {
            if(el === svgDOM) {
                console.log(`SVG DOM resized to ${width}x${height}`);

                context.setClientWidth(width);
                context.setClientHeight(height);
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
        context.setZoom(Math.floor(cellX()) / 32);
    });

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

        setCellX(Math.max(8, Math.min(256, cellX() - e.deltaY * 0.1)));
        setCellY(Math.max(8, Math.min(256, cellY() - e.deltaY * 0.1)));

        const newZoom = context.zoom();

        const oldMouseX = (e.clientX - context.panX() - context.clientWidth() / 2) / oldZoom;
        const oldMouseY = (e.clientY - context.panY() - context.clientHeight() / 2) / oldZoom;

        const newMouseX = (e.clientX - context.panX() - context.clientWidth() / 2) / newZoom;
        const newMouseY = (e.clientY - context.panY() - context.clientHeight() / 2) / newZoom;

        context.setPanX(context.panX() + (newMouseX - oldMouseX) * newZoom);
        context.setPanY(context.panY() + (newMouseY - oldMouseY) * newZoom);
    }

    return (
        <div class="relative w-full h-full select-none cursor-move overflow-hidden">
            <svg 
                ref={svgDOM}

                viewBox={`0 0 ${context.clientWidth()} ${context.clientHeight()}`}

                width="100%"
                height="100%"

                style={{
                    "background-color": "white",
                    "background-image": `radial-gradient(rgb(200 200 200 / 0.8) ${Math.max(1.2 * context.zoom(), 0.5)}px, transparent 0)`,
                    "background-size": `${Math.floor(cellX())}px ${Math.floor(cellY())}px`,
                    "background-position": `${((context.panX() + context.clientWidth() / 2) % Math.floor(cellX()))}px ${((context.panY() + context.clientHeight() / 2) % Math.floor(cellY()))}px`,
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
                <g transform={`translate(${context.panX() + context.clientWidth() / 2}, ${context.panY() + context.clientHeight() / 2}) scale(${context.zoom()})`}>
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
                    </Show>
                </g>
            </svg>
        </div>
    );
}
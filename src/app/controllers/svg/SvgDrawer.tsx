import { batch, createEffect, createMemo, createSignal, For, onCleanup, onMount, Show } from 'solid-js';
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
    });

    onCleanup(() => {
        if(context.rootDOM() === svgDOM) {
            context.setRootDOM(null);
        }
    })

    let lastMouseX: number = 0;
    let lastMouseY: number = 0;

    function onPointerDown(e: PointerEvent) {
        const target = e.currentTarget as SVGSVGElement;

        e.preventDefault();
        target.setPointerCapture(e.pointerId);

        lastMouseX = e.clientX;
        lastMouseY = e.clientY;
        
        const focusedItem = context.focusedItem();
        if(focusedItem && focusedItem.props.pointerEvent === e) {
            return;
        }

        context.setFocusedItem(null);
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

        const zoomSensitivity = 0.001;
        
        const oldZoom = context.zoom();
        const newZoom = Math.max(0.1, oldZoom - e.deltaY * zoomSensitivity);
        const oldMouseX = (e.clientX - context.panX() - context.clientWidth() / 2) / oldZoom;
        const oldMouseY = (e.clientY - context.panY() - context.clientHeight() / 2) / oldZoom;

        const newMouseX = (e.clientX - context.panX() - context.clientWidth() / 2) / newZoom;
        const newMouseY = (e.clientY - context.panY() - context.clientHeight() / 2) / newZoom;

        batch(() => {
            context.setZoom(newZoom);
            context.setPanX(context.panX() + (newMouseX - oldMouseX) * newZoom);
            context.setPanY(context.panY() + (newMouseY - oldMouseY) * newZoom);
        });
    }

    const backgroundSizeX = createMemo(() => 100 * context.zoom());
    const backgroundSizeY = createMemo(() => 100 * context.zoom());

    return (
        <div class="relative w-full h-full select-none cursor-move overflow-hidden">
            <svg 
                ref={svgDOM}

                viewBox={`0 0 ${context.clientWidth()} ${context.clientHeight()}`}

                width="100%"
                height="100%"

                style={{
                    "background-color": "#ffffff"
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
                    <pattern 
                        id="background" 

                        x={(context.panX() + context.clientWidth() / 2)} 
                        y={(context.panY() + context.clientHeight() / 2)} 
                        width={backgroundSizeX()} 
                        height={backgroundSizeY()} 

                        patternUnits="userSpaceOnUse"
                    >
                        <circle 
                            cx={backgroundSizeX() / 2} 
                            cy={backgroundSizeY() / 2} 
                            r={Math.max(3 * context.zoom(), 0.5)} 
                            
                            fill="#cccccc" 
                        />
                    </pattern>
                </defs>

                <rect
                    x="0"
                    y="0"
                    width={context.canvasWidth()}
                    height={context.canvasHeight()}
                    fill="url(#background)"
                />

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
                    <Show when={!!context.focusedItem()}>
                        <SvgItemFocus item={context.focusedItem()} />
                    </Show>
                </g>
            </svg>
        </div>
    );
}
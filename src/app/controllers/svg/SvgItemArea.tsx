import { useSvgDrawerContext } from "@/app/context/SvgDrawerContext";
import { SvgItem, SvgItemAreaProps } from "./SvgItem";
import { batch, createEffect, createMemo, createSignal, For, untrack } from "solid-js";

interface SvgItemAreaComponentProps {
    item: SvgItem<SvgItemAreaProps>;
}

export function SvgItemArea(
    props: SvgItemAreaComponentProps
) {
    const context = useSvgDrawerContext();
    const item = createMemo(() => props.item);

    let [cellX, setCellX] = createSignal(100);
    let [cellY, setCellY] = createSignal(100);
    let [zoom, setZoom] = createSignal(1);

    const markingsX = createMemo(() => Math.floor((item().w - (cellX() / 10)) / cellX()));
    const markingsY = createMemo(() => Math.floor((item().h - (cellY() / 10)) / cellY()));

    createEffect(() => {
        const zoom = context.zoom();

        batch(() => {
            if(zoom <= 0.2) {
                setCellX(500);
                setCellY(500);
                setZoom(3);
            } else if(zoom <= 0.5) {
                setCellX(200);
                setCellY(200);
                setZoom(2);
            } else {
                setCellX(100);
                setCellY(100);
                setZoom(1);
            }
        })
    })

    return (
        <>
            <defs>
                <pattern id="grid" width={cellX()} height={cellY()} patternUnits="userSpaceOnUse">
                    <path d={`M ${cellX()} 0 L 0 0 0 ${cellY()}`} fill="none" stroke="#cccccc" stroke-width="1" />
                </pattern>
            </defs>
            
            <text y={-16 * zoom()} font-size={`${16 * zoom()}px`} fill="#444444">
                Sala o wymiarach {item().w / 100}x{item().h / 100} metrów
            </text>
            <rect 
                x="0"
                y="0"
                rx="8"
                ry="8"
                width={item().w}
                height={item().h}
                fill="#FAF9F7"
            />
            <rect
                id="canvas_frame"
                x="-2"
                y="-2"
                rx="8"
                ry="8"
                width={item().w + 4}
                height={item().h + 4}
                fill="url(#grid)"
                stroke="black"
                stroke-width="4"
            />

            <For each={Array.from({ length: markingsX() }, (_, i) => i + 1)}>
                {(i, _) => (
                    <>
                        <line
                            x1={i * cellX()}
                            y1={item().h - 8 * zoom()}
                            x2={i * cellX()}
                            y2={item().h + 12 * zoom()}
                            stroke="#000000"
                            stroke-width={4 * zoom()}
                        />

                        <text
                            x={i * cellX()}
                            y={item().h + 32 * zoom()}
                            text-anchor="middle"
                            font-size={`${16 * zoom()}px`}
                            fill="#444444"
                        >
                            {i * (cellX() / 100)}m
                        </text>
                    </>
                )}
            </For>

            <For each={Array.from({ length: markingsY() }, (_, i) => i + 1)}>
                {(i, _) => (
                    <>
                        <line
                            x1={-12 * zoom()}
                            y1={i * cellY()}
                            x2={8 * zoom()}
                            y2={i * cellY()}
                            stroke="#000000"
                            stroke-width={4 * zoom()}
                        />

                        <text
                            x={-12 * zoom()}
                            y={i * cellY() + 16 * zoom()}
                            text-anchor="end"
                            font-size={`${16 * zoom()}px`}
                            fill="#444444"
                        >
                            {i * (cellY() / 100)}m
                        </text>
                    </>
                )}
            </For>
        </>
    );
}
import { createEffect, createMemo, createSignal } from "solid-js";
import { clamp } from "./SvgItem";

interface SliderProps {
    min: number;
    max: number;

    value?: number;
    onChange?: (value: number) => void;
}

export default function Slider(
    props: SliderProps
) {
    let sliderDOM: HTMLDivElement;
    let handleDOM: HTMLButtonElement;

    const [handleX, setHandleX] = createSignal(0);
    const clampedValue = createMemo(() => {
        return clamp(Math.floor(props.value), props.min, props.max);
    })

    let lastClampedValue = clampedValue();
    let offsetX = 0;

    createEffect(() => {
        if(!sliderDOM || !handleDOM) {
            return;
        }

        const width = getAvailableWidth();
        const progress = (clampedValue() - props.min) / (props.max - props.min);

        setHandleX(progress * width);
    });

    function getAvailableWidth() {
        return sliderDOM.clientWidth - handleDOM.clientWidth;
    }

    function onHandlePointerDown(event: PointerEvent) {
        const target = event.target as HTMLButtonElement;
        target.setPointerCapture(event.pointerId);

        const x = event.clientX;
        const sliderX = target.getBoundingClientRect().x;

        offsetX = x - sliderX;
    }

    function onHandlePointerMove(event: PointerEvent) {
        const target = event.target as HTMLButtonElement;
        if(!target.hasPointerCapture(event.pointerId)) {
            return;
        }

        const x = event.clientX - offsetX;
        
        const sliderX = sliderDOM.getBoundingClientRect().x;
        const sliderWidth = getAvailableWidth();

        const t = clamp((x - sliderX) / (sliderWidth), 0, 1);
        const value = props.min + (props.max - props.min) * t;

        if(value != lastClampedValue) {
            lastClampedValue = value;
            props.onChange?.(Math.floor(value));
        }
    }

    function onHandlePointerUp(event: PointerEvent) {
        const target = event.target as HTMLButtonElement;
        target.releasePointerCapture(event.pointerId);
    }

    return (
        <div class="w-full h-fit flex flex-col gap-2 pt-1 pb-2">
            <div class="relative w-full h-2">
                <div ref={sliderDOM} class="w-full h-full bg-primary-soft rounded-md"></div>
                <button
                    ref={handleDOM}
                    class="absolute -bottom-1 w-6 h-4 bg-white rounded-lg border-border border"
                    style={{
                        "left": `${handleX()}px`
                    }}
                    on:pointerdown={onHandlePointerDown}
                    on:pointermove={onHandlePointerMove}
                    on:pointerup={onHandlePointerUp}
                >
                    
                </button>
                <label class="absolute left-1/2 -translate-x-1/2 top-4 rounded-md px-1.5 py-0.5 text-sm bg-foreground-muted text-primary-soft">
                    {Math.floor(props.value)}
                </label>
            </div>
            <div 
                class="flex justify-between items-center text-xs text-foreground-muted"
            >
                <label>
                    {props.min}
                </label>
                <label>
                    {props.max}
                </label>
            </div>
        </div>
    );
}
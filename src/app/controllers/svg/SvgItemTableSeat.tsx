import { useSvgDrawerContext } from "@/app/context/SvgDrawerContext";
import { SvgItem, SvgItemTableProps, SvgItemTableSeatProps } from "./SvgItem";
import { createEffect, createMemo, createSignal, Match, Show, Switch } from "solid-js";
import { CircleUserRound } from "lucide-solid";
import { createDroppable } from "@thisbeyond/solid-dnd";
import { SvgIcon } from "./SvgItemIcon";
import { GuestDietIcon, GuestIcon } from "./GuestIcon";

interface SvgItemTableSeatComponentProps {
    item: SvgItem<SvgItemTableSeatProps>;
}

export function SvgItemTableSeat(
    props: SvgItemTableSeatComponentProps
) {
    let guestNameTextDOM: SVGTextElement;
    let meassureTextDOM: SVGTextElement;

    const baseNameTextSize = 12;

    const context = useSvgDrawerContext();
    const seatedGuest = createMemo(() => {
        for(const seated of context.seats) {
            if(seated.table_id === props.item.parent?.id && seated.seat_index === props.item.props.index) {
                return context.guests.find(o => o.id === seated.guest_id);
            }
        }

        return null;
    });
    const [nameFontSize, setNameFontSize] = createSignal(baseNameTextSize);
    const parentTable = createMemo(() => context.items[props.item.parent?.id]);
    const item = props.item;

    const [isHover, setIsHover] = createSignal(false);

    function onContentClick(event: PointerEvent) {
        event.stopPropagation();

        context.setFocusedItemIndex(props.item.id);
    }

    function onPointerUp(event: PointerEvent) {
        const guest = context.guests.find(o => o.id === context.draggingGuest());
        if(!guest) {
            return;
        }

        context.seatGuest(guest.id, props.item.parent.id, props.item.props.index);
    }

    createEffect(() => {
        if(seatedGuest()?.name && meassureTextDOM) {
            const textLength = meassureTextDOM.getComputedTextLength();

            const path = document.querySelector("#seat_guest_text_arc") as SVGPathElement;
            if(path) {
                const pathLength = path.getTotalLength();

                if(textLength > pathLength) {
                    const scalar = pathLength / textLength;
                    setNameFontSize(baseNameTextSize * scalar);
                } else {
                    setNameFontSize(baseNameTextSize);
                }
            } else {
                console.warn("Can't find path for seat text!");
            }
        }
    });

    const SeatedIndicator = () => {
        return (
            <>
                <defs>
                    <path 
                        id="seat_guest_text_arc"
                        fill="none"
                        stroke="red"
                        d={`M 0, ${-0} a ${item.props.radius * 2} ${item.props.radius * 2} 0 0 1 ${item.props.radius * 2} 0`}
                    />
                </defs>
                <circle
                    cx={props.item.props.radius}
                    cy={props.item.props.radius}
                    r={props.item.props.radius}
                    fill-opacity="0"
                />

                <GuestIcon guest={seatedGuest()} radius={props.item.props.radius} />
                <GuestDietIcon 
                    guest={seatedGuest()} 
                    radius={props.item.props.radius / 2} 
                    x={-props.item.props.radius / 2 + 2}
                    y={0}
                />

                <text
                    ref={meassureTextDOM}
                    font-size={baseNameTextSize.toString()}
                    font-weight="regular"

                    visibility="hidden"
                >
                    {seatedGuest().name}
                </text>


                <text
                    ref={guestNameTextDOM}
                    font-size={nameFontSize().toString()}
                    font-weight="regular"
                    text-anchor="middle"
                    
                    fill="#2E2A26"
                >
                    <textPath 
                        startOffset="50%"
                        href="#seat_guest_text_arc"
                    >
                        {seatedGuest().name}
                    </textPath>
                </text>
            </>
        )
    };

    const UnseatedIndicator = () => {
        return (
            <>
                <circle
                    cx={props.item.props.radius}
                    cy={props.item.props.radius}
                    r={props.item.props.radius}
                    fill="#FAF1EF"
                    fill-opacity="0.2"
                    stroke="black"
                    stroke-width={isHover() && context.draggingGuest() != "" ? 0 : 1}
                    
                    stroke-dasharray="4 2"
                ></circle>
                <text
                    x={props.item.props.radius}
                    y={props.item.props.radius + 4}
                    font-size="12"
                    text-anchor="middle"
                    fill="#2E2A26"
                >
                    {(props.item.props.index + 1).toString()}
                </text>
            </>
        )
    }

    const GuestOverIndicator = () => {
        return (
            <>
                <circle 
                    cx={props.item.props.radius}
                    cy={props.item.props.radius}
                    r={props.item.props.radius}

                    stroke="#C6A96A"
                    stroke-width={4}
                    stroke-dasharray="6 4"
                    fill="#FAF1EF"
                    fill-opacity={0.2}
                >
                    <animate
                        attributeName="stroke-dashoffset"
                        from="20"
                        to="0"
                        dur="1s"
                        repeatCount="indefinite"
                    />
                </circle>
            </>
        )
    }
    
    return (
        <Switch>
            <Match when={parentTable().props.show_unseated || seatedGuest()}>
                <g 
                    transform={`
                        translate(${props.item.parent?.x} ${props.item.parent?.y})
                        rotate(${props.item.parent?.angle} ${-props.item.x + props.item.props.radius} ${-props.item.y + props.item.props.radius})
                    ` + (seatedGuest() 
                        ? `rotate(${props.item.props.table_angle} ${props.item.props.radius} ${props.item.props.radius})` 
                        : `rotate(${-props.item.parent?.angle} ${props.item.props.radius} ${props.item.props.radius})`)}

                    on:pointerdown={onContentClick}
                    on:pointerenter={() => setIsHover(true)}
                    on:pointerleave={() => setIsHover(false)}
                    on:pointerup={onPointerUp}
                >
                    <Switch>
                        <Match when={seatedGuest()}>
                            <SeatedIndicator />
                        </Match>
                        <Match when={!seatedGuest()}>
                            <UnseatedIndicator />
                        </Match>
                    </Switch>
                    <Show when={isHover() && context.draggingGuest() != ""}>
                        <GuestOverIndicator />
                    </Show>
                </g>
            </Match>
            <Match when={true}>
                <g 
                    transform={`
                        translate(${props.item.parent?.x} ${props.item.parent?.y})
                        rotate(${props.item.parent?.angle} ${-props.item.x + props.item.props.radius} ${-props.item.y + props.item.props.radius})
                    `}
                >
                    <circle
                        cx={props.item.props.radius}
                        cy={props.item.props.radius}
                        r={4}
                        fill="#FAF1EF"
                        fill-opacity="0.8"
                    ></circle>
                </g>
            </Match>
        </Switch>
    )
}
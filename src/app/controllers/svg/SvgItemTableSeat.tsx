import { useSvgDrawerContext } from "@/app/context/SvgDrawerContext";
import { SvgItem, SvgItemTableProps, SvgItemTableSeatProps } from "./SvgItem";
import { createEffect, createMemo, createSignal, Match, Show, Switch, untrack } from "solid-js";
import { GuestDietIcon, GuestIcon } from "./GuestIcon";

interface SvgItemTableSeatComponentProps {
    item: SvgItem<SvgItemTableSeatProps>;
}

export function SvgItemTableSeat(
    props: SvgItemTableSeatComponentProps
) {
    const baseNameTextSize = 10;

    const context = useSvgDrawerContext();
    const seatedGuest = createMemo(() => {
        for(const seated of context.seats) {
            if(seated.table_id === props.item.parent?.id && seated.seat_index === props.item.props.index) {
                return context.guests.find(o => o.id === seated.guest_id);
            }
        }

        return null;
    });

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

    const ArcText = (props: { 
        text: string,
        size: number,
        meassured_size?: (value: number) => void,
        y_offset?: number
    }) => {
        let meassureTextDOM: SVGTextElement;
        let textArcDOM: SVGPathElement;

        const pathId = createMemo(() => `seat_text_arc_${props.text.replace(/\s+/g, '_')}`);
        const yOffset = createMemo(() => props.y_offset || 0);
        const [fontSize, setFontSize] = createSignal(props.size);

        createEffect(() => {
            props.text;
            
            if(!meassureTextDOM || !textArcDOM) {
                return;
            }

            const textLength = meassureTextDOM.getComputedTextLength();
            const pathLength = textArcDOM.getTotalLength();

            if(textLength > pathLength) {
                const scalar = pathLength / textLength;
                setFontSize(props.size * scalar);
                props.meassured_size?.(props.size * scalar);
            } else {
                setFontSize(props.size);
                props.meassured_size?.(props.size);
            }
        });

        return (
            <>
                <defs>
                    <path
                        ref={textArcDOM}

                        id={pathId()}
                        fill="none"
                        stroke="red"
                        d={`M 0, ${-yOffset()} a ${item.props.radius * 2} ${item.props.radius * 2} 0 0 1 ${item.props.radius * 2} 0`}
                    />
                </defs>

                <text
                    ref={meassureTextDOM}
                    font-size={props.size.toString()}
                    font-weight="regular"

                    visibility="hidden"
                >
                    {props.text}
                </text>

                <text
                    font-size={fontSize().toString()}
                    font-weight="regular"
                    text-anchor="middle"
                    
                    fill="#2E2A26"
                >
                    <textPath 
                        startOffset="50%"
                        href={`#${pathId()}`}
                    >
                        {props.text}
                    </textPath>
                </text>
            </>
        );
    };

    const RegularText = (props: { text: string, size: number, x: number, y: number }) => {
        return (
            <text
                x={props.x}
                y={props.y}
                font-size={props.size.toString() + "px"}
                font-weight="regular"
                text-anchor="middle"
                
                fill="#2E2A26"
            >
                {props.text}
            </text>
        );
    };

    const FullNameText = (
        props: { name: string, surname: string, size: number }
    ) => {
        let contentDOM: SVGGElement;

        const [finalSize, setFinalSize] = createSignal(props.size);
        const [width, setWidth] = createSignal(0);
        const [height, setHeight] = createSignal(0);

        const dirX = createMemo(() => {
            return -Math.cos((item.props.table_angle + 90) * (Math.PI / 180));
        });
        const dirY = createMemo(() => {
            return Math.sin((item.props.table_angle + 90) * (Math.PI / 180));
        });

        createEffect(() => {
            props.name; props.surname; props.size;

            untrack(() => {
                setFinalSize(props.size);
            })
        });

        createEffect(() => {
            props.name; props.surname; props.size;

            untrack(() => {
                const bbox = contentDOM.getBBox();

                setWidth(bbox.width + 6);
                setHeight(bbox.height + 12);
            })
        })

        const onMeassuredSizeUpdate = (value: number) => {
            if(value < finalSize()) {
                setFinalSize(value);
            }
        }

        return (
            <g ref={contentDOM}>
                <Switch>
                    <Match when={item.parent?.props.seat_facing === 0}>
                        <ArcText
                            text={props.name}
                            size={finalSize()}
                            meassured_size={onMeassuredSizeUpdate}
                            y_offset={finalSize()}
                        />
                        <ArcText
                            text={props.surname}
                            size={finalSize()}
                            meassured_size={onMeassuredSizeUpdate}
                            y_offset={0}
                        />
                    </Match>
                    <Match when={true}>
                        <RegularText
                            text={props.name}
                            size={props.size}
                            x={item.props.radius + dirX() * width()}
                            y={item.props.radius - dirY() * height()}
                        />
                        <RegularText
                            text={props.surname}
                            size={props.size}
                            x={item.props.radius + dirX() * width()}
                            y={item.props.radius + props.size - dirY() * height()}
                        />
                    </Match>
                </Switch>
            </g>
        )
    }

    const SeatedIndicator = () => {
        return (
            <>
                <circle
                    cx={props.item.props.radius}
                    cy={props.item.props.radius}
                    r={props.item.props.radius}
                    fill-opacity="0"
                />

                <GuestIcon guest={seatedGuest()} radius={props.item.props.radius} />
                {context.showDietaryIcons() && (
                    <GuestDietIcon 
                        guest={seatedGuest()} 
                        radius={props.item.props.radius / 2} 
                        x={-props.item.props.radius / 2 + 2}
                        y={0}
                    />
                )}

                <FullNameText
                    name={seatedGuest()?.name || ""}
                    surname={seatedGuest()?.surname || ""}
                    size={baseNameTextSize}
                />
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
                        ? `rotate(${parentTable().props.seat_facing == 0 ? props.item.props.table_angle : 0} ${props.item.props.radius} ${props.item.props.radius})` 
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
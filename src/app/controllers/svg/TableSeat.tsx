import { useSvgDrawerContext } from "@/app/context/SvgDrawerContext";
import { SvgItem, SvgItemTableProps, SvgItemType, TableSeatConfigProps } from "./SvgItem";
import { batch, createEffect, createMemo, createSignal, Match, Show, Switch, untrack } from "solid-js";
import { GuestDietIcon, GuestIcon } from "./GuestIcon";

interface TableSeatComponentProps {
    parent: SvgItem<SvgItemTableProps>;
    index: number;
}

export function TableSeat(
    props: TableSeatComponentProps
) {
    const baseNameTextSize = 10;

    const context = useSvgDrawerContext();
    const seatedGuest = createMemo(() => {
        for(const seated of context.seats) {
            if(seated.table_id === props.parent.id && seated.seat_index === props.index) {
                return context.guests.find(o => o.id === seated.guest_id);
            }
        }

        return null;
    });

    const parent = createMemo(() => props.parent);
    const config = createMemo(() => props.parent.props.seat_configs[props.index]);

    const [isHover, setIsHover] = createSignal(false);

    function onContentClick(event: PointerEvent) {
        event.stopPropagation();

        context.setFocusedItem({
            id: props.parent.id,
            props: {
                inspectSeat: props.index,
            }
        });
    }

    function onPointerUp(event: PointerEvent) {
        const guest = context.guests.find(o => o.id === context.draggingGuest());
        if(guest) {
            context.seatGuest(guest.id, props.parent.id, props.index);
            return;
        }

        const group = context.draggingGroup();
        if(!group) {
            return;
        }

        let guests = context.guests.filter(o => o.group === group);
        if(guests.length === 0) {
            return;
        }

        batch(() => {
            const occupied = context.getTableSeats(props.parent.id);
            guests = guests.filter(guest => {
                return !occupied.some(o => o.guest_id === guest.id);
            });
            
            if(guests.length === 0) {
                return;
            }

            if(occupied.length + guests.length > props.parent.props.seats) {
                alert(`Nie można usadzić wszystkich gości przy tym stole! Potrzebnych miejsc: ${occupied.length + guests.length}, dostępnych miejsc: ${props.parent.props.seats}`);
                return;
            }

            let seatIndex = 0;
            
            while(guests.length > 0) {
                const isOccupied = occupied.some(o => o.seat_index === seatIndex);
                if(!isOccupied) {
                    const guest = guests.shift();
                    if(guest) {
                        context.seatGuest(guest.id, props.parent.id, seatIndex);
                    }
                }

                seatIndex++;
            }
        });
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

                        d={`M 0, ${-yOffset()} a ${config().radius * 2} ${config().radius * 2} 0 0 1 ${config().radius * 2} 0`}
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

    const RegularText = (props: { text: string, size: number, x: number, y: number, anchor: "start" | "middle" | "end" }) => {
        return (
            <text
                x={props.x}
                y={props.y}
                font-size={props.size.toString() + "px"}
                font-weight="regular"
                text-anchor={props.anchor}
                
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

        const anchor = createMemo(() => {
            let angle = config().angle;

            if(parent().kind == SvgItemType.TABLE_CIRCLE) {
                if(angle <= 90 || angle >= 270) {
                    return "start";
                } else {
                    return "end";
                }
            } else {
                if((angle >= 0 && angle <= 90) || (angle > 270 && angle < 360)) {
                    return "start";
                } else {
                    return "end";
                }
            }
        })

        const dirX = createMemo(() => {
            return Math.cos((config().angle) * (Math.PI / 180));
        });
        const dirY = createMemo(() => {
            return Math.sin((config().angle) * (Math.PI / 180));
        });

        createEffect(() => {
            props.name; props.surname; props.size;

            untrack(() => {
                setFinalSize(props.size);
            })
        });

        const onMeassuredSizeUpdate = (value: number) => {
            if(value < finalSize()) {
                setFinalSize(value);
            }
        }

        const length = createMemo(() => {
            if(parent().kind == SvgItemType.TABLE_CIRCLE) {
                return (config().radius + 4);
            } else {
                return (config().radius + 4);
            }
        });

        const x = createMemo(() => {
            return config().radius + dirX() * length();
        });

        const y = createMemo(() => {
            return config().radius - dirY() * length();
        });

        return (
            
                <Switch>
                    <Match when={parent().props.seat_facing === 0}>
                        <g ref={contentDOM} transform={constructRotateTransform(-config().angle + 90)}>
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
                        </g>
                    </Match>
                    <Match when={true}>
                        <g ref={contentDOM} transform={
                            parent().kind != SvgItemType.TABLE_CIRCLE
                            ? constructRotateTransform(-config().angle % 180, x(), y())
                            : constructRotateTransform(-(
                                config().angle <= 90 || config().angle >= 270
                                ? config().angle
                                : (config().angle + 180) % 360
                            ), x(), y())
                        }>
                            <RegularText
                                text={props.name}
                                size={props.size}
                                x={x()}
                                y={y()}
                                anchor={anchor()}
                            />
                            <RegularText
                                text={props.surname}
                                size={props.size}
                                x={x()}
                                y={y() + props.size}
                                anchor={anchor()}
                            />
                        </g>
                    </Match>
                </Switch>
        )
    }

    const SeatedIndicator = () => {
        const seat_facing = createMemo(() => parent().props.seat_facing);

        return (
            <>
                <circle
                    cx={0}
                    cy={0}
                    r={config().radius}
                    fill-opacity="0"
                />

                <g transform={constructRotateTransform(
                    seat_facing() === 0 ? -config().angle + 90 : 0
                )}>
                    <GuestIcon guest={seatedGuest()} radius={config().radius} />
                    {context.showDietaryIcons() && (
                        <GuestDietIcon 
                            guest={seatedGuest()} 
                            radius={config().radius / 2}
                            x={-config().radius / 2 + 2}
                            y={0}
                        />
                    )}
                </g>

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
                    cx={config().radius}
                    cy={config().radius}
                    r={config().radius}
                    fill="#FFFFFF"
                    fill-opacity="1"
                    stroke="black"
                    stroke-width={isHover() && context.draggingGuest() != "" ? 0 : 1}
                    
                    stroke-dasharray="4 2"
                ></circle>
                <text
                    x={config().radius}
                    y={config().radius + 4}
                    font-size="12"
                    text-anchor="middle"
                    fill="#2E2A26"
                >
                    {(props.index + 1).toString()}
                </text>
            </>
        )
    }

    const GuestOverIndicator = () => {
        return (
            <>
                <circle 
                    cx={config().radius}
                    cy={config().radius}
                    r={config().radius}

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

    function constructRotateTransform(angle: number, cx: number = config().radius, cy: number = config().radius) {
        return `rotate(${angle} ${cx} ${cy})`;
    }
    
    return (
        <Switch>
            <Match when={parent().props.show_unseated || seatedGuest()}>
                <g 
                    transform={`translate(${config().x - config().radius} ${config().y - config().radius})`}

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
                <g>
                    <circle
                        cx={config().x}
                        cy={config().y}
                        r={4}
                        fill="#FAF1EF"
                        fill-opacity="0.8"
                    ></circle>
                </g>
            </Match>
        </Switch>
    )
}
import { batch, createEffect, createMemo, For, untrack } from "solid-js";
import { clamp, MAX_SEAT_SPACING, MIN_SEAT_SPACING, SEAT_RADIUS, SvgItem, SvgItemTableCircleProps, TableSeatConfigProps } from "./SvgItem";
import { createStore } from "solid-js/store";
import { useSvgDrawerContext } from "@/app/context/SvgDrawerContext";
import { TableSeat } from "./TableSeat";

interface SvgItemTableCircleComponentProps {
    item: SvgItem<SvgItemTableCircleProps>;
}

export function SvgItemTableCircle(
    props: SvgItemTableCircleComponentProps
) {
    const canvas = useSvgDrawerContext();
    const [state, setState] = createStore({
        radius: createMemo(() => props.item.w / 2)
    });

    createEffect(() => {
        const currentSeatRadius = props.item.props.seat_radius;

        untrack(() => {
            if(currentSeatRadius != SEAT_RADIUS) {
                canvas.modifyItem(props.item.id, {
                    props: {
                        seat_radius: SEAT_RADIUS
                    }
                });
            }
        })
    });

    createEffect(() => {
        const width = props.item.w;

        untrack(() => {
            const clamped = Math.max(64, width);

            if(clamped != width) {
                canvas.modifyItem(props.item.id, {
                    w: clamped
                });
            }
        })
    })

    createEffect(() => {
        props.item.w;

        untrack(() => {
            canvas.modifyItem(props.item.id, {
                h: props.item.w
            });
        })
    })

    createEffect(() => {
        const spacing = props.item.props.seat_spacing;
        state.radius();

        untrack(() => {
            const length = calculateLength();
            const seats = Math.floor(length / spacing);

            canvas.modifyItem(props.item.id, {
                props: {
                    seats: clampSeats(seats)
                }
            })
        });
    });

    createEffect(() => {
        let preferredSeats = props.item.props.preferred_seats;
        if(preferredSeats == -1) {
            return;
        }

        untrack(() => {
            preferredSeats = clampSeats(preferredSeats);

            const length = calculateLength();
            const spacing = length / preferredSeats;

            canvas.modifyItem(props.item.id, {
                props: {
                    seat_spacing: spacing
                }
            });
        });
    })

    createEffect(() => {
        calculatePoints();
    });

    function clampSeats(value: number) {
        const length = calculateLength();
        const maxSeats = Math.floor(length / MIN_SEAT_SPACING);
        const minSeats = Math.floor(length / MAX_SEAT_SPACING);

        return clamp(value, minSeats, maxSeats);
    }

    function getOuterRadius() {
        return state.radius() + props.item.props.seat_radius + 8;
    }

    function calculateLength() {
        const r = getOuterRadius();
        const l = r * 2 * Math.PI;

        return l;
    }

    function calculatePoints() {
        const seats: TableSeatConfigProps[] = [];
        const r = state.radius() + props.item.props.seat_radius + 8;
        const total = props.item.props.seats;

        for(let i = 0; i < total; ++i) {
            const angle = ((i / total) * 360);
            const rad = (angle - 90) * Math.PI / 180;

            const x = Math.cos(rad) * r;
            const y = Math.sin(rad) * r;

            seats.push({
                x: x + state.radius(),
                y: y + state.radius(),
                radius: SEAT_RADIUS,
                angle: (-angle + 90 + 360) % 360,
            });
        }

        untrack(() => {
            canvas.modifyItem(props.item.id, {
                props: {
                    seat_configs: seats
                }
            }, false);
        });
    }

    function onPointerUp(event: PointerEvent) {
        const group = canvas.draggingGroup();
        if(!group) {
            return;
        }

        let guests = canvas.guests.filter(o => o.group === group);
        if(guests.length === 0) {
            return;
        }

        batch(() => {
            const occupied = canvas.getTableSeats(props.item.id);
            guests = guests.filter(guest => {
                return !occupied.some(o => o.guest_id === guest.id);
            });
            
            if(guests.length === 0) {
                return;
            }

            if(occupied.length + guests.length > props.item.props.seats) {
                alert(`Nie można usadzić wszystkich gości przy tym stole! Potrzebnych miejsc: ${occupied.length + guests.length}, dostępnych miejsc: ${props.item.props.seats}`);
                return;
            }

            let seatIndex = 0;
            
            while(guests.length > 0) {
                const isOccupied = occupied.some(o => o.seat_index === seatIndex);
                if(!isOccupied) {
                    const guest = guests.shift();
                    if(guest) {
                        canvas.seatGuest(guest.id, props.item.id, seatIndex);
                    }
                }

                seatIndex++;
            }
        });
    }

    return (
        <>
            <defs>
                <clipPath id={`table_clip_${props.item.id}`}>
                    <circle 
                        cx={state.radius()}
                        cy={state.radius()}
                        r={state.radius()}
                    ></circle>
                </clipPath>
            </defs>

            <circle 
                fill={props.item.props?.color}
                stroke={props.item.props?.border_color}
                stroke-width={(props.item.props?.border_width ?? 2) * 2}

                cx={state.radius()}
                cy={state.radius()}
                r={state.radius()}
                
                clip-path={`url(#table_clip_${props.item.id})`}

                on:pointerup={onPointerUp}
            ></circle>

            <text
                x={state.radius()}
                y={state.radius() + (props.item.props.name_font_size / 3)}
                font-size={`${props.item.props.name_font_size}px`}
                fill={props.item.props.name_color}
                font-weight={props.item.props.name_bold ? "bold" : "normal"}
                font-style={props.item.props.name_italic ? "italic" : "normal"}
                text-anchor="middle"
            >
                {props.item.props.name}
            </text>

            <For each={props.item.props.seat_configs}>
                {(config, index) => (
                    <TableSeat 
                        parent={props.item}
                        index={index()}
                    />
                )}
            </For>
        </>
    )
}
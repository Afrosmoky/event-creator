import { batch, createEffect, createMemo, createSignal, For, onCleanup, untrack } from "solid-js";
import { clamp, createSvgItemFromBlueprint, MAX_SEAT_SPACING, MIN_SEAT_SPACING, SEAT_RADIUS, SvgItem, SvgItems, SvgItemTableCircleProps, SvgItemTableSeatProps, type SvgItemTableProps } from "./SvgItem";
import { createStore } from "solid-js/store";
import { useSvgDrawerContext } from "@/app/context/SvgDrawerContext";

interface SvgItemTableCircleComponentProps {
    item: SvgItem<SvgItemTableCircleProps>;
}

export function SvgItemTableCircle(
    props: SvgItemTableCircleComponentProps
) {
    const canvas = useSvgDrawerContext();
    const [state, setState] = createStore({
        seats: [] as SvgItem<SvgItemTableSeatProps>[],
        radius: createMemo(() => props.item.w / 2)
    });

    onCleanup(() => {
        batch(() => {
            for(const seat of state.seats) {
                canvas.removeItem(seat.id, false);
            }
        })
    })

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
        const minSeats = Math.ceil(length / MAX_SEAT_SPACING);

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
        const seats: SvgItem<SvgItemTableSeatProps>[] = [];
        const r = state.radius() + props.item.props.seat_radius + 8;
        const total = props.item.props.seats;

        for(let i = 0; i < total; ++i) {
            const angle = ((i / total) * 360) - 90;
            const rad = angle * Math.PI / 180;

            const x = Math.cos(rad) * r;
            const y = Math.sin(rad) * r;

            const seat = createSvgItemFromBlueprint(SvgItems.TABLE_SEAT);
            seat.parent = props.item;
            seat.x = x;
            seat.y = y;
            seat.w = SEAT_RADIUS * 2;
            seat.h = SEAT_RADIUS * 2;
            seat.props.table_angle = angle + 90;
            seat.props.radius = props.item.props.seat_radius;
            seat.props.index = seats.length;

            seats.push(seat);
        }

        untrack(() => {
            batch(() => {
                const oldSeats = state.seats;
                for(const seat of oldSeats) {
                    canvas.removeItem(seat.id, false);
                }

                for(const seat of seats) {
                    canvas.addItem(undefined, seat, false);
                }
            })
            

            setState("seats", seats);
        });
    }

    function onPointerUp(event: PointerEvent) {
        const group = canvas.draggingGroup();
        if(!group) {
            return;
        }

        batch(() => {
            canvas.unseatTable(props.item.id);

            const guests = canvas.guests.filter(o => o.group === group);
            for(let i = 0; i < guests.length; ++i) {
                canvas.seatGuest(guests[i].id, props.item.id, i);
            }
        });
    }

    return (
        <>
            <circle 
                fill={props.item.props?.color || "var(--color-primary-soft)"}
                cx={state.radius()}
                cy={state.radius()}
                r={state.radius()}
                on:pointerup={onPointerUp}
            ></circle>

            <text
                x={state.radius()}
                y={state.radius() + 6}
                text-anchor="middle"
            >
                {props.item.props.name}
            </text>
        </>
    )
}
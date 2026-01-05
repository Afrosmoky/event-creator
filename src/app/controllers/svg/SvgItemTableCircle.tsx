import { batch, createEffect, createMemo, For, untrack } from "solid-js";
import { createSvgItemFromBlueprint, SvgItem, SvgItems, SvgItemTableSeatProps, type SvgItemTableProps } from "./SvgItem";
import { createStore } from "solid-js/store";
import { SvgItemTableSeat } from "./SvgItemTableSeat";
import { useSvgDrawerContext } from "@/app/context/SvgDrawerContext";

interface SvgItemTableCircleComponentProps {
    item: SvgItem<SvgItemTableProps>;
}

export function SvgItemTableCircle(
    props: SvgItemTableCircleComponentProps
) {
    const canvas = useSvgDrawerContext();
    const [state, setState] = createStore({
        seats: [] as SvgItem<SvgItemTableSeatProps>[],
        radius: createMemo(() => Math.min(props.item.w, props.item.h) / 2)
    });

    createEffect(() => {
        const radius = state.radius();

        untrack(() => {
            canvas.modifyItem(props.item.id, {
                props: {
                    radius: radius
                }
            });
        });
    })

    createEffect(() => {
        const length = calculateTotalLength();
        const desiredSeats = Math.floor(length / props.item.props.seat_spacing);

        untrack(() => {
            if(desiredSeats != props.item.props.seats) {
                canvas.modifyItem(props.item.id, {
                    props: {
                        seats: desiredSeats
                    }
                });
            }
        });
    });

    createEffect(() => {
        props.item.props.seat_spacing, props.item.props.seat_radius;

        untrack(() => {
            const clampedSpacing = Math.max(40, props.item.props.seat_spacing);

            canvas.modifyItem(props.item.id, {
                props: {
                    seat_radius: 20,
                    seat_spacing: clampedSpacing
                }
            })
        })
    });

    createEffect(() => {
        props.item.props.seats; props.item.props.seat_spacing;

        untrack(() => {
            const length = calculateTotalLength();
            const maxSeats = Math.floor(length / props.item.props.seat_spacing);
            console.log(`Max seats: ${maxSeats}, Current seats: ${props.item.props.seats}`)

            if(props.item.props.seats > maxSeats) {
                canvas.modifyItem(props.item.id, {
                    props: {
                        seats: maxSeats
                    }
                });
            } else if(props.item.props.seats < 0) {
                canvas.modifyItem(props.item.id, {
                    props: {
                        seats: 0
                    }
                });
            }
        })
    })

    createEffect(() => {
        calculatePoints();
    });

    function calculateTotalLength() {
        const r = state.radius() + props.item.props.seat_radius + 8;
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

            const seat = createSvgItemFromBlueprint(SvgItems.TABLE_SEAT, (props.item.id + 1) * 1000 + seats.length);
            seat.parent = props.item;
            seat.x = x;
            seat.y = y;
            seat.w = 42;
            seat.h = 42;
            seat.props.table_angle = angle + 90;
            seat.props.radius = props.item.props.seat_radius;
            seat.props.index = seats.length;

            seats.push(seat);
        }

        untrack(() => {
            const oldSeats = state.seats;
            for(const seat of oldSeats) {
                canvas.removeItem(seat.id, false);
            }

            for(const seat of seats) {
                canvas.addItem(seat.id, seat, false);
            }

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
                canvas.seatGuest(guests[i].guest_id, props.item.id, i);
            }
        });
    }

    return (
        <>
            <circle 
                fill={props.item.props?.color || "var(--color-primary-soft)"}
                cx={props.item.w / 2}
                cy={props.item.h / 2}
                r={state.radius()}
                on:pointerup={onPointerUp}
            ></circle>

            <text
                x={props.item.w / 2}
                y={props.item.h / 2 + 6}
                text-anchor="middle"
            >
                {props.item.props.name}
            </text>
        </>
    )
}
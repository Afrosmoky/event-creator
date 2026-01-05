import { batch, createEffect, createMemo, For, untrack } from "solid-js";
import { createSvgItemFromBlueprint, isSvgItemTableT, isSvgItemTableU, SvgItem, SvgItems, SvgItemTableSeatProps, type SvgItemTableProps } from "./SvgItem";
import { createStore, produce, unwrap } from "solid-js/store";
import { SideParams, SvgItemTableRectGenerator, SvgItemTableTGenerator, SvgItemTableUGenerator, type GeneratorReturn, type Point } from "./SvgItemTableGenerators";
import { SvgItemTableSeat } from "./SvgItemTableSeat";
import { useSvgDrawerContext } from "@/app/context/SvgDrawerContext";

interface SvgItemTableComponentProps {
    item: SvgItem<SvgItemTableProps>;
}

interface Seat {
    x: number;
    y: number;
}

export function SvgItemTable(
    props: SvgItemTableComponentProps
) {
    const { item } = props;

    const canvas = useSvgDrawerContext();
    const [state, setState] = createStore({
        seats: [] as SvgItem<SvgItemTableSeatProps>[],
        points: [] as Point[],
        sides: {} as SideParams
    });

    const titleY = createMemo(() => {
        if(isSvgItemTableT(item)) {
            return item.props.top_height / 2 + 6;
        } else if(isSvgItemTableU(item)) {
            return item.h - item.props.bottom_height / 2 + 6;
        } else {
            return item.h / 2 + 6;
        }
    });

    createEffect(() => {
        const desiredSeats = calculateMaxSeats();

        untrack(() => {
            if(desiredSeats != item.props.seats) {
                canvas.modifyItem(item.id, {
                    props: {
                        seats: desiredSeats
                    }
                });
            }
        });
    });

    createEffect(() => {
        item.props.seats, item.props.seat_spacing, item.props.seat_radius;

        untrack(() => {
            const clampedSeats = Math.max(0, item.props.seats);
            const clampedSpacing = Math.max(40, item.props.seat_spacing);

            canvas.modifyItem(item.id, {
                props: {
                    seats: clampedSeats,
                    seat_radius: 20,
                    seat_spacing: clampedSpacing
                }
            })
        })
    })

    createEffect(() => {
        calculatePoints();
    });

    function calculateMaxSeats() {
        let seats = 0;

        for(let i = 0; i < state.points.length; ++i) {
            const p0 = state.points[i];
            const p1 = state.points[(i + 1) % state.points.length];
            const params = {
                seat_start_padding: 0,
                seat_end_padding: 0,
                ...(state.sides[i] || {})
            };

            let dx = p1.x - p0.x;
            let dy = p1.y - p0.y;
            let length = Math.sqrt(dx * dx + dy * dy);
            length -= params.seat_end_padding + params.seat_start_padding;

            const maxSeats = Math.floor(length / item.props.seat_spacing);
            seats += maxSeats;
        }

        return seats;
    }

    function calculatePoints() {
        let result: GeneratorReturn;

        if(isSvgItemTableT(props.item)) {
            result = SvgItemTableTGenerator(props.item);
        } else if(isSvgItemTableU(props.item)) {
            result = SvgItemTableUGenerator(props.item);
        } else {
            result = SvgItemTableRectGenerator(props.item);
        }

        if(!result) {
            throw new Error("Can't find table generator!");
        }

        const [points, sides] = result;
        if(!points) {
            throw new Error("No generator for table!");
        }

        const seats: SvgItem<SvgItemTableSeatProps>[] = [];

        for(let i = 0; i < points.length; ++i) {
            const p0 = points[i];
            const p1 = points[(i + 1) % points.length];
            const params = {
                seat_start_padding: 0,
                seat_end_padding: 0,
                ...(sides[i] || {})
            };

            let dx = p1.x - p0.x;
            let dy = p1.y - p0.y;
            let length = Math.sqrt(dx * dx + dy * dy);

            const nx = dx / length;
            const ny = dy / length;

            length -= params.seat_end_padding + params.seat_start_padding;

            dx = nx * length;
            dy = ny * length;

            const count = Math.floor(length / (item.props.seat_spacing));
            if(count === 0) {
                continue;
            }

            const stepX = dx / count;
            const stepY = dy / count;

            const perpX = ny;
            const perpY = -nx;

            for (let j = 0; j < count; j++) {
                const seatX = p0.x + params.seat_start_padding * nx + perpX * (item.props.seat_radius + 4) + stepX * (j + 0.5);
                const seatY = p0.y + params.seat_start_padding * ny + perpY * (item.props.seat_radius + 4) + stepY * (j + 0.5);

                const seat = createSvgItemFromBlueprint(SvgItems.TABLE_SEAT, (item.id + 1) * 1000 + seats.length);
                seat.parent = item;
                seat.x = seatX - item.w / 2;
                seat.y = seatY - item.h / 2;
                seat.w = 42;
                seat.h = 42;
                seat.props.table_angle = Math.atan2(-perpY, -perpX) * 180 / Math.PI - 90;
                seat.props.radius = item.props.seat_radius;
                seat.props.index = seats.length;

                seats.push(seat);
            }
        }

        untrack(() => {
            const oldSeats = state.seats;
            for(const seat of oldSeats) {
                canvas.removeItem(seat.id, false);
            }

            for(const seat of seats) {
                canvas.addItem(seat.id, seat, false);
            }

            setState(produce(state => {
                state.seats = seats;
                state.sides = sides;
                state.points = points;
            }));
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
            <polygon 
                fill={item.props?.color || "#aaaaaa"}
                points={state.points.map(p => `${p.x},${p.y}`).join(" ")}
                on:pointerup={onPointerUp}
            />

            <text
                x={item.w / 2}
                y={titleY()}
                text-anchor="middle"
            >
                {item.props.name}
            </text>
        </>
    )
}
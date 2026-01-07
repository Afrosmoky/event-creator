import { batch, createEffect, createMemo, For, untrack } from "solid-js";
import { createSvgItemFromBlueprint, isSvgItemTableT, isSvgItemTableU, MAX_SEAT_SPACING, MIN_SEAT_SPACING, SvgItem, SvgItems, SvgItemTableSeatProps, type SvgItemTableProps } from "./SvgItem";
import { createStore, produce, unwrap } from "solid-js/store";
import { SideParams, SvgItemTableRectGenerator, SvgItemTableTGenerator, SvgItemTableUGenerator, type GeneratorReturn, type Point } from "./SvgItemTableGenerators";
import { useSvgDrawerContext } from "@/app/context/SvgDrawerContext";

interface SvgItemTableComponentProps {
    item: SvgItem<SvgItemTableProps>;
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
        updatePoints();
    });

    createEffect(() => {
        item.props.seat_spacing; state.points;

        untrack(() => {
            const seats = calculateSeatsForSpacing(item.props.seat_spacing);
            canvas.modifyItem(props.item.id, {
                props: {
                    seats: seats
                }
            })
        })
    });

    createEffect(() => {
        const preferredSeats = item.props.preferred_seats;
        if(preferredSeats == -1) {
            return;
        }

        untrack(() => {
            const maxSeats = calculateSeatsForSpacing(MIN_SEAT_SPACING);
            const minSeats = calculateSeatsForSpacing(MAX_SEAT_SPACING);

            if(preferredSeats < minSeats || preferredSeats > maxSeats) {
                return;
            }

            const dir = preferredSeats < item.props.seats ? 1 : -1;
            let result = calculateNextSeats(item.props.seat_spacing, dir);
            
            canvas.modifyItem(props.item.id, {
                props: {
                    seat_spacing: result.spacing
                }
            })
        })
    })

    createEffect(() => {
        batch(() => {
            updateSeats();
        });
    });

    function calculateNextSeats(spacing: number, dir: -1 | 1) {
        const currentSeats = calculateSeatsForSpacing(spacing);

        while(true) {
            spacing += dir;

            const nextSeats = calculateSeatsForSpacing(spacing);
            if(currentSeats != nextSeats) {
                return {
                    spacing: spacing,
                    seats: nextSeats
                };
            }
        }
    }

    function calculateSeatsForSpacing(spacing: number) {
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

            let maxSeats = Math.floor(length / spacing);
            if(maxSeats === 0) {
                maxSeats = length >= MIN_SEAT_SPACING ? 1 : 0;
            }
            
            seats += maxSeats;
        }

        return seats;
    }

    function updatePoints() {
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
        untrack(() => {
            setState(produce(state => {
                state.points = points;
                state.sides = sides;
            }));
        })
    }

    function updateSeats() {
        const { points, sides } = state;
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

            let count = Math.floor(length / (item.props.seat_spacing));
            if(count === 0) {
                count = length >= MIN_SEAT_SPACING ? 1 : 0;
            }

            const stepX = dx / count;
            const stepY = dy / count;

            const perpX = ny;
            const perpY = -nx;

            for (let j = 0; j < count; j++) {
                const seatX = p0.x + params.seat_start_padding * nx + perpX * (item.props.seat_radius + 4) + stepX * (j + 0.5);
                const seatY = p0.y + params.seat_start_padding * ny + perpY * (item.props.seat_radius + 4) + stepY * (j + 0.5);

                const seat = createSvgItemFromBlueprint(SvgItems.TABLE_SEAT);
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
                canvas.addItem(undefined, seat, false);
            }

            setState(produce(state => {
                state.seats = seats;
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
                canvas.seatGuest(guests[i].id, props.item.id, i);
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
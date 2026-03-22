import { batch, createEffect, createMemo, For, Index, untrack } from "solid-js";
import { isSvgItemTableT, isSvgItemTableU, MAX_SEAT_SPACING, MIN_SEAT_SPACING, SEAT_RADIUS, SvgItem, TableSeatConfigProps, type SvgItemTableProps } from "./SvgItem";
import { createStore, produce } from "solid-js/store";
import { SideParams, SvgItemTableRectGenerator, SvgItemTableTGenerator, SvgItemTableUGenerator, type GeneratorReturn, type Point } from "./SvgItemTableGenerators";
import { useSvgDrawerContext } from "@/app/context/SvgDrawerContext";
import { TableSeat } from "./TableSeat";

interface SvgItemTableComponentProps {
    item: SvgItem<SvgItemTableProps>;
}

export function SvgItemTable(
    props: SvgItemTableComponentProps
) {
    const { item } = props;

    const canvas = useSvgDrawerContext();
    const [state, setState] = createStore({
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
                    seat_spacing: result.spacing,
                    preferred_seats: -1
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
        const seats: TableSeatConfigProps[] = [];

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
            const perpY = nx;

            const table_angle = (Math.atan2(perpY, perpX) * 180 / Math.PI + 360) % 360;

            for (let j = 0; j < count; j++) {
                const seatX = p0.x + params.seat_start_padding * nx + perpX * (item.props.seat_radius + 4) + stepX * (j + 0.5);
                const seatY = p0.y + params.seat_start_padding * ny - perpY * (item.props.seat_radius + 4) + stepY * (j + 0.5);

                seats.push({
                    x: seatX,
                    y: seatY,
                    radius: SEAT_RADIUS,
                    angle: table_angle,
                });
            }
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
        const guest = canvas.guests.find(o => o.id === canvas.draggingGuest());
        if(guest) {
            if(!props.item.props.name) {
                alert("Stolik, do którego próbujesz przypisać uczestnika, nie jest opisany. Nadaj mu nazwę i spróbuj ponownie.");
                return;
            }
            
            const occupiedSeats = canvas.getTableSeats(props.item.id);
            if(occupiedSeats.length >= props.item.props.seats) {
                alert("Ten stół jest już pełny!");
                return;
            }

            const availableSeats = new Set<number>();
            for(let i = 0; i < props.item.props.seats; ++i) {
                availableSeats.add(i);
            }

            for(const seat of occupiedSeats) {
                availableSeats.delete(seat.seat_index);
            }

            if(availableSeats.size === 0) {
                alert("Ten stół jest już pełny!");
                return;
            }

            const minimumAvailableIndex = Math.min(...availableSeats);
            canvas.seatGuest(guest.id, props.item.id, minimumAvailableIndex);

            return;
        }

        const group = canvas.draggingGroup();
        if(!group) {
            return;
        }

        if(!props.item.props.name) {
            alert("Stolik, do którego próbujesz przypisać uczestnika, nie jest opisany. Nadaj mu nazwę i spróbuj ponownie.");
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
                <clipPath id={`table_clip_${item.id}`}>
                    <polygon 
                        points={state.points.map(p => `${p.x},${p.y}`).join(" ")}
                    />
                </clipPath>
            </defs>

            <polygon 
                id={`table_polygon_${item.id}`}
                points={state.points.map(p => `${p.x},${p.y}`).join(" ")}
                
                fill={item.props?.color || "#aaaaaa"}
                stroke={item.props?.border_color || "#000000"}
                stroke-width={(item.props?.border_width ?? 2) * 2}
                
                clip-path={`url(#table_clip_${item.id})`}
                
                on:pointerup={onPointerUp}
            />

            <text
                x={item.w / 2}
                y={titleY()}
                fill={item.props?.name_color}
                font-weight={item.props?.name_bold ? "bold" : "normal"}
                font-style={item.props?.name_italic ? "italic" : "normal"}
                font-size={`${item.props?.name_font_size}px`}
                text-anchor="middle"
            >
                {item.props.name}
            </text>

            <For each={item.props.seat_configs}>
                {(seat, index) => (
                    <TableSeat parent={item} index={index()}/>
                )}
            </For>
        </>
    )
}
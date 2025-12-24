import { createEffect, createMemo, For } from "solid-js";
import { isSvgItemTableT, isSvgItemTableU, SvgItem, type SvgItemTableProps } from "./SvgItem";
import { createStore, produce } from "solid-js/store";
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
        seats: [] as Seat[],
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

    calculatePoints();

    createEffect(() => {
        const desiredSeats = calculateMaxSeats();

        queueMicrotask(() => {
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
        item.props.seats;

        queueMicrotask(() => {
            
        })
    })

    createEffect(() => {
        calculatePoints();
    });

    /*function calculateTotalLength() {
        let total = 0;

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
            total += length;
        }

        return total;
    }*/

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

        const seats: Seat[] = [];

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

            const perpX = dy / length;
            const perpY = -dx / length;

            for (let j = 0; j < count; j++) {
                const seatX = p0.x + params.seat_start_padding * nx + perpX * (item.props.seat_radius + 4) + stepX * (j + 0.5);
                const seatY = p0.y + params.seat_start_padding * ny + perpY * (item.props.seat_radius + 4) + stepY * (j + 0.5);

                seats.push({ x: seatX, y: seatY });
            }
        }

        setState(produce(state => {
            state.seats = seats;
            state.sides = sides;
            state.points = points;
        }));
    }

    return (
        <>
            <polygon 
                fill={item.props?.color || "#aaaaaa"}
                stroke="black"
                points={state.points.map(p => `${p.x},${p.y}`).join(" ")}
            ></polygon>

            <text
                x={item.w / 2}
                y={titleY()}
                text-anchor="middle"
            >
                {item.props.name}
            </text>

            <For each={state.seats}>
                {(seat, seatIndex) => (
                    <SvgItemTableSeat 
                        x={seat.x} y={seat.y} 
                        radius={item.props.seat_radius} 
                        angle={item.angle} 
                        text={(seatIndex() + 1).toFixed(0)} 
                    />
                )}
            </For>
        </>
    )
}
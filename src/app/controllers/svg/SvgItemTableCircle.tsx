import { createEffect, createMemo, For } from "solid-js";
import { SvgItem, type SvgItemTableProps } from "./SvgItem";
import { createStore } from "solid-js/store";
import { SvgItemTableSeat } from "./SvgItemTableSeat";
import { useSvgDrawerContext } from "@/app/context/SvgDrawerContext";

interface SvgItemTableCircleComponentProps {
    item: SvgItem<SvgItemTableProps>;
}

interface Seat {
    x: number;
    y: number;
}

export function SvgItemTableCircle(
    props: SvgItemTableCircleComponentProps
) {
    const { item } = props;

    const canvas = useSvgDrawerContext();
    const [state, setState] = createStore({
        seats: [] as Seat[],
        radius: createMemo(() => Math.min(item.w, item.h) / 2)
    });

    calculatePoints();

    createEffect(() => {
        const length = calculateTotalLength();
        const desiredSeats = Math.floor(length / item.props.seat_spacing);

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
            const length = calculateTotalLength();
            const maxSeats = Math.floor(length / item.props.seat_spacing);

            if(item.props.seats > maxSeats) {
                canvas.modifyItem(item.id, {
                    props: {
                        seats: maxSeats
                    }
                });
            }
        })
    })


    createEffect(() => {
        calculatePoints();
    });

    function calculateTotalLength() {
        const r = state.radius() + item.props.seat_radius + 8;
        const l = r * 2 * Math.PI;

        return l;
    }

    function calculatePoints() {
        const seats: Seat[] = [];
        const r = state.radius() + item.props.seat_radius + 8;
        const total = item.props.seats;

        for(let i = 0; i < total; ++i) {
            const angle = ((i / total) * 360) - 90;
            const rad = angle * Math.PI / 180;

            const x = Math.cos(rad) * r;
            const y = Math.sin(rad) * r;

            seats.push({
                x: item.w / 2 + x,
                y: item.h / 2 + y
            });
        }

        setState("seats", seats);
    }

    return (
        <>
            <circle 
                fill={item.props?.color || "#aaaaaa"}
                stroke="black"
                cx={item.w / 2}
                cy={item.h / 2}
                r={state.radius()}
            ></circle>

            <text
                x={item.w / 2}
                y={item.h / 2 + 6}
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
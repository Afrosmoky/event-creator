import API from "@/app/api/API";
import { applyDiff, DeepPartial, SeatClient } from "@/app/context/SvgDrawerContext";
import { assign, num, str } from "../utils";

export function decodeBackendSeat(seat: DeepPartial<API.Seat>) {
    const client: DeepPartial<SeatClient> = {};

    assign(client, "guest_id", seat.guest_id, str);
    assign(client, "table_id", seat.element_id, num);
    assign(client, "seat_index", seat.index, num);

    return client;
}

export function encodeClientSeat(seat: DeepPartial<SeatClient>) {
    const backend: DeepPartial<API.Seat> = {};

    assign(backend, "index", seat.seat_index, num);
    assign(backend, "element_id", seat.table_id, num);
    assign(backend, "guest_id", seat.guest_id, str);

    return backend;
}

export function createBackendFromSeat(seat: DeepPartial<SeatClient>) {
    const backend: Omit<API.Seat, "id" | "created_at" | "updated_at"> = {
        guest_id: "",
        element_id: 0,
        index: 0,
        label: "",
        ballroom_id: "",
    };

    const diff = encodeClientSeat(seat);
    applyDiff(backend, diff);

    return backend;
}

export function createSeatFromBackend(backend: DeepPartial<API.Seat>) {
    const seat: SeatClient = {
        id: 0,
        guest_id: "",
        table_id: 0,
        seat_index: 0,
    };

    const diff = decodeBackendSeat(backend);
    applyDiff(seat, diff);

    return seat;
}
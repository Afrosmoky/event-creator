import { DeepPartial } from "../context/SvgDrawerContext";

namespace API {
    export const BASE_URL = 'https://afrosmoky.vps.webdock.cloud/api';

    export type RequestErrorCode = 
        | "NETWORK"
        | "HTTP"
        | "INVALID_JSON";

    export class RequestError extends Error {
        code: RequestErrorCode;
        status?: number;

        constructor(code: RequestErrorCode, msg: string, status?: number) {
            super(msg);

            this.code = code;
            this.status = status;
            
            this.name = "RequestError";
            Object.setPrototypeOf(this, RequestError.prototype);
        }
    }

    export interface Element {
        ballroom_id: string,
        id: number,

        name: string,
        index: string,
        focus: string,
        icon: string,
        
        x: number,
        y: number,
        color: string,
        kind: string,
        spacing: number,
        status: string,
        
        config: { 
            seats: number,
            radius: number,
            width: number,
            height: number,
            size: number,
            angle: number,
            angle_origin_x: number,
            angle_origin_y: number,
            arms_width: number,
            bottom_height: number,
            top_height: number,
            bottom_width: number
        },

        created_at: string,
        updated_at: string
    }

    export interface Seat {
        id: number;
        index: number;
        element_id: number;
        guest_id: string;
        ballroom_id: string;
        label: string;
        created_at: string;
        updated_at: string;
    }

    export interface Guest {
        id: string;
        guest_id: string,
        element_id: string,
        ballroom_id: string,
        name: string,
        surname: string,
        seated: boolean,
        group: string,
        age_group: string,
        gender: string,
        menu: string,
        note: string,

        parameters?: {
            dietary_preference: string
        }
    }

    export function add_element(element: Omit<DeepPartial<Element>, "id" | "created_at" | "updated_at">) {
        return request<Element>(
            BASE_URL + '/element',
            "POST",
            element
        );
    }

    export function update_element(id: number, element: Omit<DeepPartial<Element>, "id" | "created_at" | "updated_at">) {
        return request<unknown>(
            BASE_URL + `/element/${id}`,
            "PUT",
            element
        );
    }

    export function get_elements(ballroom_id: string) {
        return request<Element[]>(
            BASE_URL + `/element/ballroom/${ballroom_id}`, 
            'GET'
        );
    }

    export function delete_element(id: number) {
        return request<unknown>(
            BASE_URL + `/element/${id}`,
            'DELETE'
        );
    }

    export function add_seat(seat: Omit<Seat, "id" | "created_at" | "updated_at">) {
        return request<Seat>(
            BASE_URL + '/seat',
            "POST",
            seat
        );
    }

    export function update_seat(id: number, seat: Omit<DeepPartial<Seat>, "id" | "created_at" | "updated_at">) {
        return request<unknown>(
            BASE_URL + `/seat/${id}`,
            "PUT",
            seat
        );
    }

    export function get_seats(ballroom_id: string) {
        return request<Seat[]>(
            BASE_URL + `/ballroom/${ballroom_id}/getSeats`,
            "GET"
        );
    }

    export function delete_seat(id: number) {
        return request<unknown>(
            BASE_URL + `/seat/${id}`,
            "DELETE"
        );
    }

    export function get_guests(ballroom_id: string) {
        return request<Guest[]>(
            BASE_URL + `/guest/getlist/${ballroom_id}`,
            "GET"
        );
    }

    export function update_guest_note(guest_id: string, note: string) {
        return request<unknown>(
            BASE_URL + `/guest-notes/${guest_id}`,
            "PUT",
            { note: note }
        );
    }

    /**
     * @throws {RequestError}
     */
    async function request<T>(
        path: string, 
        method: "GET" | "POST" | "PUT" | "DELETE", 
        body?: any, 
        headers?: Record<string, string>
    ) {
        let res: Response;

        try {
            res = await fetch(path, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                    ...(headers ?? {})
                },
                body: body ? JSON.stringify(body) : undefined
            });
        } catch(error) {
            console.error(error);
            throw new RequestError("NETWORK", "Network request failed");
        }

        if(!res.ok) {
            throw new RequestError("HTTP", res.statusText, res.status);
        }

        // no body
        if (res.status === 204 || res.headers.get("Content-Length") === "0") {
            return undefined;
        }

        let json: 
            { success: true, data: T } | 
            { success: false, message: string, data: Record<string, string[]> };
        try {
            json = await res.json();
        } catch(error) {
            console.error(error);
            throw new RequestError("INVALID_JSON", "Failed to parse JSON body");
        }

        if(json.success === false) {
            throw new RequestError("HTTP", `Server returned error: ${json.message}\n${JSON.stringify(json.data, undefined, 2)}`, 400);
        }

        return json.data;
    }
};

export default API;
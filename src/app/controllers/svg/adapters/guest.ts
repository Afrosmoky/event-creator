import API from "@/app/api/API";
import { applyDiff, DeepPartial, Guest } from "@/app/context/SvgDrawerContext";
import { assign, str } from "../utils";

export function decodeBackendGuest(backend: DeepPartial<API.Guest>) {
    const client: DeepPartial<Guest> = {};

    assign(client, "id", backend.guest_id, str);
    assign(client, "name", backend.name, str);
    assign(client, "surname", backend.surname, str);
    assign(client, "gender", backend.gender, str);
    assign(client, "group", backend.group, str);
    assign(client, "age_group", backend.age_group, str);
    assign(client, "menu", backend.menu, str);
    assign(client, "note", backend.note, str);

    return client;
}

export function createGuestFromBackend(backend: DeepPartial<API.Guest>) {
    const guest: Guest = {
        id: backend.guest_id || "",
        name: "",
        surname: "",
        gender: "",
        group: "",
        age_group: "",
        menu: "",
        note: ""
    };

    const diff = decodeBackendGuest(backend);
    applyDiff(guest, diff);

    return guest;
}
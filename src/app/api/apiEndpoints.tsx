export type ApiEndpointsType = {
  endpoint: string;
  method: ('GET' | 'POST' | 'PUT' | 'DELETE')[];
};

export interface ItemAPIType {
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

export interface GuestAPIType {
  id: number;
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

export interface SeatAPIType {
  id: number;
  index: number;
  element_id: number;
  guest_id: string;
  ballroom_id: string;
  label: string;
  created_at: string;
  updated_at: string;
}

export const API_ENDPOINTS = {
  GUEST : {
    endpoint: '/guest/getlist/:id',
    method: ['GET'],
  },
  GET_SEATS: {
    endpoint: '/ballroom/:id/getSeats',
    method: ['GET']
  },
  PUT_SEAT: {
    endpoint: '/seat/:id',
    method: ['PUT']
  },
  DELETE_SEAT: {
    endpoint: '/seat/:id/:index',
    method: ['DELETE']
  },
  GET_ELEMENTS : {
    endpoint: '/element/ballroom/:id',
    method: ['GET'],
  },
  ADD_ELEMENTS : {
    endpoint: '/element',
    method: ['POST'],
  },
  UPDATE_ELEMENT : {
    endpoint: '/element/:id',
    method: ['PUT'],
  },
  DELETE_ELEMENT : {
    endpoint: '/element/:id',
    method: ['DELETE'],
  }
};




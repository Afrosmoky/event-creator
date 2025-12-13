export type ApiEndpointsType = {
  endpoint: string;
  method: ('GET' | 'POST' | 'PUT' | 'DELETE')[];
};
export type ApiKeysType =
| 'GUEST'
| 'GET_ELEMENTS'
| "ADD_ELEMENTS"
| 'UPDATE_ELEMENT'
| 'DELETE_ELEMENT'
;
export const API_ENDPOINTS: {[key in ApiKeysType]:ApiEndpointsType} = {

 GUEST : {
    endpoint: '/guest/getlist/:id',
    method: ['GET'],
  },
  GET_ELEMENTS : {
    endpoint: '/element/ballroom/1',
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
  },

};




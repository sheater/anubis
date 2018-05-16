import { GLOBAL_INIT } from './../actions'

export default function rootReducer(state = {}, action) {
  switch (action.type) {
    case GLOBAL_INIT:
      return Object.assign({}, action.payload)
  }

  return state
}

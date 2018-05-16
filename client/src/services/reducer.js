import { GLOBAL_INIT } from './../actions'
//
// import { OscType } from "./instruments/osc/consts"
// import { OSC_PLAY, OSC_TYPE_CHANGE } from "../actions"

const initialState = {
  // type: OscType.SINE,
  global: {},
}

export default function rootReducer(state = initialState, action) {
  switch (action.type) {
    case GLOBAL_INIT:
      console.log('action payload', action.payload)
      break
    // case OSC_PLAY:
    //   return R.assoc('isPlaying', action.payload.isPlaying, state)
    //
    // case OSC_TYPE_CHANGE:
    //   return R.assoc('type', action.payload.type, state)
  }

  return state
}

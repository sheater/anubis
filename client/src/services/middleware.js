// import { OSC_TYPE_CHANGE, OSC_PLAY } from "../actions.js"

// const context = new AudioContext()
//
// let osc = null

const middleware = store => next => action => {
  switch (action.type) {
    // case OSC_TYPE_CHANGE:
    //   osc.type = action.payload.type
    //
    //   break
    //
    // case OSC_PLAY:
    //   if (action.payload.isPlaying) {
    //     osc = context.createOscillator();
    //
    //     osc.connect(context.destination);
    //     osc.start();
    //   }
    //   else {
    //     if (osc) {
    //       osc.stop();
    //     }
    //   }
    //
    //   break
  }

  return next(action)
}

export default middleware

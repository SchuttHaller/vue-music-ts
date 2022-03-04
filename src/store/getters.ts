import { GetterTree } from "vuex";
import { State } from "./state";

export type Getters = {
  playing(state: State): boolean;
};

export const getters: GetterTree<State, State> & Getters = {
  playing(state) {
    return state.sound?.playing() ?? false;
  },
};

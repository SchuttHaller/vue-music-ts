import helper from "@/includes/helper";
import { Howl } from "howler";
import { MutationTree } from "vuex";
import { State } from "./state";

export enum MutationType {
  NewSong = "NEW_SONG",
  UpdatePosition = "UPDATE_POSITION",
  ToggleAuthModal = "TOGGLE_AUTH_MODAL",
  ToggleAuth = "TOGGLE_AUTH",
}

export type Mutations = {
  [MutationType.NewSong](state: State, payload: any): void;
  [MutationType.UpdatePosition](state: State): void;
  [MutationType.ToggleAuthModal](state: State): void;
  [MutationType.ToggleAuth](state: State): void;
};

export const mutations: MutationTree<State> & Mutations = {
  [MutationType.NewSong](state, payload) {
    state.currentSong = payload;
    state.sound = new Howl({
      src: [payload.url],
      html5: true,
    });
  },

  [MutationType.UpdatePosition](state) {
    const seek = state.sound?.seek() ?? 0;
    const duration = state.sound?.duration() ?? 0;
    state.seek = helper.formatTime(seek);
    state.duration = helper.formatTime(duration);
    state.playerProgress = `${(seek / duration) * 100}%`;
  },

  [MutationType.ToggleAuthModal](state) {
    state.authModalShow = !state.authModalShow;
  },

  [MutationType.ToggleAuth](state) {
    state.userLoggedIn = !state.userLoggedIn;
  },
};

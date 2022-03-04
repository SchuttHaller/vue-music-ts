import { Howl } from "howler";
import { auth, usersCollection } from "@/includes/firebase";
import { ActionContext, ActionTree, DispatchOptions } from "vuex";
import { Mutations, MutationType } from "./mutations";
import { State } from "./state";

export enum ActionTypes {
  Auth_Register = "AUTH:REGISTER",
  Auth_Login = "AUTH:LOGIN",
  Auth_InitLogin = "AUTH:INIT_LOGIN",
  Auth_Signout = "AUTH:SIGNOUT",
  Player_SetNewSong = "PLAYER:SET_NEW_SONG",
  Player_ToggleAudio = "PLAYER:TOGGLE_AUDIO",
  Player_SetProgress = "PLAYER:SET_PROGRESS",
  Player_SetSeek = "PLAYER:SET_SEEK",
}

type ActionAugments = Omit<
  ActionContext<State, State>,
  "commit" | "dispatch"
> & {
  commit<K extends keyof Mutations>(
    key: K,
    payload?: Parameters<Mutations[K]>[1]
  ): ReturnType<Mutations[K]>;
  dispatch<K extends keyof Actions>(
    key: K,
    payload?: Parameters<Actions[K]>[1],
    options?: DispatchOptions
  ): ReturnType<Actions[K]>;
};

export type Actions = {
  [ActionTypes.Auth_Register](
    context: ActionAugments,
    payload: any
  ): Promise<void>;
  [ActionTypes.Auth_Login](
    context: ActionAugments,
    payload: any
  ): Promise<void>;
  [ActionTypes.Auth_InitLogin](context: ActionAugments): void;
  [ActionTypes.Auth_Signout](context: ActionAugments): Promise<void>;
  [ActionTypes.Player_SetNewSong](
    context: ActionAugments,
    payload: any
  ): Promise<void>;
  [ActionTypes.Player_ToggleAudio](context: ActionAugments): Promise<void>;
  [ActionTypes.Player_SetProgress](context: ActionAugments): void;
  [ActionTypes.Player_SetSeek](context: ActionAugments, payload: any): void;
};

export const actions: ActionTree<State, State> & Actions = {
  async [ActionTypes.Auth_Register]({ commit }, payload) {
    const userCred = await auth.createUserWithEmailAndPassword(
      payload.email,
      payload.password
    );

    await usersCollection.doc(userCred.user?.uid).set({
      name: payload.name,
      email: payload.email,
      age: payload.age,
      country: payload.country,
    });

    await userCred.user?.updateProfile({
      displayName: payload.name,
    });
    commit(MutationType.ToggleAuth);
  },

  async [ActionTypes.Auth_Login]({ commit }, payload) {
    await auth.signInWithEmailAndPassword(payload.email, payload.password);
    commit(MutationType.ToggleAuth);
  },

  [ActionTypes.Auth_InitLogin]({ commit }) {
    const user = auth.currentUser;
    if (user) {
      commit(MutationType.ToggleAuth);
    }
  },

  async [ActionTypes.Auth_Signout]({ commit }) {
    await auth.signOut();
    commit(MutationType.ToggleAuth);
  },

  async [ActionTypes.Player_SetNewSong]({ state, commit, dispatch }, payload) {
    if (state.sound instanceof Howl) {
      state.sound.unload();
    }
    commit(MutationType.NewSong, payload);

    state.sound?.play();

    state.sound?.on("play", () => {
      requestAnimationFrame(() => {
        dispatch(ActionTypes.Player_SetProgress);
      });
    });
  },

  async [ActionTypes.Player_ToggleAudio]({ state }) {
    if (!state.sound?.playing) {
      return;
    }

    if (state.sound.playing()) {
      state.sound.pause();
    } else {
      state.sound.play();
    }
  },

  [ActionTypes.Player_SetProgress]({ state, commit, dispatch }) {
    commit(MutationType.UpdatePosition);

    if (state.sound?.playing()) {
      requestAnimationFrame(() => {
        dispatch(ActionTypes.Player_SetProgress);
      });
    }
  },

  [ActionTypes.Player_SetSeek]({ state, dispatch }, payload) {
    if (!state.sound?.playing) {
      return;
    }

    const { x, width } = payload.currentTarget.getBoundingClientRect();
    // Document = 2000, Timeline = 1000, Click = 500, Distance = 500
    const clickX = payload.clientX - x;
    const percentage = clickX / width;
    const seconds = state.sound.duration() * percentage;

    state.sound.seek(seconds);

    state.sound.once("seek", () => {
      dispatch(ActionTypes.Player_SetProgress);
    });
  },
};

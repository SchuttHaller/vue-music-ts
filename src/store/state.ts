import { Howl } from "howler";

export type State = {
  authModalShow: boolean;
  userLoggedIn: boolean;
  currentSong: any; // TODO: map the actual model
  sound: Howl | null;
  seek: string;
  duration: string;
  playerProgress: string;
};

export const state: State = {
  authModalShow: false,
  userLoggedIn: false,
  currentSong: {},
  sound: null,
  seek: "00:00",
  duration: "00:00",
  playerProgress: "0%",
};

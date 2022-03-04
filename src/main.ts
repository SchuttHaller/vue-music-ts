import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import { store } from "./store";
import "./assets/tailwind.css";
import "./assets/main.css";
import i18n from "./i18n";
import { auth } from "./includes/firebase";
import VeeValidatePlugin from "./includes/validation";
import ProgessBar from "./includes/progress-bar";
import GlobalComponents from "./includes/_globals";
import IconSecondary from "./directives/icon-secondary";
import Icon from "./directives/icon";
import "nprogress/nprogress.css";

ProgessBar(router);

let app: any = null;

auth.onAuthStateChanged(() => {
  if (!app) {
    app = createApp(App)
      .use(i18n)
      .use(store)
      .use(router)
      .use(VeeValidatePlugin)
      .use(GlobalComponents)
      .directive("icon-secondary", IconSecondary)
      .directive("icon-secondary", Icon);

    app.mount("#app");
  }
});

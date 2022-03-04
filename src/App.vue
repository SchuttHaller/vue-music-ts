<script setup lang="ts">
import { useStore } from "./store";
import AppPlayer from "./components/Player.vue";
import AppHeader from "./components/Header.vue";
import AuthModal from "./components/Auth.vue";
import { ActionTypes } from "./store/actions";

const store = useStore();
store.dispatch(ActionTypes.Auth_InitLogin);
</script>

<template>
  <app-header />

  <router-view v-slot="{ Component }">
    <transition name="fade" mode="out-in">
      <component :is="Component"></component>
    </transition>
  </router-view>

  <app-player />

  <auth-modal />
</template>

<style>
.fade-enter-from {
  opacity: 0;
}

.fade-enter-active {
  transition: all 0.5s linear;
}

.fade-leave-to {
  transition: all 0.5s linear;
  opacity: 0;
}
</style>

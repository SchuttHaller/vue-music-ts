<script setup lang="ts">
import { useStore } from "@/store";
import { ActionTypes } from "@/store/actions";
import { MutationType } from "@/store/mutations";
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import { useRoute, useRouter } from "vue-router";

const store = useStore();
const { t, locale } = useI18n();
const route = useRoute();
const router = useRouter();

const userLoggedIn = computed(() => store.state.userLoggedIn);
const currentLocale = computed(() =>
  locale.value === "en" ? "Español" : "English"
);

function toggleAuthModal() {
  store.commit(MutationType.ToggleAuthModal);
}

function signout() {
  store.dispatch(ActionTypes.Auth_Signout);

  if (route.meta.requiresAuth) {
    router.push({ name: "home" });
  }
}

function changeLocale() {
  locale.value = locale.value === "es" ? "en" : "es";
}
</script>

<template>
  <!-- Header -->
  <header id="header" class="bg-gray-700">
    <nav class="container mx-auto flex justify-start items-center py-5 px-4">
      <!-- App Name -->
      <router-link
        class="text-white font-bold uppercase text-2xl mr-4"
        :to="{ name: 'home' }"
        exact-active-class="no-active"
      >
        Music
      </router-link>

      <div class="flex flex-grow items-center">
        <!-- Primary Navigation -->
        <ul class="flex flex-row mt-1">
          <!-- Navigation Links -->
          <li>
            <router-link class="px-2 text-white" :to="{ name: 'about' }">
              About
            </router-link>
          </li>
          <li v-if="!userLoggedIn">
            <a
              class="px-2 text-white"
              href="#"
              @click.prevent="toggleAuthModal"
            >
              Login / Register
            </a>
          </li>
          <template v-else>
            <li>
              <router-link class="px-2 text-white" :to="{ name: 'manage' }">
                Manage
              </router-link>
            </li>
            <li>
              <a class="px-2 text-white" href="#" @click.prevent="signout"
                >Logout</a
              >
            </li>
          </template>
        </ul>
        <ul class="flex flex-row mt-1 ml-auto">
          <li>
            <a class="px-2 text-white" href="#" @click.prevent="changeLocale">
              {{ currentLocale }}
            </a>
          </li>
        </ul>
      </div>
    </nav>
  </header>
</template>

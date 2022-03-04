<script setup lang="ts">
import { reactive } from "vue";
import { useStore } from "@/store";
import { ActionTypes } from "@/store/actions";

const store = useStore();

const state = reactive({
  loginSchema: {
    email: "required|email",
    password: "required|min:3|max:32",
  },
  login_in_submission: false,
  login_show_alert: false,
  login_alert_variant: "bg-blue-500",
  login_alert_msg: "Please wait! We are logging you in.",
});

async function login(values: any) {
  state.login_in_submission = true;
  state.login_show_alert = true;
  state.login_alert_variant = "bg-blue-500";
  state.login_alert_msg = "Please wait! We are logging you in.";

  try {
    await store.dispatch(ActionTypes.Auth_Login, values);
  } catch (error) {
    state.login_in_submission = false;
    state.login_alert_variant = "bg-red-500";
    state.login_alert_msg = "Invalid login details.";
    return;
  }

  state.login_alert_variant = "bg-green-500";
  state.login_alert_msg = "Success! You are now logged in.";
  window.location.reload();
}
</script>

<template>
  <div
    class="text-white text-center font-bold p-4 mb-4"
    v-if="state.login_show_alert"
    :class="state.login_alert_variant"
  >
    {{ state.login_alert_msg }}
  </div>
  <vee-form :validation-schema="state.loginSchema" @submit="login">
    <!-- Email -->
    <div class="mb-3">
      <label class="inline-block mb-2">Email</label>
      <vee-field
        type="email"
        name="email"
        class="block w-full py-1.5 px-3 text-gray-800 border border-gray-300 transition duration-500 focus:outline-none focus:border-black rounded"
        placeholder="Enter Email"
      />
      <ErrorMessage class="text-red-600" name="email" />
    </div>
    <!-- Password -->
    <div class="mb-3">
      <label class="inline-block mb-2">Password</label>
      <vee-field
        type="password"
        name="password"
        class="block w-full py-1.5 px-3 text-gray-800 border border-gray-300 transition duration-500 focus:outline-none focus:border-black rounded"
        placeholder="Password"
      />
      <ErrorMessage class="text-red-600" name="password" />
    </div>
    <button
      type="submit"
      :disabled="state.login_in_submission"
      class="block w-full bg-purple-600 text-white py-1.5 px-3 rounded transition hover:bg-purple-700"
    >
      Submit
    </button>
  </vee-form>
</template>

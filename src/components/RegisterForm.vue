<script setup lang="ts">
import { reactive } from "vue";
import { useStore } from "@/store";
import { ActionTypes } from "@/store/actions";
import { useI18n } from "vue-i18n";

const store = useStore();
const { t } = useI18n();
const state = reactive({
  schema: {
    name: "required|min:3|max:100|alpha_spaces",
    email: "required|min:3|max:100|email",
    age: "required|min_value:18|max_value:100",
    password: "required|min:3|max:100",
    confirm_password: "passwords_mismatch:@password",
    country: "required|country_excluded:Antarctica",
    tos: "tos",
  },
  userData: {
    country: "USA",
  },
  reg_in_submission: false,
  reg_show_alert: false,
  reg_alert_variant: "bg-blue-500",
  reg_alert_msg: "Please wait! Your account is being created.",
});

async function register(values: any) {
  state.reg_show_alert = true;
  state.reg_in_submission = true;
  state.reg_alert_variant = "bg-blue-500";
  state.reg_alert_msg = "Please wait! Your account is being created.";

  try {
    await store.dispatch(ActionTypes.Auth_Register, values);
  } catch (error) {
    state.reg_in_submission = false;
    state.reg_alert_variant = "bg-red-500";
    state.reg_alert_msg =
      "An unexpected error occured. Please try again later.";
    return;
  }

  state.reg_alert_variant = "bg-green-500";
  state.reg_alert_msg = "Success! Your account has been created.";
  window.location.reload();
}
</script>

<template>
  <div
    class="text-white text-center font-bold p-4 mb-4"
    v-if="state.reg_show_alert"
    :class="state.reg_alert_variant"
  >
    {{ state.reg_alert_msg }}
  </div>
  <vee-form
    :validation-schema="state.schema"
    @submit="register"
    :initial-values="state.userData"
  >
    <!-- Name -->
    <div class="mb-3">
      <label class="inline-block mb-2">Name</label>
      <vee-field
        type="text"
        name="name"
        class="block w-full py-1.5 px-3 text-gray-800 border border-gray-300 transition duration-500 focus:outline-none focus:border-black rounded"
        placeholder="Enter Name"
      />
      <ErrorMessage class="text-red-600" name="name" />
    </div>
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
    <!-- Age -->
    <div class="mb-3">
      <label class="inline-block mb-2">Age</label>
      <vee-field
        type="number"
        name="age"
        class="block w-full py-1.5 px-3 text-gray-800 border border-gray-300 transition duration-500 focus:outline-none focus:border-black rounded"
      />
      <ErrorMessage class="text-red-600" name="age" />
    </div>
    <!-- Password -->
    <div class="mb-3">
      <label class="inline-block mb-2">Password</label>
      <vee-field name="password" :bails="false" v-slot="{ field, errors }">
        <input
          class="block w-full py-1.5 px-3 text-gray-800 border border-gray-300 transition duration-500 focus:outline-none focus:border-black rounded"
          type="password"
          placeholder="Password"
          v-bind="field"
        />
        <div class="text-red-600" v-for="error in errors" :key="error">
          {{ error }}
        </div>
      </vee-field>
    </div>
    <!-- Confirm Password -->
    <div class="mb-3">
      <label class="inline-block mb-2">Confirm Password</label>
      <vee-field
        type="password"
        name="confirm_password"
        class="block w-full py-1.5 px-3 text-gray-800 border border-gray-300 transition duration-500 focus:outline-none focus:border-black rounded"
        placeholder="Confirm Password"
      />
      <ErrorMessage class="text-red-600" name="confirm_password" />
    </div>
    <!-- Country -->
    <div class="mb-3">
      <label class="inline-block mb-2">Country</label>
      <vee-field
        as="select"
        name="country"
        class="block w-full py-1.5 px-3 text-gray-800 border border-gray-300 transition duration-500 focus:outline-none focus:border-black rounded"
      >
        <option value="USA">USA</option>
        <option value="Mexico">Mexico</option>
        <option value="Germany">Germany</option>
        <option value="Antarctica">Antarctica</option>
      </vee-field>
      <ErrorMessage class="text-red-600" name="country" />
    </div>
    <!-- TOS -->
    <div class="mb-3 pl-6">
      <vee-field
        type="checkbox"
        name="tos"
        value="1"
        class="w-4 h-4 float-left -ml-6 mt-1 rounded inline-block"
      />
      <i18n-t class="inline-block" keypath="register.accept" tag="label">
        <a href="#">{{ t("register.TOS") }}</a>
      </i18n-t>
      <ErrorMessage class="text-red-600 block" name="tos" />
    </div>
    <button
      type="submit"
      :disabled="state.reg_in_submission"
      class="block w-full bg-purple-600 text-white py-1.5 px-3 rounded transition hover:bg-purple-700"
    >
      Submit
    </button>
  </vee-form>
</template>

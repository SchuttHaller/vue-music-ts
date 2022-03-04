<script setup lang="ts">
import { songsCollection, storage } from "@/includes/firebase";
import { reactive } from "vue";

const props = defineProps({
  song: { type: Object, required: true },
  updateSong: { type: Function, required: true },
  index: { type: Number, required: true },
  removeSong: { type: Function, required: true },
  updateUnsavedFlag: { type: Function },
});

const state = reactive({
  showForm: false,
  schema: {
    modified_name: "required",
    genre: "alpha_spaces",
  },
  in_submission: false,
  show_alert: false,
  alert_variant: "bg-blue-500",
  alert_message: "Please wait! Updating song info.",
});

async function edit(values: any) {
  state.in_submission = true;
  state.show_alert = true;
  state.alert_variant = "bg-blue-500";
  state.alert_message = "Please wait! Updating song info.";

  try {
    await songsCollection.doc(props.song.docID).update(values);
  } catch (error) {
    state.in_submission = false;
    state.alert_variant = "bg-red-500";
    state.alert_message = "Something went wrong! Try again later";
    return;
  }

  props.updateSong(props.index, values);

  if (props.updateUnsavedFlag != undefined) {
    props.updateUnsavedFlag(false);
  }
  state.in_submission = false;
  state.alert_variant = "bg-green-500";
  state.alert_message = "Success!";
}

async function deleteSong() {
  const storageRef = storage.ref();
  const songRef = storageRef.child(`songs/${props.song.original_name}`);

  await songRef.delete();

  await songsCollection.doc(props.song.docID).delete();

  props.removeSong(props.index);
}
</script>

<template>
  <div class="border border-gray-200 p-3 mb-4 rounded">
    <div v-show="!state.showForm">
      <h4 class="inline-block text-2xl font-bold">{{ song.modified_name }}</h4>
      <button
        class="ml-1 py-1 px-2 text-sm rounded text-white bg-red-600 float-right"
        @click.prevent="deleteSong"
      >
        <i class="fa fa-times"></i>
      </button>
      <button
        class="ml-1 py-1 px-2 text-sm rounded text-white bg-blue-600 float-right"
        @click.prevent="state.showForm = !state.showForm"
      >
        <i class="fa fa-pencil-alt"></i>
      </button>
    </div>
    <div v-show="state.showForm">
      <div
        class="text-white text-center font-bold p-4 mb-4"
        v-if="state.show_alert"
        :class="state.alert_variant"
      >
        {{ state.alert_message }}
      </div>
      <vee-form
        :validation-schema="state.schema"
        :initial-values="song"
        @submit="edit"
      >
        <div class="mb-3">
          <label class="inline-block mb-2">Song Title</label>
          <vee-field
            type="text"
            name="modified_name"
            class="block w-full py-1.5 px-3 text-gray-800 border border-gray-300 transition duration-500 focus:outline-none focus:border-black rounded"
            placeholder="Enter Song Title"
            @input="
              updateUnsavedFlag != undefined ? updateUnsavedFlag(true) : ''
            "
          />
          <ErrorMessage class="text-red-600" name="modified_name" />
        </div>
        <div class="mb-3">
          <label class="inline-block mb-2">Genre</label>
          <vee-field
            type="text"
            name="genre"
            class="block w-full py-1.5 px-3 text-gray-800 border border-gray-300 transition duration-500 focus:outline-none focus:border-black rounded"
            placeholder="Enter Genre"
            @input="
              updateUnsavedFlag != undefined ? updateUnsavedFlag(true) : ''
            "
          />
          <ErrorMessage class="text-red-600" name="genre" />
        </div>
        <button
          type="submit"
          class="py-1.5 px-3 rounded text-white bg-green-600"
          :disabled="state.in_submission"
        >
          Submit
        </button>
        <button
          type="button"
          class="py-1.5 px-3 rounded text-white bg-gray-600"
          :disabled="state.in_submission"
          @click.prevent="state.showForm = false"
        >
          Go Back
        </button>
      </vee-form>
    </div>
  </div>
</template>

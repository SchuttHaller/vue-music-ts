<script setup lang="ts">
import { onBeforeUnmount, reactive } from "vue";
import { storage, auth, songsCollection } from "@/includes/firebase";

interface Props {
  addSong: (song: any) => void;
}

const props = defineProps<Props>();

interface State {
  uploads: Array<any>;
  is_dragover: boolean;
}

const state = reactive<State>({
  is_dragover: false,
  uploads: [],
});

function upload($event: any) {
  state.is_dragover = false;
  const files = $event.dataTransfer
    ? [...$event.dataTransfer.files]
    : [...$event.target.files];

  files.forEach((file) => {
    if (file.type !== "audio/mpeg") {
      return;
    }

    if (!navigator.onLine) {
      state.uploads.push({
        task: {},
        current_progress: 100,
        name: file.name,
        variant: "bg-red-400",
        icon: "fas fa-times",
        text_class: "text-red-400",
      });
      return;
    }

    const storageRef = storage.ref(); // music-c2596.appspot.com
    const songsRef = storageRef.child(`songs/${file.name}`); // music-c2596.appspot.com/songs/example.mp3
    const task = songsRef.put(file);

    const uploadIndex =
      state.uploads.push({
        task,
        current_progress: 0,
        name: file.name,
        variant: "bg-blue-400",
        icon: "fas fa-spinner fa-spin",
        text_class: "",
      }) - 1;

    task.on(
      "state_changed",
      (snapshot) => {
        const progress =
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        state.uploads[uploadIndex].current_progress = progress;
      },
      () => {
        state.uploads[uploadIndex].variant = "bg-red-400";
        state.uploads[uploadIndex].icon = "fas fa-times";
        state.uploads[uploadIndex].text_class = "text-red-400";
        // console.log(error);
      },
      async () => {
        const song = {
          uid: auth.currentUser?.uid,
          display_name: auth.currentUser?.displayName,
          original_name: task.snapshot.ref.name,
          modified_name: task.snapshot.ref.name,
          genre: "",
          url: "",
          comment_count: 0,
        };

        song.url = await task.snapshot.ref.getDownloadURL();
        const songRef = await songsCollection.add(song);
        const songSnapshot = await songRef.get();

        props.addSong(songSnapshot);

        state.uploads[uploadIndex].variant = "bg-green-400";
        state.uploads[uploadIndex].icon = "fas fa-check";
        state.uploads[uploadIndex].text_class = "text-green-400";
      }
    );
  });
}

function cancelUploads() {
  state.uploads.forEach((upload) => {
    upload.task.cancel();
  });
}

onBeforeUnmount(() => {
  state.uploads.forEach((upload) => {
    upload.task.cancel();
  });
});
</script>

<template>
  <div class="bg-white rounded border border-gray-200 relative flex flex-col">
    <div class="px-6 pt-6 pb-5 font-bold border-b border-gray-200">
      <span class="card-title">Upload</span>
      <i class="fas fa-upload float-right text-green-400 text-2xl"></i>
    </div>
    <div class="p-6">
      <!-- Upload Dropbox -->
      <div
        class="w-full px-10 py-20 rounded text-center cursor-pointer border border-dashed border-gray-400 text-gray-400 transition duration-500 hover:text-white hover:bg-green-400 hover:border-green-400 hover:border-solid"
        :class="{
          'bg-green-400 border-green-400 border-solid': state.is_dragover,
        }"
        @drag.prevent.stop=""
        @dragstart.prevent.stop=""
        @dragend.prevent.stop="state.is_dragover = false"
        @dragover.prevent.stop="state.is_dragover = true"
        @dragenter.prevent.stop="state.is_dragover = true"
        @dragleave.prevent.stop="state.is_dragover = false"
        @drop.prevent.stop="upload($event)"
      >
        <h5>Drop your files here</h5>
      </div>
      <input type="file" multiple @change="upload($event)" />
      <hr class="my-6" />
      <!-- Progess Bars -->
      <div class="mb-4" v-for="upload in state.uploads" :key="upload.name">
        <!-- File Name -->
        <div class="font-bold text-sm" :class="upload.text_class">
          <i :class="upload.icon"></i> {{ upload.name }}
        </div>
        <div class="flex h-4 overflow-hidden bg-gray-200 rounded">
          <!-- Inner Progress Bar -->
          <div
            class="transition-all progress-bar"
            :class="upload.variant"
            :style="{ width: upload.current_progress + '%' }"
          ></div>
        </div>
      </div>
    </div>
  </div>
</template>

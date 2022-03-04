<script setup lang="ts">
import { reactive } from "vue";
import { onBeforeRouteLeave } from "vue-router";
import AppUpload from "@/components/Upload.vue";
import CompositionItem from "@/components/CompositionItem.vue";
import { songsCollection, auth } from "@/includes/firebase";
import { useI18n } from "vue-i18n";

const { t } = useI18n();

interface State {
  songs: Array<any>;
  unsavedFlag: boolean;
}

const state = reactive<State>({
  songs: [],
  unsavedFlag: false,
});

function updateSong(i: number, values: any) {
  state.songs[i].modified_name = values.modified_name;
  state.songs[i].genre = values.genre;
}

function removeSong(i: number) {
  state.songs.splice(i, 1);
}

function addSong(document: any) {
  const song = {
    ...document.data(),
    docID: document.id,
  };

  state.songs.push(song);
}

function updateUnsavedFlag(value: boolean) {
  state.unsavedFlag = value;
}

onBeforeRouteLeave((to, from, next) => {
  if (!state.unsavedFlag) {
    next();
  } else {
    // eslint-disable-next-line no-alert, no-restricted-globals
    const leave = confirm(
      "You have unsaved changes. Are you sure you want to leave?"
    );
    next(leave);
  }
});

const snapshot = await songsCollection
  .where("uid", "==", auth.currentUser?.uid)
  .get();

snapshot.forEach(addSong);
</script>

<template>
  <section class="container mx-auto mt-6">
    <div class="md:grid md:grid-cols-3 md:gap-4">
      <div class="col-span-1">
        <app-upload ref="upload" :addSong="addSong" />
      </div>
      <div class="col-span-2">
        <div
          class="bg-white rounded border border-gray-200 relative flex flex-col"
        >
          <div class="px-6 pt-6 pb-5 font-bold border-b border-gray-200">
            <span class="card-title">{{ t("manage.my_songs") }}</span>
            <i
              class="fa fa-compact-disc float-right text-green-400 text-2xl"
            ></i>
          </div>
          <div class="p-6">
            <!-- Composition Items -->
            <composition-item
              v-for="(song, i) in state.songs"
              :key="song.docID"
              :song="song"
              :updateSong="updateSong"
              :index="i"
              :removeSong="removeSong"
              :updateUnsavedFlag="updateUnsavedFlag"
            />
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

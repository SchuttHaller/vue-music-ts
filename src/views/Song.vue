<script setup lang="ts">
import { songsCollection, auth, commentsCollection } from "@/includes/firebase";
import { computed, reactive, watch } from "vue";
import { useStore } from "@/store";
import { useRoute, useRouter } from "vue-router";
import { useForm } from "vee-validate";
import { ActionTypes } from "@/store/actions";
import { useI18n } from "vue-i18n";

const router = useRouter();
const route = useRoute();
const store = useStore();
const { handleSubmit } = useForm();
const { t } = useI18n();

interface State {
  song: any;
  schema: any;
  comment_in_submission: boolean;
  comment_show_alert: boolean;
  comment_alert_variant: string;
  comment_alert_message: string;
  comments: Array<any>;
  sort: string;
}

const state = reactive<State>({
  song: {},
  schema: {
    comment: "required|min:3",
  },
  comment_in_submission: false,
  comment_show_alert: false,
  comment_alert_variant: "bg-blue-500",
  comment_alert_message: "Please wait! Your comment is being submitted",
  comments: [],
  sort: "1",
});

const route_id = Array.isArray(route.params.id)
  ? route.params.id.join("")
  : route.params.id;

// computed props
const userLoggedIn = computed(() => {
  return store.state.userLoggedIn;
});
const sortedComments = computed(() => {
  return state.comments.slice().sort((a, b) => {
    if (state.sort === "1") {
      return (
        new Date(b.datePosted).getTime() - new Date(a.datePosted).getTime()
      );
    }
    return new Date(a.datePosted).getTime() - new Date(b.datePosted).getTime();
  });
});

async function addComment(values: any, { resetForm }: any) {
  state.comment_in_submission = true;
  state.comment_show_alert = true;
  state.comment_alert_variant = "bg-blue-500";
  state.comment_alert_message = "Please wait! Your comment is being submitted";

  const comment = {
    content: values.comment,
    datePosted: new Date().toString(),
    sid: route_id,
    name: auth.currentUser?.displayName,
    uid: auth.currentUser?.uid,
  };

  await commentsCollection.add(comment);

  state.song.comment_count += 1;
  await songsCollection.doc(route_id).update({
    comment_count: state.song.comment_count,
  });

  getComments();

  state.comment_in_submission = false;
  state.comment_alert_variant = "bg-green-500";
  state.comment_alert_message = "Comment added!";

  resetForm();
}

const onSubmit = handleSubmit(addComment);

async function getComments() {
  const snapshots = await commentsCollection.where("sid", "==", route_id).get();

  state.comments = [];

  snapshots.forEach((doc) => [
    state.comments.push({
      docID: doc.id,
      ...doc.data(),
    }),
  ]);
}

function newSong(song: any) {
  store.dispatch(ActionTypes.Player_SetNewSong, song);
}

async function start() {
  const docSnapshot = await songsCollection.doc(route_id).get();

  if (!docSnapshot.exists) {
    router.push({ name: "home" });
    return;
  }

  const { sort } = route.query;

  // eslint-disable-next-line no-param-reassign
  state.sort = sort === "1" || sort === "2" ? sort : "1";

  // eslint-disable-next-line no-param-reassign
  state.song = docSnapshot.data();
  getComments();
}

watch(
  () => state.sort,
  (currentValue) => {
    if (currentValue === route.query.sort) {
      return;
    }

    router.push({
      query: {
        sort: currentValue,
      },
    });
  }
);

start();
</script>

<template>
  <main>
    <!-- Music Header -->
    <section class="w-full mb-8 py-14 text-center text-white relative">
      <div
        class="absolute inset-0 w-full h-full box-border bg-contain music-bg"
        style="background-image: url(/assets/img/song-header.png)"
      ></div>
      <div class="container mx-auto flex items-center">
        <!-- Play/Pause Button -->
        <button
          type="button"
          class="z-50 h-24 w-24 text-3xl bg-white text-black rounded-full focus:outline-none"
          @click.prevent="newSong(state.song)"
          id="play-button"
        >
          <i class="fas fa-play"></i>
        </button>
        <div class="z-50 text-left ml-8">
          <!-- Song Info -->
          <div class="text-3xl font-bold">{{ state.song.modified_name }}</div>
          <div>{{ state.song.genre }}</div>
          <div class="song-price">{{ $n(1, "currency", "ja") }}</div>
        </div>
      </div>
    </section>
    <!-- Form -->
    <section class="container mx-auto mt-6" id="comments">
      <div
        class="bg-white rounded border border-gray-200 relative flex flex-col"
      >
        <div class="px-6 pt-6 pb-5 font-bold border-b border-gray-200">
          <!-- Comment Count -->
          <span class="card-title">
            {{
              t("song.comment_count", {
                count: state.song.comment_count,
              })
            }}
          </span>
          <i class="fa fa-comments float-right text-green-400 text-2xl"></i>
        </div>
        <div class="p-6">
          <div
            class="text-white text-center font-bold p-4 mb-4"
            v-if="state.comment_show_alert"
            :class="state.comment_alert_variant"
          >
            {{ state.comment_alert_message }}
          </div>
          <vee-form
            :validation-schema="state.schema"
            @submit="onSubmit"
            v-if="userLoggedIn"
          >
            <vee-field
              as="textarea"
              name="comment"
              class="block w-full py-1.5 px-3 text-gray-800 border border-gray-300 transition duration-500 focus:outline-none focus:border-black rounded mb-4"
              placeholder="Your comment here..."
            ></vee-field>
            <ErrorMessage class="text-red-600" name="comment" />
            <button
              type="submit"
              class="py-1.5 px-3 rounded text-white bg-green-600 block"
              :disabled="state.comment_in_submission"
            >
              Submit
            </button>
          </vee-form>
          <!-- Comment Sorting -->
          <select
            v-model="state.sort"
            class="block mt-4 py-1.5 px-3 text-gray-800 border border-gray-300 transition duration-500 focus:outline-none focus:border-black rounded"
          >
            <option value="1">Latest</option>
            <option value="2">Oldest</option>
          </select>
        </div>
      </div>
    </section>
    <!-- Comments -->
    <ul class="container mx-auto">
      <li
        class="p-6 bg-gray-50 border border-gray-200"
        v-for="comment in sortedComments"
        :key="comment.docID"
      >
        <!-- Comment Author -->
        <div class="mb-5">
          <div class="font-bold">{{ comment.name }}</div>
          <time>{{ comment.datePosted }}</time>
        </div>

        <p>{{ comment.content }}</p>
      </li>
    </ul>
  </main>
</template>

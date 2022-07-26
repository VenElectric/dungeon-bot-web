<script setup lang="ts">
import { ref } from "vue";
import { SignInAnon } from "../firesinit";
import Button from "primevue/button";
import { useRouter, useRoute } from "vue-router";

const router = useRouter();
const route = useRoute();

const characterName = ref("");

async function signIn() {
  await SignInAnon(characterName.value);
  router.push({ path: `/session/${route.params.id}` });
}
</script>

<template>
  <div class="flex justify-center">
    <div
      class="flex flex-col self-center shadow-2xl bg-gradient-to-b from-gray-400 rounded-lg mt-60"
    >
      <div class="flex-initial p-5">
        <label class="flex self-start" for="email">Your Name</label>
        <input
          class="flex border-2 self-end placeholder-gray-400 rounded-md h-10 w-80 mt-5"
          type="email"
          name="email"
          placeholder="Your Name"
          v-model="characterName"
        />
      </div>
      <Button
        class="border-2 p-4 m-4 transition duration-500 ease-in-out bg-gray-200 border-gray-400 hover:bg-blue-200"
        @click="signIn"
      >
        Enter
      </Button>
    </div>
  </div>
</template>

<style>
.user {
  height: 50px;
}
</style>

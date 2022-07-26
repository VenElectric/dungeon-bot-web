<script setup lang="ts">
import { AuthState, SignInAnon } from "../firesinit";
import Button from "primevue/button";

const { user, error, isAuthenticated } = AuthState();
</script>

<template>
  <div v-if="isAuthenticated">
    <h2>{{ user?.uid }}</h2>
  </div>
  <div v-else>
    <h2>Not Authenticated!</h2>
  </div>
</template>

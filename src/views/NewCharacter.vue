<script setup lang="ts">
import MainStats from "../components/stat_sheet/MainStats.vue";
import { ref } from "vue";

const mainStats = ref();
const inventory = ref();
const abilityScores = ref();
const feats = ref();
const traits = ref();
const health = ref();
const moveMent = ref();
const savingThrows = ref();
const senses = ref();
const skills = ref();
const spells = ref();
</script>
<template>
  <div>
    <MainStats></MainStats>
  </div>
</template>

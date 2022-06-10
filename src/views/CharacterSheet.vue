<script setup lang="ts">
import MainStats from "../components/stat_sheet/MainStats.vue";
import AbilityScores from "../components/stat_sheet/AbilityScores.vue";
import FeaturesTraits from "../components/stat_sheet/FeaturesTraits.vue";
import Health from "../components/stat_sheet/Health.vue";
import Inventory from "../components/stat_sheet/Inventory.vue";
import Movement from "../components/stat_sheet/Movement.vue";
import SavingThrows from "../components/stat_sheet/SavingThrows.vue";
import Senses from "../components/stat_sheet/Senses.vue";
import SkillList from "../components/stat_sheet/SkillList.vue";
import SpellBook from "../components/stat_sheet/SpellBook.vue";
import StatBox from "../components/stat_sheet/StatBox.vue";
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

<script setup lang="ts">
import { PropType, defineProps, ref } from "vue";
import {
  AbilityScores,
  AbilityScoresObj,
} from "../../Interfaces/Common/AbilityScores";

const props = defineProps({
  abilityScoreValues: {
    type: Object as PropType<Record<string, AbilityScoresObj>>,
    required: true,
  },
});

const abilityScoreRef = ref(props.abilityScoreValues);
</script>

<template>
  <div class="main">
    <div
      class="inputgroup"
      :data-tool-tip="key"
      v-for="key in Object.keys(AbilityScores)"
      :key="key"
    >
      <input id="text" type="text" class="text-bubble" />
      <div class="plus">
        <input id="mod" type="text" class="mod-bubble" />
      </div>
    </div>
    <div class="saving">
      <div v-for="key in Object.keys(AbilityScores)" :key="`${key}save`">
        <div>
          <input
            type="text"
            class="mod-bubble"
            :v-model="abilityScoreRef[key]"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.main {
  display: flex;
  justify-content: center;
  border: 3px double black;
  flex-flow: row;
  max-width: 50%;
  flex-wrap: wrap;
}
.saving {
  padding: 2rem;
  display: flex;
  flex-flow: row;
}
.saving::before {
  content: "Saving Throws";
}
.text-bubble {
  height: 2rem;
  width: 3rem;
  border: groove black;
  border-top-left-radius: 20px;
  border-top-right-radius: 2px;
  border-bottom-right-radius: 2px;
  border-bottom-left-radius: 8px;
  text-align: center;
  font-size: 1.2rem;
}
.mod-bubble {
  height: 1rem;
  width: 3rem;
  border: groove black;
  border-top-left-radius: 8px;
  border-top-right-radius: 2px;
  border-bottom-right-radius: 2px;
  border-bottom-left-radius: 8px;
  margin-top: 0.3rem;
  text-align: center;
  font-size: 1rem;
  padding: 0.2rem;
}
.plus {
  position: relative;
}
.plus::before {
  content: "+";
  font-size: 1.5em;
  position: absolute;
  left: -0.8em;
  top: 0.2em;
  display: flex;
  flex-flow: row;
  justify-content: center;
  align-items: center;
}
.inputgroup {
  display: flex;
  flex-flow: column;
  padding: 2rem;
}
.inputgroup[data-tool-tip]::before {
  content: attr(data-tool-tip);
  font-size: 1em;
}
</style>

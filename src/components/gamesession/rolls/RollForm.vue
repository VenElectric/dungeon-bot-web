<script setup lang="ts">
import { ref, defineProps, defineEmits } from "vue";
import Button from "primevue/button";
import InputText from "primevue/inputtext";
const props = defineProps({
  rollName: { type: String, required: true },
  rollValue: { type: String, required: true },
});
const emits = defineEmits(["save"]);
const errorClass = ref("");
const showError = ref(false);
const addRollName = ref(props.rollName);
const addRollValue = ref(props.rollValue);

const saveRoll = () => {
  console.log(addRollValue);
  emits("save");
};
</script>

<template>
  <div>
    <div class="flex flex-column justify-content-center">
      <InputText placeholder="Roll Name" v-model="addRollName" />
      <InputText
        placeholder="d20+3-2"
        v-model="addRollValue"
        v-tooltip.top="'The dice and modifiers to be rolled I.E. d4+d20+3'"
        :class="errorClass"
      />
      <small id="username1-help" v-show="showError">
        Roll Format should be similar to: d20+3-4
      </small>
      <Button label="Save" @click="saveRoll" />
    </div>
  </div>
</template>

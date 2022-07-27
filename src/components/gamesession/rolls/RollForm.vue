<script setup lang="ts">
import { ref, computed } from "vue";
import Button from "primevue/button";
import InputText from "primevue/inputtext";
import { useToast } from "primevue/usetoast";

const toast = useToast();
const props = defineProps({
  rollName: { type: String, required: true },
  rollValue: { type: String, required: true },
  tryRoll: {type: Function, required: true}
});

//  rollName: string;
//   id: string;
//   rollValue: string;
const emits = defineEmits(["save"]);
const errorClass = ref("");
const showError = ref(false);
const rollNameRef = ref(props.rollName);
const rollValueRef = ref(props.rollValue);
const rollObjectRef = computed(() => {
  return { rollName: rollNameRef.value, rollValue: rollValueRef.value };
});

function errorMessage(rollValue: string) {
  const isValid = props.tryRoll(rollValue);
  if (isValid instanceof Error) {
    errorClass.value = "p-invalid";
    showError.value = true;
    toast.add({
      severity: "error",
      summary: "Invalid",
      detail: "Roll Format is Invalid",
      life: 3000,
    });
    return false;
  } else return true;
}

const saveRoll = () => {
  const isValidRoll = errorMessage(rollValueRef.value);
  if (!isValidRoll) return;
  emits("save",rollObjectRef);
};

</script>

<template>
  <div>
    <div class="flex flex-column justify-content-center">
      <InputText placeholder="Roll Name" v-model="rollNameRef " />
      <InputText
        placeholder="d20+3-2"
        v-model="rollValueRef"
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

<script setup lang="ts">
import ToolBar from "primevue/toolbar";
import Button from "primevue/button";
import OverlayPanel from "primevue/overlaypanel";
import ResetStore from "../ResetStore.vue";
import { defineProps, ref, PropType } from "vue";
import SpellForm from "./SpellForm.vue";
import { SpellObject } from "../../../Interfaces/Spells";

defineProps({
  resetSpells: {
    type: Function as PropType<() => void>,
    required: true,
  },
  emitUpdateAllSpells: {
    type: Function as PropType<() => void>,
    required: true,
  },
  addSpell: {
    type: Function as PropType<(data: SpellObject) => void>,
    required: true,
  },
  emitAddSpell: {
    type: Function,
    required: true,
  },
});

const overlayRef = ref();

function toggle(event: any) {
  (overlayRef.value as any).toggle(event);
}
</script>

<template>
  <ToolBar class="shadow-8">
    <template #start>
      <ResetStore
        label="Spells"
        :resetFunc="resetSpells"
        :emitFunc="emitUpdateAllSpells"
      />
    </template>
    <template #end>
      <Button
        type="button"
        label="Add Spell"
        @click="toggle"
        class="p-button-sm"
      />
      <OverlayPanel ref="overlayRef" :showCloseIcon="true" :dismissable="true">
        <SpellForm :toggle="toggle"></SpellForm>
      </OverlayPanel>
    </template>
  </ToolBar>
</template>

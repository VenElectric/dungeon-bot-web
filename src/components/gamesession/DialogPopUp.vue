<script setup lang="ts">
import { defineProps, PropType, watchEffect, ref } from "vue";
import { ComponentIs } from "./componentTypes";
import AddSpell from "./spells/AddSpell.vue";
import InitiativeData from "./initiative/InitiativeData.vue";
import SpellTargets from "./spells/SpellTargets.vue";
import EffectContainer from "./initiative/EffectContainer.vue";

const props = defineProps({
  index: {
    type: Number,
    required: true,
  },
  componentRef: {
    type: String as PropType<ComponentIs>,
    required: true,
  },
});

const renderComponent = ref(props.componentRef);
const indexRef = ref(props.index);

watchEffect(() => {
  renderComponent.value = props.componentRef;
  indexRef.value = props.index;
});

const componentToRender = (componentRef: ComponentIs) => {
  switch (componentRef) {
    case ComponentIs.AddSpell:
      return AddSpell;
    case ComponentIs.EffectContainer:
      return EffectContainer;
    case ComponentIs.InitiativeData:
      return InitiativeData;
    case ComponentIs.SpellTargets:
      return SpellTargets;
  }
};
</script>

<template>
  <component :is="componentToRender(renderComponent)" v-bind:index="indexRef" />
</template>

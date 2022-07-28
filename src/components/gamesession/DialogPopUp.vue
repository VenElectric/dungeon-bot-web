<script setup lang="ts">
import { defineProps, PropType, watchEffect, ref } from "vue";
import { ComponentIs } from "./componentTypes";
import SpellForm from "./spells/SpellForm.vue";
import InitiativeForm from "./initiative/InitiativeForm.vue"
import SpellTargets from "./spells/SpellTargets.vue"
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
  console.log(componentRef)
  switch (componentRef) {
    case ComponentIs.AddSpell:
      return SpellForm;
    case ComponentIs.EffectContainer:
      return EffectContainer;
    case ComponentIs.InitiativeForm:
      return InitiativeForm;
    case ComponentIs.SpellTargets:
      return SpellTargets;
    default:
      console.log("default")
  }
};
</script>

<template>
  <component :is="componentToRender(renderComponent)" v-bind:index="indexRef" />
</template>

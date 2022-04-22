<template>
  <em
    @click="toggle"
    style="font-size: 1.5em"
    v-badge="statusString"
    class="pi pi-exclamation-triangle"
  >
    <OverlayPanel ref="overLay" class="px-3">
      <EffectContainer :statusEffects="statusEffects"></EffectContainer>
    </OverlayPanel>
  </em>
</template>

<script lang="ts">
import { computed, defineComponent, PropType, ref } from "vue";
import { StatusEffect } from "../../../Interfaces/initiative";
import OverlayPanel from "primevue/overlaypanel";
import EffectContainer from "./EffectContainer.vue";

export default defineComponent({
  name: "SpellEffectIcon",
  components: { OverlayPanel, EffectContainer },
  props: {
    statusEffects: { type: Object as PropType<StatusEffect[]>, required: true },
  },
  setup(props) {
    const lengthNumber = ref(props.statusEffects.length);
    const statusString = computed(() => String(props.statusEffects.length));
    const overLay = ref();

    const toggle = (event: any) => {
      overLay.value.toggle(event);
    };

    return { statusString, lengthNumber, overLay, toggle };
  },
});
</script>

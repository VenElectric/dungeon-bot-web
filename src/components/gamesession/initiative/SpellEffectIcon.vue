<template>
  <em
    @click="toggle"
    style="font-size: 1.5em"
    v-badge="statusString"
    class="pi pi-exclamation-triangle"
  >
    <OverlayPanel ref="overLay" class="px-3">
      <h3 class="mt-0">Effects</h3>
      <div
        v-if="lengthNumber > 0"
        class="flex flex-column align-content-center"
      >
        <em v-for="status in statusEffects" :key="status.id">
          {{ status.spellName }}
        </em>
      </div>
      <div v-else>No Effects to Display</div>
    </OverlayPanel>
  </em>
</template>

<script lang="ts">
import { computed, defineComponent, PropType, ref } from "vue";
import { StatusEffect } from "../../../Interfaces/initiative";
import OverlayPanel from "primevue/overlaypanel";

export default defineComponent({
  name: "SpellEffectIcon",
  components: { OverlayPanel },
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

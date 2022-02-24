<template>
  <h3 class="mt-0">Effects</h3>
  <div v-if="lengthNumber > 0" class="flex flex-column align-content-center">
    <em v-for="status in statusEffects" :key="status.id">
      {{ status.spellName }}
    </em>
  </div>
  <div v-else>No Effects to Display</div>
</template>

<script lang="ts">
import { computed, defineComponent, PropType, reactive, watch } from "vue";
import { StatusEffect } from "../../../Interfaces/initiative";
import Effect from "./Effect.vue";
import serverLogger from "../../../Utils/LoggingClass";
import { LoggingTypes, ComponentEnums } from "../../../Interfaces/LoggingTypes";

export default defineComponent({
  name: "EffectContainer",
  props: {
    statusEffects: { type: Array as PropType<StatusEffect[]>, required: true },
  },
  setup(props) {
    const lengthNumber = computed(() => props.statusEffects.length);
    serverLogger(
      LoggingTypes.debug,
      `container created`,
      ComponentEnums.EFFECTCONTAINER
    );
    // watch(
    //   () => props.statusEffects,
    //   () => {
    //     serverLogger(
    //       LoggingTypes.debug,
    //       `watch triggered`,
    //       ComponentEnums.EFFECTCONTAINER
    //     );
    //     data.statusEffects = props.statusEffects;
    //   },
    //   { deep: true }
    // );

    return { lengthNumber };
  },
});
</script>

<style scoped>
.effect-cage {
  display: flex;
  justify-content: space-around;
}
</style>

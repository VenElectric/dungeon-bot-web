<template>
  <PickList
    v-model="spellModel"
    dataKey="characterId"
    @move-all-to-source="() => store.changeAllCharacterToSource(index)"
    @move-all-to-target="() => store.changeAllCharacterToTarget(index)"
    @move-to-source="(e) => store.changeOneCharacterToSource(e, index)"
    @move-to-target="(e) => store.changeOneCharacterToTarget(e, index)"
    :responsive="true"
    style="font-size: 0.8em"
  >
    <template #sourceheader> Characters Not Affected </template>
    <template #targetheader> Affected Characters </template>
    <template #item="record">
      <div :key="record.item.characterId">{{ record.item.characterName }}</div>
    </template>
  </PickList>
</template>

<script lang="ts">
import { SpellObject } from "../../../Interfaces/initiative";
import { IStore } from "../../../data/types";
import {
  defineComponent,
  ref,
  PropType,
  inject,
  watch,
  computed,
  watchEffect,
} from "vue";
import PickList from "primevue/picklist";
import serverLogger from "../../../Utils/LoggingClass";
import { LoggingTypes, ComponentEnums } from "../../../Interfaces/LoggingTypes";

export default defineComponent({
  name: "SpellRecord",
  components: { PickList },
  props: {
    spell: { type: Object as PropType<SpellObject>, required: true },
    index: { type: Number, required: true },
  },
  setup(props) {
    const store = inject<IStore>("store");
    const spellModel = ref([
      props.spell.characterIds.source,
      props.spell.characterIds.target,
    ]);
    const op = ref(null);
    const updateRef = ref(null);

    watchEffect(
      () =>
        (spellModel.value = [
          props.spell.characterIds.source,
          props.spell.characterIds.target,
        ])
    );

    if (store === undefined) {
      serverLogger(
        LoggingTypes.alert,
        `failed to inject store`,
        ComponentEnums.SPELLRECORD
      );
      throw new Error("Failed to inject store");
    }

    function toggle(event: any) {
      (op.value as any).toggle(event);
    }

    function toggleUpdate(event: any) {
      (updateRef.value as any).toggle(event);
    }

    function handleClose(event: any, data: any) {
      serverLogger(
        LoggingTypes.info,
        `updating spell record`,
        ComponentEnums.SPELLRECORD,
        props.spell.id
      );
      toggleUpdate(event);
      store?.updateSpell(
        data.effectName,
        data.effectDescription,
        data.durationTime,
        data.durationType,
        data.index,
        true
      );
    }
    return {
      store,
      spellModel,
      op,
      toggle,
      toggleUpdate,
      updateRef,
      handleClose,
    };
  },
});
</script>

<style scoped>
.spell-row {
  display: flex;
  width: 100%;
  flex-direction: row;
  align-items: center;
  justify-content: space-evenly;
}
.include-hr {
  display: flex;
  flex-direction: column;
  width: 100%;
  align-items: center;
}
hr {
  width: 100%;
}
</style>

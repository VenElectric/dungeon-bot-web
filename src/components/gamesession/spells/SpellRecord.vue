<template>
  <PickList
    v-model="spellModel"
    dataKey="characterId"
    listStyle="height:200px"
    @move-all-to-source="() => store.changeAllCharacterToSource(index)"
    @move-all-to-target="() => store.changeAllCharacterToTarget(index)"
    @move-to-source="(e) => store.changeOneCharacterToSource(e, index)"
    @move-to-target="(e) => store.changeOneCharacterToTarget(e, index)"
    :responsive="true"
    breakpoint="460px"
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
import { CharacterStatusFirestore } from "../../../Interfaces/initiative";
import { IStore } from "../../../data/types";
import { defineComponent, ref, PropType, inject, watchEffect } from "vue";
import PickList from "primevue/picklist";
import serverLogger from "../../../Utils/LoggingClass";
import { LoggingTypes, ComponentEnums } from "../../../Interfaces/LoggingTypes";

export default defineComponent({
  name: "SpellRecord",
  components: { PickList },
  props: {
    characterIds: {
      type: Object as PropType<CharacterStatusFirestore>,
      required: true,
    },
    index: { type: Number, required: true },
  },
  setup(props) {
    const store = inject<IStore>("store");
    const spellModel = ref([
      props.characterIds.source,
      props.characterIds.target,
    ]);

    watchEffect(() => {
      if (store) {
        spellModel.value = [
          store.store.spells[props.index].characterIds.source,
          store.store.spells[props.index].characterIds.target,
        ];
      }
    });

    if (store === undefined) {
      serverLogger(
        LoggingTypes.alert,
        `failed to inject store`,
        ComponentEnums.SPELLRECORD
      );
      throw new Error("Failed to inject store");
    }

    return {
      store,
      spellModel,
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

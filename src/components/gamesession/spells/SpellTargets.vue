<template>
  <PickList
    v-model="spellModel"
    dataKey="id"
    listStyle="height:50px"
    @move-all-to-source="() => allToSource(index)"
    @move-all-to-target="() => allToTarget(index)"
    @move-to-source="(e) => oneToSource(e, index)"
    @move-to-target="(e) => oneToTarget(e, index)"
    :responsive="true"
    style="font-size: 0.7em"
  >
    <template #sourceheader> Characters Not Affected </template>
    <template #targetheader> Affected Characters </template>
    <template #item="record">
      <div :key="record.item.id">
        {{ record.item.characterName }}
      </div>
    </template>
  </PickList>
</template>

<script setup lang="ts">
import { CharacterPickListEvent } from "../../../data/types";
import { defineProps, ref, watchEffect } from "vue";
import PickList from "primevue/picklist";
import serverLogger from "../../../Utils/LoggingClass";
import { LoggingTypes, ComponentEnums } from "../../../Interfaces/LoggingTypes";
import SPELL_FUNCS from "../../../data/spellStore";
import INITIATIVE_FUNCS from "../../../data/initiativeStore";

const {
  GETTERS: spellGetters,
  SETTERS: spellSetters,
  EMITS: spellEmits,
} = SPELL_FUNCS;

const {
  GETTERS: initGetters,
  SETTERS: initSetters,
  EMITS: initEmits,
} = INITIATIVE_FUNCS;

const props = defineProps({
  index: { type: Number, required: true },
});
const spellModel = ref(spellGetters.getCharacterIds(props.index));

const allToSource = (index: number) => {
  spellSetters.changeAllCharacterToSource(index);
  const spellRecord = spellGetters.getSpellbyIndex(index);
  spellEmits.emitUpdateSpell(spellRecord);
  initEmits.updateAllInitiative();
};

const allToTarget = (index: number) => {
  spellSetters.changeAllCharacterToTarget(index);
  const record = spellGetters.getSpellbyIndex(index);
  spellEmits.emitUpdateSpell(record);
  initEmits.updateAllInitiative();
};

const oneToSource = (e: CharacterPickListEvent, index: number) => {
  spellSetters.changeOneCharacterToSource(e, index);
  const record = spellGetters.getSpellbyIndex(index);
  spellEmits.emitUpdateSpell(record);
  const initRecord = initGetters.getInitiativeById(e.items[0].id);
  initEmits.updateRecordInitiative(initRecord);
};

const oneToTarget = (e: CharacterPickListEvent, index: number) => {
  spellSetters.changeOneCharacterToTarget(e, index);
  const record = spellGetters.getSpellbyIndex(index);
  spellEmits.emitUpdateSpell(record);
  const initRecord = initGetters.getInitiativeById(e.items[0].id);
  initEmits.updateRecordInitiative(initRecord);
};
watchEffect(() => {
  spellModel.value = spellGetters.getCharacterIds(props.index);
});
</script>

<style scoped>
.p-picklist .p-picklist-buttons .p-button {
  width: 1.5em !important;
  height: 1.5em !important;
}
</style>

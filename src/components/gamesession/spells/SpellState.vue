<script setup lang="ts">
import { defineProps, ref, onBeforeUnmount, PropType } from "vue";
import { SpellStoreInterface } from "../../../data/types";
import { SpellObject } from "../../../Interfaces/Spells";
import SpellTargets from "./SpellTargets.vue";
import ConfirmPopup from "primevue/confirmpopup";
import Toast from "primevue/toast";
import DataTable from "primevue/datatable";
import Column from "primevue/column";
import SpellMobileMenu from "./SpellMobileMenu.vue";
import EditDeleteButtons from "../EditDeleteButtons.vue";
import ActionsToolbar from "./ActionsToolbar.vue";
import { ComponentIs } from "../componentTypes";
import OverlayPanel from "primevue/overlaypanel";
import Button from "primevue/button";
import MobileMenu from "./MobileMenu.vue";
import { ReturnTypes } from "../MenuItemSetup";

const props = defineProps({
  spellSetters: {
    type: Object as PropType<SpellStoreInterface["SETTERS"]>,
    required: true,
  },
  spellGetters: {
    type: Object as PropType<SpellStoreInterface["GETTERS"]>,
    required: true,
  },
  spellEmits: {
    type: Object as PropType<SpellStoreInterface["EMITS"]>,
    required: true,
  },
  spellData: {
    type: Object as PropType<SpellObject[]>,
    required: true,
  },
});

const pickListRef = ref();

function togglePickList(event: any) {
  (pickListRef.value as any).toggle(event);
}

onBeforeUnmount(() => {
  props.spellSetters.resetSpells();
});
</script>

<template>
  <div class="w-auto">
    <toast />
    <confirm-popup />
    <actions-toolbar
      :reset-spells="spellSetters.resetSpells"
      :emit-update-all-spells="spellEmits.emitUpdateAllSpells"
      :add-spell="spellSetters.addSpell"
      :emit-add-spell="spellEmits.emitNewSpell"
    ></actions-toolbar>
    <DataTable
      :value="spellData"
      :paginator="true"
      :rows="10"
      class="shadow-8 p-datatable-sm"
      responsiveLayout="scroll"
    >
      <Column header="Spell Name">
        <template #body="record">
          <div>{{ record.data.effectName }}</div>
        </template>
      </Column>
      <Column header="Duration">
        <template #body="record">
          <div>
            {{ `${record.data.durationTime} ${record.data.durationType}` }}
          </div>
        </template>
      </Column>
      <Column header="Targets" field="characterIds" class="column-large-screen">
        <template #body="{ index }">
          <Button
            type="button"
            label="Targets"
            @click="(e) => togglePickList(e)"
            class="p-button-sm"
          />
          <OverlayPanel
            ref="pickListRef"
            :showCloseIcon="true"
            :dismissable="true"
          >
            <spell-targets :index="index"></spell-targets>
          </OverlayPanel>
        </template>
      </Column>
      <Column header="Edit/Delete" class="column-large-screen">
        <template #body="{ index }">
          <edit-delete-buttons
            :delete-item="spellSetters.deleteSpell"
            :index="index"
            :get-record="spellGetters.getSpellbyIndex"
            :save-function="spellSetters.updateSpell"
            :componentType="ComponentIs.AddSpell"
            :emit-delete-function="spellEmits.emitDeleteSpell"
            :emit-save-function="spellEmits.emitUpdateSpell"
          ></edit-delete-buttons>
        </template>
      </Column>
      <Column header="Spell Options" class="column-small-screen">
        <template #body="{ index }">
          <mobile-menu
            :index="index"
            :component-type="ReturnTypes.SPELLS"
          ></mobile-menu>
        </template>
      </Column>
    </DataTable>
  </div>
</template>

<style scoped>
.table-header {
  font-size: 2em;
}
.spell-items {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
}
.spell-item {
  display: flex;
  justify-content: center;
  width: 100%;
  box-shadow: inset 0 1px 4px 0 rgba(77, 74, 74, 0.596),
    2px 1px 0 1px rgba(77, 74, 74, 0.247), -1px -1px 0 0 rgba(77, 74, 74, 0.247);
  border: 2px solid rgba(128, 128, 128, 0.555);
  background: linear-gradient(90deg, grey 0%, rgba(77, 74, 74, 0.247) 100%);
}
.spell-item:hover {
  border: 2px solid black;
}
.p-multiselect {
  width: 10vw;
}
:deep(.column-small-screen) {
  display: none;
}
@media only screen and (max-width: 480px) {
  :deep(.column-large-screen) {
    display: none;
  }
  :deep(.column-small-screen) {
    display: flex;
    justify-content: center;
  }
}
</style>

<script setup lang="ts">
import { computed, defineProps, ref } from "vue";
import { InitiativeObject } from "../../../Interfaces/initiative";
import ClickIcon from "../../ClickIcon.vue";
import { useToast } from "primevue/usetoast";
import InputText from "primevue/inputtext";
import InputNumber from "primevue/inputnumber";
import Button from "primevue/button";
import { v4 as uuidv4 } from "uuid";
import ROLL_FUNCS from "../../../data/rollStore";
import INITIATIVE_FUNCS from "../../../data/initiativeStore";
import SPELL_FUNCS from "../../../data/spellStore";

const props = defineProps({
  index: {
    type: Number,
    required: false,
  },
  toggle: { type: Function, required: false },
});

const toast = useToast();

const {
  GETTERS: initGetters,
  SETTERS: initSetters,
  EMITS: initEmits,
} = INITIATIVE_FUNCS;

const {
  GETTERS: spellGetters,
  SETTERS: spellSetters,
  EMITS: spellEmits,
} = SPELL_FUNCS;

const {
  GETTERS: rollGetters,
  SETTERS: rollSetters,
  EMITS: rollEmits,
} = ROLL_FUNCS;

const record = ref<InitiativeObject>({
  id: "",
  characterName: "",
  initiative: 0,
  initiativeModifier: 0,
  isNpc: false,
  statusEffects: [],
  roundOrder: 0,
  isCurrent: false,
});

if (props.index !== undefined) {
  record.value = initGetters.getInitbyIndex(props.index);
}

const roll = ref(false);

const npcClass = computed(() =>
  record.value.isNpc ? "p-button-success" : "p-button-help"
);

function submitData(e: any) {
  if (props.index !== undefined) {
    initSetters.updateCharacterRecord(record.value);
    initEmits.updateRecordInitiative(record.value);
  } else {
    record.value.id = uuidv4();
    initSetters.addCharacter(record.value);
    resetSorted();
    spellSetters.initializeSpellStoreCharacterIds(record.value);
    spellEmits.emitUpdateAllSpells();
    initEmits.createNewInitiative(record.value);
  }
  if (props.toggle) {
    props.toggle(e);
  }
}

function updateRoll() {
  const rollTotal = rollGetters.rollDice("d20");
  record.value.initiative = rollTotal.total + record.value.initiativeModifier;
  initSetters.updateSorted(false);
  toast.add({
    severity: "info",
    summary: "Roll Results",
    detail: `Dice Roll: ${rollTotal} and Initiative Total: ${record.value.initiative}`,
    life: 3000,
  });
  resetSorted();
}

function resetSorted() {
  initSetters.updateSorted(false);
  toast.add({
    severity: "warn",
    summary: "Warning Message",
    detail: "Initiative has been reset. Please click Round Start to resort.",
    life: 3000,
  });
}

function updateNPC() {
  record.value.isNpc = !record.value.isNpc;
}
</script>

<template>
  <div class="p-grid p-field m-2">
    <div class="p-inputgroup p-col input-value">
      <Button icon="pi pi-info-circle" class="p-button-sm p-button-success" />
      <InputText
        id="characterName"
        type="text"
        placeholder="Character Name"
        v-model="record.characterName"
      />
      <Button
        id="NPC"
        class="p-button-sm"
        :class="npcClass"
        lable="NPC?"
        v-tooltip.top="'Character is NPC? ' + String(record.isNpc)"
        @click.stop="updateNPC"
        ><ClickIcon></ClickIcon>
      </Button>
    </div>
  </div>
  <div class="p-grid p-field m-2">
    <div class="p-inputgroup p-col input-value">
      <Button
        icon="pi pi-info-circle"
        class="p-button-sm p-button-success"
        v-tooltip.top="
          'Enter the d20 roll for your initiative + your modifier. Integers only'
        "
      />
      <InputNumber
        id="initiative"
        placeholder="Initiative Roll"
        v-model="record.initiative"
        :disabled="roll"
      />
      <Button
        id="roll"
        class="p-button-sm p-button-info"
        v-tooltip.top="
          'Click this to have the bot roll for you. Make sure to add your initiative modifier in first.'
        "
        @click="updateRoll"
      >
        <ClickIcon></ClickIcon>
      </Button>
    </div>
  </div>
  <div class="p-grid p-field m-2">
    <div class="p-inputgroup p-col input-value">
      <Button
        icon="pi pi-info-circle"
        class="p-button-sm p-button-success"
        v-tooltip.top="'Enter your initiative modifier. Integers only.'"
      />
      <InputNumber
        id="modifier"
        placeholder="Initiative Modifier"
        v-model="record.initiativeModifier"
        @change="resetSorted"
      />
    </div>
  </div>
  <Button
    label="Save"
    class="pi-button-primary m-2"
    @click.prevent="
      (e) => {
        submitData(e);
      }
    "
  />
</template>

<style></style>

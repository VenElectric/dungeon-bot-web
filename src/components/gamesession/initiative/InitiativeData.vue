<script setup lang="ts">
import { reactive, computed, defineProps, PropType, inject } from "vue";
import { InitiativeObject } from "../../../Interfaces/initiative";
import { InitiativeObjectEnums } from "../../../Interfaces/ContextEnums";
import serverLogger from "../../../Utils/LoggingClass";
import { LoggingTypes, ComponentEnums } from "../../../Interfaces/LoggingTypes";
import ClickIcon from "../../ClickIcon.vue";
import Toast from "primevue/toast";
import { useToast } from "primevue/usetoast";
import { IStore } from "@/src/data/types";
import InputText from "primevue/inputtext";
import InputNumber from "primevue/inputnumber";
import Button from "primevue/button";
import { v4 as uuidv4 } from "uuid";

const props = defineProps({
  saveCharacter: { type: Function, required: true },
  initiativeRecord: {
    type: Object as PropType<InitiativeObject>,
    required: false,
  },
});

const store = inject<IStore>("store");

if (store === undefined) {
  serverLogger(
    LoggingTypes.alert,
    `Failed to inject store`,
    ComponentEnums.INITIATIVESTATE
  );
  throw new Error("Failed to inject store");
}

const toast = useToast();

const data = reactive({
  id: props.initiativeRecord?.id || uuidv4(),
  characterName: props.initiativeRecord?.characterName || "",
  initiativeModifier: props.initiativeRecord?.initiativeModifier || 0,
  initiative: props.initiativeRecord?.initiative || 0,
  roll: false,
  npc: props.initiativeRecord?.isNpc || false,
  statusEffects: props.initiativeRecord?.statusEffects || [],
  roundOrder: props.initiativeRecord?.roundOrder || 0,
});
const npcClass = computed(() =>
  data.npc ? "p-button-success" : "p-button-help"
);

function handleChange(e: any, ObjectType: InitiativeObjectEnums) {
  serverLogger(
    LoggingTypes.debug,
    `updating reactive object init ${ObjectType}`,
    ComponentEnums.ADDINITIATIVE
  );
  switch (ObjectType) {
    case InitiativeObjectEnums.characterName:
      data.characterName = e;
      break;
    case InitiativeObjectEnums.initiative:
      data.initiative = e;
      break;
    case InitiativeObjectEnums.initiativeModifier:
      data.initiativeModifier = e;
      break;
  }
}
function updateRoll() {
  if (store) {
    const rollTotal = store.reRoll();
    data.initiative = rollTotal + data.initiativeModifier;
    toast.add({
      severity: "info",
      summary: "Roll Results",
      detail: `Dice Roll: ${rollTotal} and Initiative Total: ${data.initiative}`,
      life: 3000,
    });
  }
}

function updateNPC() {
  data.npc = !data.npc;
}
</script>

<template>
  <Toast />
  <div class="p-grid p-field m-2">
    <div class="p-inputgroup p-col input-value">
      <Button icon="pi pi-info-circle" class="p-button-sm p-button-success" />
      <InputText
        id="characterName"
        type="text"
        placeholder="Character Name"
        v-model="data.characterName"
      />
      <Button
        id="NPC"
        class="p-button-sm"
        :class="npcClass"
        lable="NPC?"
        v-tooltip.top="'Character is NPC? ' + String(data.npc)"
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
        v-model="data.initiative"
        :disabled="data.roll"
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
        v-model="data.initiativeModifier"
      />
    </div>
  </div>
  <Button
    label="Save"
    class="pi-button-primary m-2"
    @click.prevent="
      (e) => {
        saveCharacter(e, data);
      }
    "
  />
</template>

<template>
  <div class="p-grid p-field m-2">
    <div class="p-inputgroup p-col input-value">
      <Button icon="pi pi-info-circle" class="p-button-sm p-button-success" />
      <InputText
        id="characterName"
        type="text"
        placeholder="Character Name"
        :model-value="data.characterName"
        @update:model-value="
          (e:any) => handleChange(e, InitiativeObjectEnums.characterName)
        "
      />
      <Button
        id="NPC"
        class="p-button-sm"
        :class="npcClass"
        lable="NPC?"
        v-tooltip.top="'Character is NPC? ' + String(npc)"
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
        :model-value="data.initiative"
        @update:model-value="
          (e:any) => handleChange(e, InitiativeObjectEnums.initiative)
        "
        :disabled="roll"
      />
      <Button
        id="roll"
        class="p-button-sm"
        :class="rollClass"
        v-tooltip.top="
          'Roll For Me: ' +
          String(roll) +
          '\nInitiative value will be reset to 0 if set to true.'
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
        :model-value="data.initiativeModifier"
        @update:model-value="
          (e:any) => handleChange(e, InitiativeObjectEnums.initiativeModifier)
        "
      />
    </div>
  </div>
  <Button
    label="Save"
    class="pi-button-primary m-2"
    @click.prevent="
      (e) => {
        addCharacter(e, data, roll, npc);
      }
    "
  />
</template>

<script lang="ts">
import { defineComponent, ref, reactive, computed } from "vue";
import InputText from "primevue/inputtext";
import InputNumber from "primevue/inputnumber";
import Button from "primevue/button";
import ClickIcon from "../../ClickIcon.vue";
import { InitiativeObjectEnums } from "../../../Interfaces/Enums";
import serverLogger from "../../../Utils/LoggingClass";
import { LoggingTypes, ComponentEnums } from "../../../Interfaces/LoggingTypes";

export default defineComponent({
  name: "AddInitiative",
  components: { InputText, InputNumber, Button, ClickIcon },
  props: {
    addCharacter: { type: Function, required: true },
  },
  setup() {
    let data = reactive({
      characterName: "",
      initiativeModifier: 0,
      initiative: 0,
    });
    let roll = ref(false);
    let npc = ref(false);
    const rollClass = computed(() =>
      roll.value ? "p-button-success" : "p-button-help"
    );
    const npcClass = computed(() =>
      npc.value ? "p-button-success" : "p-button-help"
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
      roll.value = !roll.value;
    }

    function updateNPC() {
      npc.value = !npc.value;
    }

    return {
      roll,
      data,
      InitiativeObjectEnums,
      handleChange,
      npc,
      updateNPC,
      rollClass,
      npcClass,
      updateRoll,
    };
  },
});
</script>

<style scoped>
.input-value {
  width: 15em;
  height: 2em;
}
</style>

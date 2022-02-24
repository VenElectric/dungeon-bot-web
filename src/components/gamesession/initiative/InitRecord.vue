<template>
  <Card class="p-d-flex p-flex-column">
    <template #content>
      <div>
        <span v-tooltip.top="'Character name'">
          <InputText
            id="characterName"
            :model-value="data.characterName"
            @update:model-value="
              (e) => handleChange(e, InitiativeObjectEnums.characterName)
            "
          />
        </span>
        <label for="initiative">Initiative Total</label>
      </div>
      <div>
        <span
          v-tooltip.top="
            'Enter the d20 roll for your initiative + your modifier. Integers only'
          "
        >
          <InputNumber
            id="initiative"
            :model-value="data.initiative"
            @update:model-value="
              (e) => handleChange(e, InitiativeObjectEnums.initiative)
            "
          />
        </span>
        <label for="initiative">Initiative Total</label>
      </div>
      <div>
        <span v-tooltip.top="'Enter your initiative modifier. Integers only.'">
          <InputNumber
            id="initiativeModifier"
            :model-value="data.initiativeModifier"
            @update:model-value="
              (e) => handleChange(e, InitiativeObjectEnums.initiativeModifier)
            "
          />
        </span>
        <label for="initiativeModifier">Initiative Modifier</label>
      </div>
    </template>
    <template #footer>
      <Button
        icon="pi pi-replay"
        label="Re-Roll Initiative"
        @click="() => store.reRoll()"
      />
    </template>
  </Card>
</template>

<script lang="ts">
import {
  defineComponent,
  PropType,
  reactive,
  watch,
  inject,
  computed,
} from "vue";
import { InitiativeObject } from "../../../Interfaces/initiative";
import { InitiativeObjectEnums } from "../../../Interfaces/ContextEnums";
import Card from "primevue/card";
import InputNumber from "primevue/inputnumber";
import Button from "primevue/button";
import serverLogger from "../../../Utils/LoggingClass";
import { LoggingTypes, ComponentEnums } from "../../../Interfaces/LoggingTypes";
import { IStore } from "../../../data/types";
import InputText from "primevue/inputtext";

export default defineComponent({
  name: "InitRecord",
  components: { Card, InputNumber, Button, InputText },
  props: {
    initiative: { type: Object as PropType<InitiativeObject>, required: true },
    index: { type: Number, required: true },
  },
  setup(props) {
    const data = computed(() => props.initiative);
    const store = inject<IStore>("store");
    if (store === undefined) {
      serverLogger(
        LoggingTypes.alert,
        `Failed to inject store`,
        ComponentEnums.SORTABLELIST
      );
      throw new Error("Failed to inject store");
    }

    function handleChange(e: number | string | undefined, valueName: string) {
      if (e !== undefined) {
        serverLogger(
          LoggingTypes.info,
          `updating character info`,
          ComponentEnums.SORTABLELIST,
          data.value.id
        );
        switch (valueName) {
          case InitiativeObjectEnums.initiative:
            store?.updateCharacterItem(
              InitiativeObjectEnums.initiative,
              Number(e),
              props.index,
              true,
              data.value.id
            );
            serverLogger(
              LoggingTypes.debug,
              `${valueName} updated`,
              ComponentEnums.SORTABLELIST,
              data.value.id
            );
            break;
          case InitiativeObjectEnums.initiativeModifier:
            store?.updateCharacterItem(
              InitiativeObjectEnums.initiativeModifier,
              Number(e),
              props.index,
              true,
              data.value.id
            );
            serverLogger(
              LoggingTypes.debug,
              `${valueName} updated`,
              ComponentEnums.SORTABLELIST,
              data.value.id
            );
            break;
          case InitiativeObjectEnums.characterName:
            store?.updateCharacterItem(
              InitiativeObjectEnums.characterName,
              String(e),
              props.index,
              true,
              data.value.id
            );
            serverLogger(
              LoggingTypes.debug,
              `${valueName} updated`,
              ComponentEnums.SORTABLELIST,
              data.value.id
            );
            break;
        }
      }
    }

    return { data, handleChange, InitiativeObjectEnums, store };
  },
});
</script>

<style>
.pi-pencil {
  font-size: 0.5em !important;
}
</style>

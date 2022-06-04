<template>
  <div class="p-grid p-field m-2">
    <div class="p-inputgroup p-col input-value">
      <Button
        icon="pi pi-info-circle"
        class="p-button-sm p-button-success"
        v-tooltip.top="'Enter a name for your spell or effect.'"
      />
      <InputText
        id="spellName"
        type="text"
        v-model="record.effectName"
        placeholder="Spell Effect Name"
        :model-value="record.effectName"
        @update:model-value="
          (e:any) => handleChange(e, SpellObjectEnums.effectName)
        "
      />
    </div>
  </div>
  <div class="p-grid p-field m-2">
    <div class="p-inputgroup p-col input-value">
      <Button
        icon="pi pi-info-circle"
        class="p-button-sm p-button-success"
        v-tooltip.top="'Enter a description for your spell or effect.'"
      />
      <textarea
        placeholder="Spell Description..."
        v-model="record.effectDescription"
        @update="(e:any) => handleChange(e, SpellObjectEnums.effectDescription)"
        style="background: #17212f; color: rgba(255, 255, 255, 0.87)"
      >
      </textarea>
    </div>
  </div>
  <div class="p-grid p-field m-2">
    <div class="p-inputgroup p-col input-value">
      <Button
        icon="pi pi-info-circle"
        class="p-button-sm p-button-success"
        v-tooltip.top="'Select the effect duration number value.'"
      />
      <InputNumber
        v-model="record.durationTime"
        :model-value="record.durationTime"
        @update:model-value="
          (e: any) => handleChange(e, SpellObjectEnums.durationTime)
        "
      />
    </div>
  </div>
  <div class="p-grid p-field m-2">
    <div class="p-inputgroup p-col input-value">
      <Button
        icon="pi pi-info-circle"
        class="p-button-sm p-button-success"
        v-tooltip.top="'Select the effect duration type.'"
      />
      <Dropdown
        v-model="record.durationType"
        :options="durationTypes"
        option-label="label"
        option-value="value"
        placeholder="Duration"
        @update:model-value="
          (e: any) => handleChange(e, SpellObjectEnums.durationType)
        "
      ></Dropdown>
    </div>
  </div>
  <Button
    label="Save"
    class="pi-button-primary m-2"
    @click.prevent="submitData"
  />
</template>

<script lang="ts">
import { defineComponent, PropType, reactive, ref } from "vue";
import { SpellObjectEnums } from "../../../Interfaces/ContextEnums";
import Dropdown from "primevue/dropdown";
import InputNumber from "primevue/inputnumber";
import InputText from "primevue/inputtext";
import Button from "primevue/button";
import { SpellObject } from "../../../Interfaces/Spells";
import serverLogger from "../../../Utils/LoggingClass";
import { LoggingTypes, ComponentEnums } from "../../../Interfaces/LoggingTypes";
import { SpellStoreInterface } from "../../../data/types";
import SPELL_FUNCS from "../../../data/spellStore";
import INITIATIVE_FUNCS from "../../../data/initiativeStore";

export default defineComponent({
  name: "AddSpell",
  components: { Dropdown, InputNumber, InputText, Button },
  props: {
    index: { type: Number, required: false },
    toggle: { type: Function, required: false },
  },
  setup(props) {
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
    const record = ref<SpellObject>({
      id: "",
      effectName: "",
      effectDescription: "",
      durationTime: 0,
      durationType: "",
      characterIds: { target: [], source: [] },
    });
    if (props.index !== undefined) {
      record.value = spellGetters.getSpellbyIndex(props.index);
    }
    const durationTypes = ref([
      { label: "Rounds", value: "Rounds" },
      { label: "Minutes", value: "Minutes" },
      { label: "Hours", value: "Hours" },
      { label: "Days", value: "Days" },
    ]);

    serverLogger(LoggingTypes.info, `created`, ComponentEnums.ADDSPELL);

    function submitData() {
      if (props.index !== undefined) {
        spellSetters.updateSpell(record.value);
        spellEmits.emitUpdateSpell(record.value);
      } else {
        const initTemp = initGetters.getInitiative();
        const spellData = spellSetters.initializeCharacterIDS(
          record.value,
          initTemp.value
        );
        spellSetters.addSpell(spellData);
        spellEmits.emitNewSpell(spellData);
      }
      if (props.toggle !== undefined) {
        props.toggle();
      }
    }

    function handleChange(e: any, ObjectType: SpellObjectEnums) {
      serverLogger(
        LoggingTypes.debug,
        `updating ${ObjectType} value: ${e}`,
        ComponentEnums.ADDSPELL
      );
      switch (ObjectType) {
        case SpellObjectEnums.effectName:
          record.value.effectName = e;
          break;
        case SpellObjectEnums.effectDescription:
          record.value.effectDescription = e;
          break;
        case SpellObjectEnums.durationType:
          record.value.durationType = e;
          console.log(e);
          break;
        case SpellObjectEnums.durationTime:
          record.value.durationTime = e;
          break;
      }
    }
    return {
      record,
      handleChange,
      submitData,
      SpellObjectEnums,
      durationTypes,
    };
  },
});
</script>

<script setup lang="ts">
import { onUnmounted, PropType, Ref, ref, watchEffect } from "vue";
import SPELL_FUNCS from "../data/spellStore";
import INITIATIVE_FUNCS from "../data/initiativeStore";
import { toDiscord } from "../data/utilities";
import { CollectionTypes } from "../Interfaces/ContextEnums";
import { LoggingTypes, ComponentEnums } from "../Interfaces/LoggingTypes";
import serverLogger from "../Utils/LoggingClass";
import { useToast } from "primevue/usetoast";
import Dialog from "primevue/dialog";
import Button from "primevue/button";
import Toolbar from "primevue/toolbar";
import { useConfirm } from "primevue/useconfirm";
import CustomRoll from "./gamesession/rolls/CustomRoll.vue";
import CardContainer from "./gamesession/card-system/CardContainer.vue";
import ConfirmPopup from "primevue/confirmpopup";
import { getWindowWidth } from "../data/windowStore";
import MobileSidebar from "./gamesession/mobile/MobileSidebar.vue";

const props = defineProps({
  windowProp: { type: Number, required: true },
});

const windowSize = ref(props.windowProp);

const stop = watchEffect(() => (windowSize.value = props.windowProp));

onUnmounted(() => stop());


</script>

<template>
  <Toolbar class="shadow-8">
    <template #start>
      <div v-if="windowSize > 1000">
      <slot></slot>
      </div>
      <div v-if="windowSize < 1000">
        <MobileSidebar>
          <div class="flex flex-column gap-5 mt-6 mx-auto w-10">
            <slot></slot>
            <slot name="end"></slot>
          </div>
        </MobileSidebar>
      </div>
    </template>
    <template #end>
      <slot name="end" v-if="windowSize > 1000"></slot>
    </template>
  </Toolbar>
</template>

<style>

</style>

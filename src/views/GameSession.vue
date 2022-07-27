<script setup lang="ts">
import { useRoute } from "vue-router";
import serverLogger from "../Utils/LoggingClass";
import { LoggingTypes, ComponentEnums } from "../Interfaces/LoggingTypes";
import TabView from "primevue/tabview";
import TabPanel from "primevue/tabpanel";
import { updateId, roomSetup } from "../data/sessionStore";
import SpellInitialize from "../components/gamesession/spells/SpellInitialize.vue";
import InitiativeStartup from "../components/gamesession/initiative/InitiativeStartup.vue";
import SocketReceiverContainer from "../components/gamesession/sockets/SocketReceiverContainer.vue";
import TheToolbarActions from "../components/TheToolbarActions.vue";
import Button from "primevue/button";
import Toast from "primevue/toast";
import { getWindowWidth } from "../data/windowStore";
import { onMounted, onUnmounted, ref } from "vue";
import SessionActions from "../components/gamesession/SessionActions.vue";
import CardContainer from "../components/gamesession/card-system/CardContainer.vue";

const route = useRoute();
const paramsId = String(route.params.id);
// const { user, error, isAuthenticated } = AuthState();
// const auth = getAuth();
if (paramsId) {
  updateId(paramsId);
  roomSetup();
  serverLogger(
    LoggingTypes.info,
    `sending emit to create room`,
    ComponentEnums.GAMESESSION
  );
  serverLogger(
    LoggingTypes.debug,
    `updating session Id`,
    ComponentEnums.GAMESESSION,
    paramsId
  );
}

const windowSize = ref(getWindowWidth());

onMounted(() => {
  window.addEventListener("resize",() =>  windowSize.value = getWindowWidth());
});

onUnmounted(() => {
  window.removeEventListener("resize",() =>  windowSize.value = getWindowWidth());
});

const breakPointWidths = { medium: 1300, small: 700 };

function screenWidth() {
  console.log(window.innerWidth);
}
</script>

<template>
  <Toast />
  <TheToolbarActions :windowProp="windowSize">
  <template #default>
    <SessionActions />
  </template>
  <template #end>
    <CardContainer />
  </template>
  </TheToolbarActions>
  <div v-if="windowSize > breakPointWidths.small" class="session-large flex-row flex-wrap justify-content-evenly">
    <!-- Initiative List -->
    <div class="flex flex-column column-container md:col-4">
      <h1>Initiative List</h1>
      <InitiativeStartup />
    </div>
    <!-- Spell List -->

    <div class="flex flex-column column-container md:col-4">
      <h1>Spell List</h1>
      <SpellInitialize />
    </div>
  </div>
  <div v-if="windowSize < breakPointWidths.small"  class="session-small mt-4">
    <TabView>
      <TabPanel header="Initiative">
        <div class="flex flex-column column-container">
          <InitiativeStartup />
        </div>
      </TabPanel>
      <TabPanel header="Spells">
        <div class="flex flex-column column-container">
          <SpellInitialize />
        </div>
      </TabPanel>
    </TabView>
  </div>
  <SocketReceiverContainer />
</template>

<style>
.consent-button {
  transition: 1s;
}
.consent-button:hover {
  box-shadow: 0 0 0 2px rgba(0, 191, 255, 0.637),
    0 0 0 5px rgba(0, 190, 255, 0.2);
}
.column-container {
  width: fit-content;
}
.p-tooltip-text {
  font-size: 0.8em;
}
.message-container {
  font-size: 1em !important;
}
.p-message-icon {
  font-size: 1em !important;
}
.p-message {
  font-size: 1em !important;
  padding-top: 0 !important;
  padding-bottom: 0 !important;
  padding-left: 0.1em !important;
  padding-right: 0.2em !important;
  margin: 0 !important;
}
.p-message-wrapper {
  font-size: 1em !important;
  padding-top: 0 !important;
  padding-bottom: 0 !important;
  padding-left: 0.1em !important;
  padding-right: 0.2em !important;
  margin: 0 !important;
}
.session-large {
  display: flex !important;
}
@media only screen and (max-width: 500px) {
  .session-small {
    display: flex !important;
    justify-content: center;
    flex-wrap: wrap;
  }
}
</style>

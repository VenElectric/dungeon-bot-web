import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import PrimeVue from "primevue/config";
import "primevue/resources/themes/vela-purple/theme.css";
import "primevue/resources/primevue.min.css";
import "primeicons/primeicons.css";
import "primeflex/primeflex.css";
import Tooltip from "primevue/tooltip";
import rollData from "./data/rollStore";
import spellStore from "./data/spellStore";
import ConfirmationService from "primevue/confirmationservice";
import ToastService from "primevue/toastservice";
import BadgeDirective from "primevue/badgedirective";

createApp(App)
  .provide("rollData", rollData)
  .provide("spellStore", spellStore)
  .directive("tooltip", Tooltip)
  .use(PrimeVue)
  .use(ConfirmationService)
  .use(ToastService)
  .use(router)
  .directive("badge", BadgeDirective)
  .mount("#app");

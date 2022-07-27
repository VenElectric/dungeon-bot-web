import { ref } from "vue";
const windowWidth = ref(0);

export function updateWidth(window: number) {
  windowWidth.value = window;
}

export function getWindowWidth() {
  return windowWidth.value;
}

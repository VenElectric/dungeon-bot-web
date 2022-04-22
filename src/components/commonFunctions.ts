import { Ref } from "vue";

function toggleAdd(event: any, ref: Ref) {
  ref.value.toggle(event);
}

export function openModal(modalRef: Ref<boolean>): void {
  modalRef.value = true;
}

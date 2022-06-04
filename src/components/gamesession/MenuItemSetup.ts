import { ref, Ref } from "vue";
import { MenuItem } from "primevue/menuitem";
import { ComponentIs } from "./componentTypes";
import SPELL_FUNCS from "../../data/spellStore";
import INIT_FUNCS from "../../data/initiativeStore";
import { CollectionTypes } from "../../Interfaces/ContextEnums";

const {
  GETTERS: spellGetters,
  SETTERS: spellSetters,
  EMITS: spellEmits,
} = SPELL_FUNCS;

const {
  GETTERS: initGetters,
  SETTERS: initSetters,
  EMITS: initEmits,
} = INIT_FUNCS;

export interface MenuObject {
  menu: MenuItem[];
  dialogRef: Ref<boolean>;
  headerText: Ref<string>;
  componentRef: Ref<ComponentIs>;
  indexRef: Ref<number>;
}

export enum ReturnTypes {
  INITIATIVE = "INITIATIVE",
  SPELLS = "SPELLS",
}

export enum HeaderTextItems {
  EditSpell = "Edit Spell",
  EditInit = "Edit Initiative",
  Target = "Edit Targets",
  Effects = "Status Effects",
}

const menuItemObject = {
  Edit: {
    label: "Edit",
    icon: "pi pi-pencil",
    command: undefined,
  },
  Delete: {
    label: "Delete",
    icon: "pi pi-trash",
    command: undefined,
  },
  Target: {
    label: "Targets",
    icon: "pi pi-users",
    command: undefined,
  },
  Status: {
    label: "Status Effects",
    icon: "pi pi-exclamation-triangle",
    command: undefined,
  },
  Current: {
    label: "Set as Current",
    icon: "pi pi-arrow-circle-right",
    command: undefined,
  },
};

export function createSpellMenu(index: number): MenuObject {
  const headerText = ref();
  const indexRef = ref<number>(index);
  const componentRef = ref();
  const dialogRef = ref(false);
  const spellMenu: MenuItem[] = [
    { ...menuItemObject.Edit },
    { ...menuItemObject.Delete },
    { ...menuItemObject.Target },
  ];
  spellMenu[0].command = () => {
    headerText.value = HeaderTextItems.EditSpell;
    indexRef.value = index;
    componentRef.value = ComponentIs.AddSpell;
    dialogRef.value = true;
  };
  spellMenu[1].command = () => {
    const spell = spellGetters.getSpellbyIndex(index);
    spellSetters.deleteSpell(spell.id);
    spellEmits.emitDeleteSpell(spell.id);
  };
  spellMenu[2].command = () => {
    headerText.value = HeaderTextItems.Target;
    indexRef.value = index;
    componentRef.value = ComponentIs.SpellTargets;
    dialogRef.value = true;
  };
  return {
    menu: spellMenu,
    dialogRef: dialogRef,
    headerText: headerText,
    componentRef: componentRef,
    indexRef: indexRef,
  };
}

export function createInitiativeMenu(index: number): MenuObject {
  const headerText = ref();
  const indexRef = ref<number>(index);
  const componentRef = ref();
  const dialogRef = ref(false);
  const initMenu: MenuItem[] = [
    { ...menuItemObject.Edit },
    { ...menuItemObject.Delete },
    { ...menuItemObject.Status },
    { ...menuItemObject.Current },
  ];
  initMenu[0].command = () => {
    headerText.value = HeaderTextItems.EditInit;
    indexRef.value = index;
    componentRef.value = ComponentIs.InitiativeData;
    dialogRef.value = true;
  };
  initMenu[1].command = () => {
    const record = initGetters.getInitbyIndex(index);
    initSetters.deleteInitiative(record.id);
    initEmits.deleteOneInitiative(record.id);
  };
  initMenu[2].command = () => {
    headerText.value = HeaderTextItems.Effects;
    indexRef.value = index;
    componentRef.value = ComponentIs.EffectContainer;
    dialogRef.value = true;
  };
  initMenu[3].command = () => {
    initSetters.alltoFalse();
    initSetters.setCurrent(index);
    const record = initGetters.getInitbyIndex(index);
    initEmits.updateRecordInitiative(record);
  };

  return {
    menu: initMenu,
    dialogRef: dialogRef,
    headerText: headerText.value,
    componentRef: componentRef.value,
    indexRef: indexRef,
  };
}

export function createMenuItem(
  index: number,
  collectionType: ReturnTypes
): MenuItem {
  switch (collectionType) {
    case ReturnTypes.INITIATIVE:
      return createInitiativeMenu(index);
    case ReturnTypes.SPELLS:
      return createSpellMenu(index);
  }
}

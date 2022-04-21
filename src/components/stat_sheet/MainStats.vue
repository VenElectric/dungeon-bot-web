<script setup lang="ts">
import { ref } from "vue";
import InputText from "primevue/inputtext";
import InputNumber from "primevue/inputnumber";

const characterStats = ref({
  characterName: "",
  characterAge: 0,
  characterRace: "",
  characterClass: "",
  characterLevel: 0,
  characterBackground: "",
  characterAlignment: "",
  characterExperience: 0,
});
</script>
<template>
  <div class="main">
    <div class="center">
      <div>
        <InputText
          v-model="characterStats.characterName"
          placeholder="Character Name"
        ></InputText>
        <InputNumber v-model="characterStats.characterAge"></InputNumber>
        <InputText
          v-model="characterStats.characterRace"
          placeholder="Race"
        ></InputText>
        <InputText
          v-model="characterStats.characterClass"
          placeholder="Class"
        ></InputText>
      </div>
      <div>
        <InputNumber
          v-model="characterStats.characterLevel"
          placeholder="Level"
        ></InputNumber>
        <InputText
          v-model="characterStats.characterBackground"
          placeholder="Background"
        ></InputText>
        <InputText
          v-model="characterStats.characterAlignment"
          placeholder="Alignment"
        ></InputText>
        <InputNumber
          v-model="characterStats.characterExperience"
          placeholder="Experience"
        ></InputNumber>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
$slate-color: rgb(16, 24, 50);
$blue-color: #00bcdd;
$pink-color: #ff00ff;
$space-cadet: #2b2d42;
$manatee: #8d99ae;
$alice-blue: #edf2f4;
$imperial-red: #ef233c;
$crimson: #d80032;
.main {
  display: flex;
  justify-content: center;
}
.center {
  display: flex;
  margin-left: auto;
  margin-right: auto;
  flex-wrap: wrap;
  flex-direction: column;
  border-radius: 5px;
  border: 3px double $blue-color;
  outline: 1px solid $blue-color;
}
.text-main {
  margin: 1rem;
  padding: 0.5rem;
  border-radius: 4rem;
  text-align: center;
  font-size: 1.1rem;
  box-shadow: 5px 3px $manatee;
  border-color: black;
  background-color: $alice-blue;
}
</style>

<script setup lang="ts">

import {Button} from "@/shared/ui/index.js";
import {MoveLeft} from "lucide-vue-next";
import {useUnit} from "effector-vue/composition";
import {listInterestsQuery} from "@/pages/my-interests/model/interests-page-model";

const emits = defineEmits(['close-added-card']);
const {start: handleReMount} = useUnit(listInterestsQuery);

function closeCard() {
  handleReMount();
  emits('close-added-card', true);
}
</script>

<template>
  <div
      class="flex w-full flex-col border-l bg-white lg:max-w-[355px]">
    <div
        class="w-full items-center border-b border-[#D0D4DB] px-0 py-3">
      <Button
          class="flex gap-x-2"
          variant="ghost"
          @click="closeCard()"
      >
        <MoveLeft class="inline-flex h-7 w-7 text-primary group-hover:text-primary/70 mx-2"/>
        <p class="text-[16px] font-semibold text-[#000FFC]">
          Назад
        </p>
      </Button>
    </div>
    <div
        class="h-[calc(100vh-177px)] w-full bg-[#F9FAFB]">
      <div class="mx-auto flex flex-col items-center justify-center gap-y-6 p-4">
        <img src="./assetes/star.png" class="mt-4">
        <div class="flex flex-col items-center gap-y-2">
          <p class="text-[16px]">Добавлено</p>
          <p class="text-center text-[12px] text-[#858FA3]">
            Чтобы посмотреть или удалить интерес, зайдите в этот <br/>
            раздел через меню
          </p>
        </div>
      </div>
    </div>
  </div>
</template>
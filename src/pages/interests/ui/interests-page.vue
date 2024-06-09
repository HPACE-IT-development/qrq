<script setup lang="ts">
  import {MoveLeft} from 'lucide-vue-next';
  import {Button} from "@/shared/ui";
  import {getButtonList} from "../lib/button-list";
  import {Trash2 } from "lucide-vue-next";
  import {useUnit} from "effector-vue/composition";
  import {onMounted} from "vue";
  import {
    deleteInterestQuery,
    listInterestsQuery
  } from "@/pages/interests/model/interests-page-model";

  defineProps<{
    isInterestsCardOpen: boolean;
  }>();

  const emits = defineEmits(['close-interests-card']);
  const buttonList = getButtonList();
  const {start: handleMount, data: interestsList} = useUnit(listInterestsQuery);
  const {start: handleRemove} = useUnit(deleteInterestQuery);

  function closeInterests() {
    emits('close-interests-card', false)
  }

  onMounted(handleMount);
</script>

<template>
  <div
      v-if="isInterestsCardOpen"
      class="flex w-full flex-col border-l bg-white lg:max-w-[355px]">
    <div
        class="w-full flex items-center justify-left md:max-w-[356px] pt-4 px-4 cursor-pointer">
      <MoveLeft class="inline-flex h-7 w-7 text-primary group-hover:text-primary/70 mx-2" @click="closeInterests"/>
      <p class="text-center text-[17px] group-hover:text-primary/70">
        Мои интересы
      </p>
    </div>
    <div class="flex w-full items-center justify-between gap-6 py-4 pl-4">
      <div
          ref="scrollableContainer"
          class="no-scrollbar overflow-x-auto whitespace-nowrap"
          style="scrollbar-width:none">
        <Button
            v-for="(button, index) in buttonList"
            variant="outline"
            :class="'border-[#D0D4DB] bg-[#F9FAFB] text-[#858FA3] hover:border-[#0017FC] hover:bg-[#1778EA] hover:bg-opacity-10 hover:text-[#0017FC]'"
            class="max-h-[28px] rounded-lg mx-2"
            size="sm">
          {{ button.label }}
        </Button>
      </div>
    </div>
    <div
        v-if="!Array.isArray(interestsList) || interestsList.length == 0"
        class="h-[calc(100vh-177px)] w-full border-t border-[#D0D4DB] bg-[#F9FAFB]">
      <div class="mx-auto flex flex-col items-center justify-center gap-y-6 p-4">
        <img src="./assetes/star.png" class="mt-4">
        <div class="flex flex-col items-center gap-y-2">
          <p class="text-[16px]">Ваш список интересов пуст</p>
          <p class="text-center text-[12px] text-[#858FA3]">
            Чтобы добавить интересы воспользуйтесь фильтром <br/>
            или добавьте интересы конкретного пользователя
          </p>
        </div>
      </div>
    </div>
    <div
        v-if="interestsList"
        v-for="(interest, index) in interestsList"
        class="w-full border-t h-full custom-scrollbar overflow-auto bg-[#F9FAFB]">
      <div class="mx-auto flex w-full flex-col items-center justify-center gap-y-6 p-4">
        <div
            class="vue-recycle-scroller ready direction-vertical flex w-full max-w-[324px] flex-col gap-y-4 max-sm:w-[100vw]">
          <div
              class="flex w-full items-start justify-between rounded-lg border-2 bg-white p-4 pr-5 duration-200 hover:border-[#0017FC] hover:bg-[#1778EA] hover:bg-opacity-10">
            <p class="text-[14px]">{{ interest.name }}, {{ interest.article }}, {{interest.vendor}}</p>
            <div class="cursor-pointer" @click="handleRemove(interest.id)">
              <Trash2/>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
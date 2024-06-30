<script lang="ts" setup>
  import { useUnit } from 'effector-vue/composition';
  import {
    $isChangeOffersVisible,
    changeOffersVisibleChanged,
    offersQuery,
  } from '../model/my-suggestions-model';
  import { Button } from '@/shared/ui';
  import { ScrollArea } from '@/shared/ui/scroll-area';

  const isSwitchOffersVisible = useUnit($isChangeOffersVisible);
  const changeOffersVisible = useUnit(changeOffersVisibleChanged);
  const { data: offers } = useUnit(offersQuery);
</script>

<template>
  <div
    v-if="isSwitchOffersVisible"
    class="absolute inset-y-0 left-0 z-50 flex max-h-[100vh] w-full flex-col gap-y-6 overflow-hidden border-r border-[#D0D4DB] bg-white md:max-w-[356px]">
    <div class="flex w-full items-center justify-start gap-x-2 px-4 py-2 rounded-none border-b border-[#D0D4DB]">
      <Button class="-ml-2" @click="changeOffersVisible(false)" size="icon" variant="ghost">
        <img
          src="../assets/backIcon.svg"
          class="h-6 w-6 select-none"
          alt="arrow" />
      </Button>
      <p class="cursor-default text-[18px] font-semibold">Мои предложения</p>
    </div>
    <ScrollArea class="h-[calc(100vh-28px)]">
      <div class="flex flex-col gap-y-4 px-4">
          <div
            class="mx-auto flex flex-col items-center justify-center gap-y-6 p-4"
            v-if="!offers || offers.length === 0">
            <img
              src="../assets/interfaceRequestIcon.svg"
              alt="interfaceRequestIcon"
              class="mt-8" />
            <div class="flex flex-col items-center gap-y-2">
              <p class="text-[16px]">Ваш список предложений пуст</p>
              <p class="text-center text-[12px] text-[#858FA3]">
                Чтобы добавить своё первое предложение <br />
                кликните по чужому предложению
              </p>
            </div>
          </div>
        <div
          v-else
          v-for="offer in offers"
          :key="offer.id"
          class="rounded-lg border-2 border-[#E0E7EF] bg-white px-3 py-1 transition-all duration-100 hover:border-[#0017FC] hover:bg-opacity-90">
          <h2 class="text-lg font-bold">{{ offer.name }}</h2>
          <p><strong>Количество:</strong> {{ offer.amount }}</p>
          <p><strong>Артикул:</strong> {{ offer.article }}</p>
        </div>
      </div>
    </ScrollArea>
  </div>
</template>
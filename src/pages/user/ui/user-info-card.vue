<script setup lang="ts">
  import { Button } from "@/shared/ui";
  import { MoveLeft } from "lucide-vue-next";
  import { Item } from '@/shared/api/generated/Api';

  const emit = defineEmits(['close-user-info-card', 'open-filter-by-user']);

  defineProps<{
    vendorTitle;
  }>();
  function closeCard() {
    emit('close-user-info-card');
  }

  function addCredentials() {
    emit('open-filter-by-user');
    emit('close-user-info-card');
  }
</script>

<template>
  <div class="flex w-full flex-col border-l bg-white lg:max-w-[355px]">
    <div class="w-full items-center border-b border-[#D0D4DB] px-0 py-3">
      <Button class="flex gap-x-2" variant="ghost" @click="closeCard">
        <MoveLeft class="inline-flex h-7 w-7 text-primary group-hover:text-primary/70 mx-2"/>
        <p class="text-[16px] font-semibold">Информация о пользователе</p>
      </Button>
    </div>
    <div class="h-[calc(100vh-177px)] w-full bg-[#F9FAFB]">
      <div class="mx-auto flex flex-col items-start justify-center gap-y-6 p-4">
        <h2 class='text-xl font-bold'>{{ vendorTitle }}</h2>
        <div class="w-full flex justify-between">
          <p class='text-[#858FA3] text-base font-normal'>Телефон</p>
          <span class='text-[#101828]'>8-800-909-00-00</span>
        </div>
      </div>
    </div>
    <div class="p-4">
      <Button
        variant='tertiary'
        class="w-full text-base font-semibold mt-4"
        type="button"
        @click="addCredentials">
        Добавить в Интересы
      </Button>
    </div>
  </div>
</template>
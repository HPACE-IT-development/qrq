<script setup lang="ts">
import {Button} from "@/shared/ui";
import {MoveLeft} from "lucide-vue-next";
import {useUnit} from "effector-vue/composition";
import {$selectedVendor} from "@/entities/vendors/model/vendors-model";

const emit = defineEmits(['close-vendor-info-card', 'open-vendor-credentials-card']);
const selectedVendor = useUnit($selectedVendor);

function closeCard() {
  emit('close-vendor-info-card');
}

function addCredentials() {
  emit('open-vendor-credentials-card');
  emit('close-vendor-info-card');
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
        <p class="text-[16px] font-semibold">
          Информация о пользователе
        </p>
      </Button>
    </div>
    <div
        class="h-[calc(100vh-177px)] w-full bg-[#F9FAFB]">
      <div class="mx-auto flex flex-col items-center justify-center gap-y-6 p-4">
        <h2>{{ selectedVendor.title }}</h2>
        <div
            class="border w-full p-4 bg-[#fff]"
            v-for="vendor in selectedVendor?.qwep_vendors">

          <p><b>Название:</b> {{ vendor.title }}</p>
          <p><b>Тип:</b> {{ vendor.display_name }}</p>
          <p><b>Адрес:</b> {{ vendor.url }}</p>
          <p><b>Корзина:</b> {{ vendor.basket }}</p>

        </div>
      </div>
    </div>
    <div class="p-4">
      <Button
          class="w-full border-[#0015fa] bg-[#000] hover:bg-gray-50 border-2 bg-opacity-0! text-[#0015fa] font-semibold"
          type="button" @click="addCredentials">
        Добавить в Интересы
      </Button>
    </div>
  </div>
</template>
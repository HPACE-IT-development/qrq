<script lang="ts" setup>
interface IProps {
  name: string
}
defineProps<IProps>()
const emits = defineEmits(['activate']);
</script>

<template>
  <div class="w-full border-t custom-scrollbar overflow-auto bg-[#F9FAFB]">
    <div class="mx-auto flex w-full flex-col items-center justify-center gap-y-6 p-4" @click="emits('activate')">
      <div
        class="vue-recycle-scroller ready direction-vertical flex w-full max-w-[324px] flex-col gap-y-4 max-sm:w-[100vw]">
        <div
          class="flex w-full items-start justify-between rounded-lg border-2 bg-white p-4 pr-5 duration-200 hover:border-[#0017FC] hover:bg-[#1778EA] hover:bg-opacity-10">
          <p class="text-[14px] cursor-pointer">
            {{ name }}
          </p>
          <slot name="trash" />
        </div>
      </div>
    </div>
  </div>
</template>
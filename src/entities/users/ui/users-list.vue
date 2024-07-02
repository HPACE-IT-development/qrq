<script setup lang="ts">
  import { cn } from '@/shared/lib';
  import { useUnit } from 'effector-vue/composition';
  import { $searchTerm } from "@/widgets/header/model/header-modal";
  import { PreSearchResponse, Vendor } from '@/shared/api/generated/Api';
  import { onMounted, watch } from 'vue';

  defineProps<{
    searchResult: Readonly<PreSearchResponse[]>;
  }>();


  function handleUserClick(item) {
    if (!item) return;
    handleSelected({...item, article: searchValue.value});
  }

  function getUsersText(count: number) {
    if (count === 0 || !count) {
      return 'Нет пользователей';
    } else if (count === 1) {
      return 'Найден 1 пользователь';
    } else if (count % 10 === 1 && count !== 11) {
      return `Найден ${count} пользователь`;
    } else if (
      count % 10 >= 2 &&
      count % 10 <= 4 &&
      (count < 10 || count >= 20)
    ) {
      return `Найдено ${count} пользователя`;
    } else {
      return `Найдено ${count} пользователей`;
    }
  }
</script>

<template>
  <div v-if="usersList && usersList.length > 0" class="broder-r w-full border">
    <div
      class="flex items-center justify-between border-b border-r border-[#D0D4DB] p-4 pr-5" v-if="usersList && usersList.length > 0">
      <h3
        class="text-[18px] font-semibold">
        {{ getUsersText(usersList.length ?? 0) }}
      </h3>
    </div>
    <div
      class="mx-auto flex w-full flex-col items-center justify-center gap-y-6 p-4">
      <DynamicScroller
        class="flex w-full max-w-[324px] flex-col gap-y-4 max-sm:w-[100vw]"
        :items="usersList"
        :min-item-size="91">
        <template v-slot="{ item, index, active }">
          <DynamicScrollerItem
            :item="item"
            :active="active"
            :size-dependencies="[item.title]"
            :data-index="index">
            <div class="py-2">
              <div
                @click="handleUserClick(item)"
                :key="item.id"
                :class="
                  cn(
                    'flex w-full flex-col items-start justify-between rounded-lg border-2 bg-white p-4 pr-5 duration-200 hover:border-[#0017FC] hover:bg-[#1778EA] hover:bg-opacity-10',
                    selectedUser === item.id &&
                      'border-[#0017FC] bg-[#1778EA] bg-opacity-10',
                  )
                ">
                <p class="text-[14px]">{{ item?.title }}</p>
              </div>
            </div>
          </DynamicScrollerItem>
        </template>
      </DynamicScroller>
    </div>
  </div>
</template>
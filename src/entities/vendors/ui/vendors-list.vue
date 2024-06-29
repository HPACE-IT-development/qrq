<script setup lang="ts">
import {cn} from '@/shared/lib';
import {useUnit} from 'effector-vue/composition';
import {$selectedVendorId, vendorClicked} from "@/entities/vendors/model/vendors-model";
import {$searchTerm} from "@/widgets/header/model/header-modal";

defineProps<{
  vendorsList: [];
}>();

const handleSelected = useUnit(vendorClicked);
const selectedVendor = useUnit($selectedVendorId);
const searchValue = useUnit($searchTerm);

function handleVendorClick(item) {
  if (!item) return;
  handleSelected({...item, article: searchValue.value});
}
</script>

<template>
  <div v-if="vendorsList" class="broder-r w-full border">
    <div
        class="mx-auto flex w-full flex-col items-center justify-center gap-y-6 p-4">
      <DynamicScroller
          class="flex w-full max-w-[324px] flex-col gap-y-4 max-sm:w-[100vw]"
          :items="vendorsList"
          :min-item-size="91">
        <template v-slot="{ item, index, active }">
          <DynamicScrollerItem
              :item="item"
              :active="active"
              :size-dependencies="[item.title]"
              :data-index="index">
            <div class="py-2">
              <div
                  @click="handleVendorClick(item)"
                  :key="item.id"
                  :class="
                  cn(
                    'flex w-full flex-col items-start justify-between rounded-lg border-2 bg-white p-4 pr-5 duration-200 hover:border-[#0017FC] hover:bg-[#1778EA] hover:bg-opacity-10',
                    selectedVendor === item.id &&
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

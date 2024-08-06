<script setup lang="ts">
import { MoveLeft, Trash2 } from 'lucide-vue-next';
import { Button } from '@/shared/ui';
import { getButtonList } from '../lib/button-list';
import { defineProps, onMounted, ref } from 'vue';
import {
  deleteInterestQuery,
  handleMount,
  listInterestsQuery,
} from '@/pages/my-interests/model/interests-page-model';

import { useUnit } from 'effector-vue/composition';
import { filterSubmitted } from '@/features/filter/model/filter-model';
import { requestViewModeChanged } from '@/pages/my-requests/model/my-requests-model';
import { cn } from '@/shared/lib';
import type { RequestParams } from '@/shared/api/generated/Api';
import { WidgetInterestingCard } from '@/widgets/interestings/ui';
import { $accountStore, deleteAccountsQuery, getAccountsQuery, removeAccountEvent } from '@/pages/vendor/model/vendor-credentials-model';
import { createStore } from 'effector';

defineProps<{
  isInterestsCardOpen: boolean;
}>();

const emits = defineEmits(['close-interests-card', 'change-view', 'open-interests-card', 'close-filter-by-interests']);
const buttonList = getButtonList();
const { data: interestsList } = useUnit(listInterestsQuery);
const changeRequestViewMode = useUnit(requestViewModeChanged);
const { start: handleRemove } = useUnit(deleteInterestQuery);
const handleFilterSubmit = useUnit(filterSubmitted);
const accountStore = useUnit($accountStore)

type ButtonType = 'general' | 'filter' | 'users'
const buttonActive = ref<ButtonType>('general')

const changeTypeButtonActive = (data: ButtonType) => buttonActive.value = data

function closeInterests() {
  handleMount();
  emits('close-interests-card', false);
}

const remove = async (id) => {
  await handleRemove(id);
  handleMount();
};

const openFilter = () => {
  emits('change-view', false);
  changeTypeButtonActive('filter')
};
const submit = async (id: any) => {
  if (interestsList.value === null) return;
  let filterBy = interestsList.value.find((interest) => interest.id === id);

  if (!filterBy) return;

  let vendors = filterBy.vendor;
  let brands = filterBy.brand;
  let cities = filterBy.city;
  let search = filterBy.description?.split(',').pop();

  let deliveryTime = filterBy.delivery_time ? JSON.parse(filterBy.delivery_time) : null;
  let amount = filterBy.amount ? JSON.parse(filterBy.amount) : null;

  let values = {
    article: filterBy.article,
    countFrom: deliveryTime ? deliveryTime.lower : null,
    countTo: deliveryTime ? deliveryTime.upper : null,
    priceFrom: amount ? amount.lower : null,
    priceTo: amount ? amount.upper : null,
  };
  // console.log('vendors', vendors, brands, cities);
  // if (!vendors || !brands || !cities) return;

  handleFilterSubmit({ ...values, search, vendors, brands, cities });
  changeRequestViewMode('offers');
  emits('close-filter-by-interests');
};

onMounted(async () => {
  handleMount();
  await getAccountsQuery()
});

</script>

<template>
  <div v-if="isInterestsCardOpen" class="flex w-full flex-col border-l bg-white lg:max-w-[355px]">
    <div class="w-full flex items-center justify-left md:max-w-[356px] pt-4 px-4 cursor-pointer">
      <MoveLeft class="inline-flex h-7 w-7 text-primary group-hover:text-primary/70 mx-2" @click="closeInterests" />
      <p class="text-center text-[17px] group-hover:text-primary/70">
        Мои интересы
      </p>
    </div>
    <div class="flex w-full items-center justify-between gap-6 py-4 pl-4">
      <div ref="scrollableContainer" class="no-scrollbar whitespace-nowrap overflow-x-scroll pb-2">
        <Button class="button" size="sm" :class="{ 'button-active': buttonActive === 'general' }" variant="outline"
          @click="changeTypeButtonActive('general')">
          Мои интересы
        </Button>
        <Button class="button" size="sm" :class="{ 'button-active': buttonActive === 'filter' }" variant="outline"
          @click="openFilter">
          Фильтры
        </Button>
        <Button class="button" size="sm" :class="{ 'button-active': buttonActive === 'users' }" variant="outline"
          @click="changeTypeButtonActive('users')">
          Пользователи
        </Button>
      </div>
    </div>
    <div v-if="!Array.isArray(interestsList) || interestsList.length == 0"
      class="h-[calc(100vh-177px)] w-full border-t border-[#D0D4DB] bg-[#F9FAFB]">
      <div class="mx-auto flex flex-col items-center justify-center gap-y-6 p-4">
        <img src="./assetes/star.png" class="mt-4">
        <div class="flex flex-col items-center gap-y-2">
          <p class="text-[16px]">Ваш список интересов пуст</p>
          <p class="text-center text-[12px] text-[#858FA3]">
            Чтобы добавить интересы воспользуйтесь фильтром <br />
            или добавьте интересы конкретного пользователя
          </p>
        </div>
      </div>
    </div>
    <div class="justify-normal">
      <WidgetInterestingCard v-if="buttonActive === 'general'" v-for="(item) in interestsList"
        @activate="submit(item.id)" :name="item.name || item.description || item.article || item.city || item.amount ||
          item.vendor">
        <template #trash>
          <div class="cursor-pointer" @click="remove(item.id)">
            <Trash2 />
          </div>
        </template>
      </WidgetInterestingCard>
      <WidgetInterestingCard v-if="accountStore?.length" v-for="(item) in accountStore" :name="item.title">
        <template #trash>
          <div class="cursor-pointer" @click="deleteAccountsQuery(item.id)">
            <Trash2 />
          </div>
        </template>
      </WidgetInterestingCard>
    </div>
  </div>
</template>

<style lang="postcss" scoped>
.button {
  @apply max-h-[28px] rounded-lg mx-2 border-[#D0D4DB] bg-[#FFF] hover:border-[#0017FC] hover:bg-[#1778EA] hover:bg-opacity-10 hover:text-[#0017FC];
}

.button-active {
  @apply border-[#0017FC] bg-[#F9FAFB] text-[#0017FC];
}
</style>
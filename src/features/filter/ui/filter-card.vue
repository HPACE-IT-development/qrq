<script lang="ts" setup>
import { Button } from '@/shared/ui/button';
import { X } from 'lucide-vue-next';
import { defineProps, onMounted, ref, watch } from 'vue';
import { useFilter } from '../lib/schema';
import FilterInput from './filter-input.vue';

import { searchQuery } from '@/entities/offer';
import { $filterValues, filterSubmitted } from '@/features/filter/model/filter-model';
import SelectAll from '@/features/filter/ui/select-all.vue';
import { ScrollArea } from '@/shared/ui/scroll-area';
import { Listbox, ListboxButton, ListboxOption, ListboxOptions } from '@headlessui/vue';
import { useUnit } from 'effector-vue/composition';
import {
  $buttonMode,
  changeButtonMode,
  createInterestQuery,
  listInterestsQuery,
} from '@/pages/my-interests/model/interests-page-model';
import { listVendorsQuery } from '@/entities/vendors/model/vendors-model';
import { listDestinationsQuery } from '@/features/create-advertisement/model/create-advertisement';
import { listBrandsQuery } from '@/pages/my-requests/model/brand-model';

defineProps<{
  isFilterCardOpen: boolean;
}>();

const selectedVendors = ref<any[]>([]);
const selectedBrands = ref<string[]>([]);
const selectedDestinations = ref<number[]>([]);

const { data: interestsList } = useUnit(listInterestsQuery);
const { data: vendors } = useUnit(listVendorsQuery);
const { data: destinations } = useUnit(listDestinationsQuery);
const { data: listBrands } = useUnit(listBrandsQuery);

const { start: vendorsMount } = useUnit(listVendorsQuery);
const { start: destinationsMount } = useUnit(listDestinationsQuery);
const { start: brandsMount } = useUnit(listBrandsQuery);

const showAddedMessage = ref<boolean>(false);

const handleFilterSubmit = useUnit(filterSubmitted);

const { data, pending } = useUnit(searchQuery);

const filterValues = useUnit($filterValues);
const {
  $buttonMode: buttonMode,
  changeButtonMode: handleChangeButtonMode,
} = useUnit({
  $buttonMode,
  changeButtonMode,
});

const { form } = useFilter(data?.value?.data.filters as any);

const emit = defineEmits(['close-filter-card']);

const onSubmit = async (event: Event) => {
  event.preventDefault();
  const i = await form.validate();

  if (Object.keys(form.errors.value).length === 0) {
    const values = form.values;
    const vendors = selectedVendors.value;
    // const brands = listBrands.value?.data.map(i => i.id);
    const brands = 1;
    const cities = selectedDestinations.value;
    handleFilterSubmit({ ...values, vendors, brands, cities });
  }
};

const filterByInterests = async (event: Event) => {
  if (interestsList.value?.length !== 0 && interestsList.value) {
    handleChangeButtonMode('show-interests');

    selectedVendors.value = [];
    selectedBrands.value = [];
    selectedDestinations.value = [];

    interestsList.value.map((interest: any) => {
      if (interest.vendor !== 'undefined' && selectedVendors.value.indexOf(interest.vendor) === -1) {
        selectedVendors.value.push(interest.vendor);
      }

      if (interest.brand !== 'undefined' && selectedBrands.value.indexOf(interest.brand) === -1) {
        selectedBrands.value.push(interest.brand);
      }

      if (interest.city !== 'undefined' && selectedDestinations.value.indexOf(interest.city) === -1) {
        selectedDestinations.value.push(interest.city);
      }
    });

    const vendors = selectedVendors.value;
    const brands = selectedBrands.value;
    const cities = selectedDestinations.value;

    handleFilterSubmit({
      vendors,
      brands,
      cities,
    });

    await onSubmit(event);

  } else await onSubmit(event);
};

const filterByAll = async (event: Event) => {
  handleChangeButtonMode('show-all');

  selectedVendors.value = [];
  selectedBrands.value = [];
  selectedDestinations.value = [];

  await onSubmit(event);
};

const addToInterests = async () => {
  await form.validate();

  if (Object.keys(form.errors.value).length === 0) {
    const values = form.values;
    const vendors = selectedVendors.value;
    const brands = selectedBrands.value;
    const cities = selectedDestinations.value;

    createInterestQuery.start({
      ...values,
      vendor: vendors,
      brand: brands,
      city: cities,
    });
    showAddedMessage.value = true;
    handleFilterSubmit({ ...values, vendors, brands, cities });
  }

};

const showClearButton = ref(false);

watch(form.values, () => {
  for (const key of Object.keys(form.values)) {
    if (form.isFieldDirty(key)) {
      showClearButton.value = true;
    }
  }
});

function closeFilter() {
  showAddedMessage.value = false;
  showClearButton.value = false;
  emit('close-filter-card', false);
}

watch(pending, () => {
  if (filterValues.value) {
    form.setValues({
      article: filterValues.value?.article,
      denomination: filterValues.value?.denomination,
      priceFrom: filterValues?.value?.priceFrom,
      priceTo: filterValues?.value?.priceTo,
      countFrom: filterValues?.value?.countFrom,
      countTo: filterValues?.value?.countTo,
    });
    selectedDestinations.value = (filterValues.value?.cities as number[]) ?? [];
    selectedVendors.value = (filterValues.value?.vendors as any[]) ?? [];
    selectedBrands.value = (filterValues.value?.brands as string[]) ?? [];
  }
});

onMounted(() => {
  vendorsMount();
  destinationsMount();
  brandsMount();

  if (filterValues.value) {
    form.setValues({
      article: filterValues.value?.article,
      denomination: filterValues.value?.denomination,
      priceFrom: filterValues?.value?.priceFrom,
      priceTo: filterValues?.value?.priceTo,
      countFrom: filterValues?.value?.countFrom,
      countTo: filterValues?.value?.countTo,
    });

    selectedDestinations.value = (filterValues.value?.cities as number[]) ?? [];
    selectedVendors.value = (filterValues.value?.vendors as any[]) ?? [];
    selectedBrands.value = (filterValues.value?.brands as string[]) ?? [];
  }
});
</script>

<template>
  <div v-if="isFilterCardOpen"
    class="flex max-h-screen w-full flex-col justify-between overflow-y-hidden bg-white lg:max-w-[355px]">
    <div
      class="flex cursor-pointer items-center justify-between gap-x-2 border-b border-l border-r border-[#D0D4DB] px-2 py-4">
      <div class="group flex items-center gap-x-2" @click="closeFilter">
        <Button variant="ghost" size="icon">
          <X class="h-7 w-7 text-primary group-hover:text-primary/70" />
        </Button>
        <p class="text-center text-[17px] text-primary group-hover:text-primary/70">
          Закрыть
        </p>
      </div>

      <Button variant="ghost" type="button" v-if="showClearButton && !showAddedMessage" @click="() => {
        form.resetForm();
        closeFilter();
      }
        " class="group flex cursor-pointer items-center gap-x-2 px-2 py-2">
        <p class="text-center text-[17px] font-normal text-primary group-hover:text-primary/70">
          Очистить
        </p>
      </Button>
    </div>

    <form @submit="onSubmit"
      class="flex h-[calc(100%-64px)] flex-col justify-between border-l border-r border-[#D0D4DB] bg-white">
      <ScrollArea>
        <div class="flex flex-col gap-y-4 p-4" v-if='!showAddedMessage'>
          <p class="text-[20px] font-semibold text-[#101828]">Фильтр</p>

          <FilterInput name="name" label="Наименование" placeholder="Наименование" />
          <FilterInput name="article" label="Артикул" placeholder="Артикул" />
          <FilterInput name="description" label="Описание" placeholder="Описание" />

          <div class="relative inline-block text-left">
            <Listbox v-model="selectedDestinations" multiple>
              <div class="flex w-full items-center justify-between">
                <p class="py-2 text-[13px] font-semibold text-[#101828]">
                  Населенный пункт
                </p>
                <SelectAll :list="destinations?.map((item) => item.id)" v-model="selectedDestinations" />
              </div>

              <ListboxButton
                class="inline-flex w-full justify-between rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium shadow-sm hover:bg-gray-50">
                <p class="text-sm font-normal text-gray-400">
                  Населенный пункт
                </p>
              </ListboxButton>
              <transition leave-active-class="transition ease-in duration-100" leave-from-class="opacity-100"
                leave-to-class="opacity-0">
                <ListboxOptions
                  class="absolute z-10 mt-1 max-h-36 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                  <ListboxOption v-for="item in destinations" :key="item.id" :value="item.id" as="template">
                    <li class="mx-1 my-1 cursor-pointer select-none rounded bg-gray-50 py-2 pl-3 pr-9 text-black"
                      :class="{
                        '!bg-blue-200 !text-gray-900 hover:!bg-blue-100':
                          selectedDestinations.some((city) => city === item.id),
                      }">
                      <span class="block truncate font-normal">
                        {{ item.name }}</span>
                    </li>
                  </ListboxOption>
                </ListboxOptions>
              </transition>
            </Listbox>
          </div>

          <div class="flex w-full flex-col justify-between gap-y-2">
            <p class="text-[13px] font-semibold text-[#101828]">Цена</p>
            <div class="flex w-full justify-between gap-x-4">
              <FilterInput number name="priceFrom" placeholder="От" />
              <FilterInput number name="priceTo" placeholder="До" />
            </div>
          </div>

          <div class="flex w-full flex-col justify-between gap-y-2">
            <p class="text-[13px] font-semibold text-[#101828]">Наличие</p>
            <div class="flex w-full justify-between gap-x-4">
              <FilterInput number name="countFrom" placeholder="От" />
              <FilterInput number name="countTo" placeholder="До" />
            </div>
          </div>

          <div class="relative inline-block text-left">
            <Listbox v-model="selectedVendors" multiple>
              <div class="flex w-full items-center justify-between">
                <p class="py-2 text-[13px] font-semibold text-[#101828]">
                  Поставщик
                </p>
                <SelectAll :list="vendors?.map((item) => item.id)" v-model="selectedVendors" />
              </div>

              <ListboxButton
                class="inline-flex w-full justify-between rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium shadow-sm hover:bg-gray-50">
                <p class="text-sm font-normal text-gray-400">Поставщик</p>
              </ListboxButton>

              <transition leave-active-class="transition ease-in duration-100" leave-from-class="opacity-100"
                leave-to-class="opacity-0">
                <ListboxOptions
                  class="absolute z-10 mt-1 max-h-36 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                  <ListboxOption v-for="item in vendors" :key="item.id" :value="item.id" as="template">
                    <li class="mx-1 my-1 cursor-pointer select-none rounded bg-gray-50 py-2 pl-3 pr-9 text-black"
                      :class="{
                        '!bg-blue-200 !text-gray-900 hover:!bg-blue-100':
                          selectedVendors.some((vendor) => vendor === item.id),
                      }">
                      <span class="block truncate font-normal">{{ item.title }}</span>
                    </li>
                  </ListboxOption>
                </ListboxOptions>
              </transition>
            </Listbox>
          </div>

          <!-- <div class="relative inline-block text-left">
            <Listbox v-model="selectedBrands" multiple>
              <div class="flex w-full items-center justify-between">
                <p class="pb-2 text-[13px] font-semibold text-[#101828]">
                  Бренд
                </p>
                <SelectAll :list="data?.data?.filters?.brands" v-model="selectedBrands" />
              </div>

              <ListboxButton
                class="inline-flex w-full justify-between rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none">
                <p class="text-sm font-normal text-gray-400">Бренд</p>
              </ListboxButton>
              <transition leave-active-class="transition ease-in duration-100" leave-from-class="opacity-100"
                leave-to-class="opacity-0">
                <ListboxOptions
                  class="absolute top-0 z-10 mt-1 max-h-36 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                  <ListboxOption v-for="item in brands?.data" :key="item.id" :value="item" as="template">
                    <li class="mx-1 my-1 cursor-pointer select-none rounded bg-gray-50 py-2 pl-3 pr-9 text-black"
                      :class="{
                        '!bg-blue-200 !text-gray-900 hover:!bg-blue-100':
                          selectedBrands.some((brand) => brand === item.id?.toString()),
                      }">
                      <span class="block truncate font-normal">{{ item.name }}</span>
                    </li>
                  </ListboxOption>
                </ListboxOptions>
              </transition>
            </Listbox>
          </div> -->
          <Button variant='tertiary' class="w-full text-base font-semibold mt-4" type="button" @click='addToInterests'>
            Добавить в Интересы
          </Button>
          <Button v-if="buttonMode === 'show-all' && interestsList?.length !== 0" variant='tertiary'
            class="text-base font-semibold" type="button" @click="filterByInterests">
            Отображать только мои интересы
          </Button>
          <Button v-if="buttonMode === 'show-interests'" variant='tertiary' class="text-base font-semibold"
            type="button" @click="filterByAll">
            Отображать все
          </Button>
        </div>
        <div v-else class="h-[calc(100vh-177px)] w-full border-t border-[#D0D4DB] bg-[#F9FAFB]">
          <div class="mx-auto flex flex-col items-center justify-center gap-y-6 p-4">
            <img src="./assets/star.png" class="mt-4">
            <div class="flex flex-col items-center gap-y-2">
              <p class="text-[16px]">Добавлено</p>
              <p class="text-center text-[12px] text-[#858FA3]">
                Чтобы посмотреть или удалить интерес, зайдите в этот <br />
                раздел через меню
              </p>
            </div>
          </div>
        </div>
      </ScrollArea>

      <div v-if='!showAddedMessage' class="w-full border-t border-[#CCD0D9] bg-[#F9FAFB] p-4 md:min-w-[305px]">
        <Button class="w-full text-[17px] font-semibold" type="submit">
          Применить фильтр
        </Button>
      </div>
    </form>
  </div>
</template>

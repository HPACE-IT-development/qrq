<script lang="ts" setup>
  import { Button } from '@/shared/ui/button';
  import { X } from 'lucide-vue-next';
  import { defineProps, onMounted, ref, watch } from 'vue';
  import { useFilter } from '../lib/schema';
  import FilterInput from './filter-input.vue';

  import { searchQuery } from '@/entities/offer';
  import {
    $filterValues,
    filterSubmitted,
  } from '@/features/filter/model/filter-model';
  import SelectAll from '@/features/filter/ui/select-all.vue';
  import { ScrollArea } from '@/shared/ui/scroll-area';
  import {
    Listbox,
    ListboxButton,
    ListboxOption,
    ListboxOptions,
  } from '@headlessui/vue';
  import { useUnit } from 'effector-vue/composition';
  import { createInterestQuery } from '@/pages/my-interests/model/interests-page-model';

  defineProps<{
    isFilterCardOpen: boolean;
  }>();

  const selectedVendors = ref<string[]>([]);
  const selectedBrands = ref<string[]>([]);

  const showAddedMessage = ref<boolean>(false);

  const handleFilterSubmit = useUnit(filterSubmitted);

  const selectedCities = ref<number[]>([]);

  const { data, pending } = useUnit(searchQuery);
  const filterValues = useUnit($filterValues);

  const { form } = useFilter(data?.value?.data.filters as any);

  const emit = defineEmits(['close-filter-card']);

  const onSubmit = async (event: Event) => {
    event.preventDefault();
    await form.validate();

    if (Object.keys(form.errors.value).length === 0) {
      const values = form.values;
      const vendors = selectedVendors.value;
      const brands = selectedBrands.value;
      const cities = selectedCities.value;

      handleFilterSubmit({ ...values, vendors, brands, cities });

      closeFilter();
    }
  };

  const addToInterests = async () => {
    await form.validate();

    if (Object.keys(form.errors.value).length === 0) {
      const values = form.values;
      const vendors = selectedVendors.value;
      const brands = selectedBrands.value;
      const cities = selectedCities.value;

      createInterestQuery.start({ ...values, vendors, brands, cities });
        showAddedMessage.value = true;
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
      selectedCities.value = (filterValues.value?.cities as number[]) ?? [];
      selectedVendors.value = (filterValues.value?.vendors as string[]) ?? [];
      selectedBrands.value = (filterValues.value?.brands as string[]) ?? [];
    }
  });

  onMounted(() => {
    if (filterValues.value) {
      form.setValues({
        article: filterValues.value?.article,
        denomination: filterValues.value?.denomination,
        priceFrom: filterValues?.value?.priceFrom,
        priceTo: filterValues?.value?.priceTo,
        countFrom: filterValues?.value?.countFrom,
        countTo: filterValues?.value?.countTo,
      });
      selectedCities.value = (filterValues.value?.cities as number[]) ?? [];
      selectedVendors.value = (filterValues.value?.vendors as string[]) ?? [];
      selectedBrands.value = (filterValues.value?.brands as string[]) ?? [];
    }
  });
</script>

<template>
  <div
    v-if="isFilterCardOpen"
    class="flex max-h-screen w-full flex-col justify-between overflow-y-hidden bg-white lg:max-w-[355px]">
    <div
      class="flex cursor-pointer items-center justify-between gap-x-2 border-b border-l border-r border-[#D0D4DB] px-2 py-4">
      <div class="group flex items-center gap-x-2" @click="closeFilter">
        <Button variant="ghost" size="icon">
          <X class="h-7 w-7 text-primary group-hover:text-primary/70" />
        </Button>
        <p
          class="text-center text-[17px] text-primary group-hover:text-primary/70">
          Закрыть
        </p>
      </div>

      <Button
        variant="ghost"
        type="button"
        v-if="showClearButton && !showAddedMessage"
        @click="
          () => {
            form.resetForm();
            closeFilter();
          }
        "
        class="group flex cursor-pointer items-center gap-x-2 px-2 py-2">
        <p
          class="text-center text-[17px] font-normal text-primary group-hover:text-primary/70">
          Очистить
        </p>
      </Button>
    </div>

    <form
      @submit="onSubmit"
      class="flex h-[calc(100%-64px)] flex-col justify-between border-l border-r border-[#D0D4DB] bg-white">
      <ScrollArea>
        <div class="flex flex-col gap-y-4 p-4" v-if='!showAddedMessage'>
          <p class="text-[20px] font-semibold text-[#101828]">Фильтр</p>

          <FilterInput
            name="denomination"
            label="Наименование"
            placeholder="Наименование" />
          <FilterInput name="article" label="Артикул" placeholder="Артикул" />

          <div class="relative inline-block text-left">
            <Listbox v-model="selectedCities" multiple>
              <div class="flex w-full items-center justify-between">
                <p class="py-2 text-[13px] font-semibold text-[#101828]">
                  Населенный пункт
                </p>
                <SelectAll
                  :list="data?.data?.filters?.cities?.map((item) => item.id)"
                  v-model="selectedCities" />
              </div>

              <ListboxButton
                class="inline-flex w-full justify-between rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium shadow-sm hover:bg-gray-50">
                <p class="text-sm font-normal text-gray-400">
                  Населенный пункт
                </p>
              </ListboxButton>
              <transition
                leave-active-class="transition ease-in duration-100"
                leave-from-class="opacity-100"
                leave-to-class="opacity-0">
                <ListboxOptions
                  class="absolute z-10 mt-1 max-h-36 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                  <ListboxOption
                    v-for="item in data?.data?.filters?.cities"
                    :key="item.id"
                    :value="item.id"
                    as="template">
                    <li
                      class="mx-1 my-1 cursor-pointer select-none rounded bg-gray-50 py-2 pl-3 pr-9 text-black"
                      :class="{
                        '!bg-blue-200 !text-gray-900 hover:!bg-blue-100':
                          selectedCities.some((city) => city === item.id),
                      }">
                      <span class="block truncate font-normal">
                        {{ item.title }}</span
                      >
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
                <SelectAll
                  :list="data?.data?.filters?.vendors"
                  v-model="selectedVendors" />
              </div>

              <ListboxButton
                class="inline-flex w-full justify-between rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium shadow-sm hover:bg-gray-50">
                <p class="text-sm font-normal text-gray-400">Поставщик</p>
              </ListboxButton>

              <transition
                leave-active-class="transition ease-in duration-100"
                leave-from-class="opacity-100"
                leave-to-class="opacity-0">
                <ListboxOptions
                  class="absolute z-10 mt-1 max-h-36 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                  <ListboxOption
                    v-for="item in data?.data?.filters?.vendors"
                    :key="item"
                    :value="item"
                    as="template">
                    <li
                      class="mx-1 my-1 cursor-pointer select-none rounded bg-gray-50 py-2 pl-3 pr-9 text-black"
                      :class="{
                        '!bg-blue-200 !text-gray-900 hover:!bg-blue-100':
                          selectedVendors.some((vendor) => vendor === item),
                      }">
                      <span class="block truncate font-normal">{{ item }}</span>
                    </li>
                  </ListboxOption>
                </ListboxOptions>
              </transition>
            </Listbox>
          </div>

          <div class="relative inline-block text-left">
            <Listbox v-model="selectedBrands" multiple>
              <div class="flex w-full items-center justify-between">
                <p class="pb-2 text-[13px] font-semibold text-[#101828]">
                  Бренд
                </p>
                <SelectAll
                  :list="data?.data?.filters?.vendors"
                  v-model="selectedVendors" />
              </div>

              <ListboxButton
                class="inline-flex w-full justify-between rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none">
                <p class="text-sm font-normal text-gray-400">Бренд</p>
              </ListboxButton>
              <transition
                leave-active-class="transition ease-in duration-100"
                leave-from-class="opacity-100"
                leave-to-class="opacity-0">
                <ListboxOptions
                  class="absolute top-0 z-10 mt-1 max-h-36 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                  <ListboxOption
                    v-for="item in data?.data?.filters?.brands"
                    :key="item"
                    :value="item"
                    as="template">
                    <li
                      class="mx-1 my-1 cursor-pointer select-none rounded bg-gray-50 py-2 pl-3 pr-9 text-black"
                      :class="{
                        '!bg-blue-200 !text-gray-900 hover:!bg-blue-100':
                          selectedBrands.some((brand) => brand === item),
                      }">
                      <span class="block truncate font-normal">{{ item }}</span>
                    </li>
                  </ListboxOption>
                </ListboxOptions>
              </transition>
            </Listbox>
          </div>
          <Button
            variant='tertiary'
            class="w-full text-[17px] font-semibold mt-4"
            type="button"
            @click='addToInterests'>
            Добавить в Интересы
          </Button>
        </div>
        <div
          v-else
          class="h-[calc(100vh-177px)] w-full border-t border-[#D0D4DB] bg-[#F9FAFB]">
          <div class="mx-auto flex flex-col items-center justify-center gap-y-6 p-4">
            <img src="./assets/star.png" class="mt-4">
            <div class="flex flex-col items-center gap-y-2">
              <p class="text-[16px]">Добавлено</p>
              <p class="text-center text-[12px] text-[#858FA3]">
                Чтобы посмотреть или удалить интерес, зайдите в этот <br/>
                раздел через меню
              </p>
            </div>
          </div>
        </div>
      </ScrollArea>

      <div
        v-if='!showAddedMessage'
        class="w-full border-t border-[#CCD0D9] bg-[#F9FAFB] p-4 md:min-w-[305px]">
        <Button class="w-full text-[17px] font-semibold" type="submit">
          Применить фильтр
        </Button>
      </div>
    </form>
  </div>
</template>

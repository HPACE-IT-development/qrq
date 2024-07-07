<script setup lang="ts">
  import { Button, FormControl, FormField, FormItem, FormLabel, FormMessage, Input } from '@/shared/ui';
  import { ChevronDown, X } from 'lucide-vue-next';
  import { useGate, useStore, useUnit } from 'effector-vue/composition';
  import { onMounted, onUnmounted, ref, watch } from 'vue';
  import { useCreateAdvertisementForm } from '../lib/create-form';
  import {
    $advertisementType,
    $formMode,
    advertisementTypeSelected,
    articles,
    createAdvertisementMounted,
    findNomenclatures,
    formClosed,
    formSubmitted,
    getBrands,
    getCategories,
    getDestinations,
    getNomenclatures,
    names,
    nomenclatures,
    nomenclaturesGate,
    nomenclatureTypeSelected,
  } from '../model/create-advertisement';
  import {
    Listbox,
    ListboxButton,
    ListboxOption,
    ListboxOptions,
    TransitionChild,
    TransitionRoot,
  } from '@headlessui/vue';
  import { cn } from '@/shared/lib';
  import { ScrollArea } from '@/shared/ui/scroll-area';
  import SuggestionInput from '@/shared/ui/input/suggestion-input.vue';

  const emit = defineEmits(['close']);
  const {
    advertisementTypeSelected: handleSelectedType,
    $formMode: formMode,
    nomenclatureTypeSelected: handleNomenclatureType,
    findNomenclatures: handleFindNomenclatures,
  } =
    useUnit({
      advertisementTypeSelected,
      nomenclatureTypeSelected,
      $formMode,
      findNomenclatures,
    });

  const advertisementType = useUnit($advertisementType);
  const { data: destinationsArray } = useUnit(getDestinations);

  const { data: categories } = useUnit(getCategories);
  const { data: brands } = useUnit(getBrands);

  useGate(nomenclaturesGate);
  const loading = useStore(getNomenclatures.$pending);

  const { form, article, name, destinations, category, brand } = useCreateAdvertisementForm(
    advertisementType.value,
  );
  const type = ref('find');
  const countOfChanges = ref(0);

  const onSubmit = async () => {
    await form.validate();
    if (Object.keys(form.errors.value).length < 1) {
      formSubmitted(form.values);
    }
  };

  const updateNomenclature = async () => {
    handleNomenclatureType('update');
    // @ts-ignore
    formSubmitted({
      name: name.value,
      article: article.value,
      destinations: destinations.value,
      ...form.values,
    });

    popoverOpened.value = false;
    handleClose();
  };

  const createNomenclature = async () => {
    handleNomenclatureType('create');
    // @ts-ignore
    formSubmitted({
      name: name.value,
      article: article.value,
      destinations: destinations.value,
      ...form.values,
    });

    popoverOpened.value = false;
    handleClose();
  };

  function handleClose() {
    emit('close');
    formClosed();
  }

  const popoverOpened = ref(false);

  const publishRequest = async () => {
    if (type.value === 'create') handleNomenclatureType('create');
    await onSubmit();
    emit('close');
  };

  const selectData = (data: string, field: string) => {
    if (field === 'name') name.value = data;
    if (field === 'article') article.value = data;
    type.value = 'find';
  };
  const selectedDestinations = ref([]);

  const changeDestinations = (value: any) => {
    selectedDestinations.value = value;
    destinations.value = selectedDestinations.value.map((destination: any) => {
      return destination.id;
    });
  };

  watch([
    () => name.value,
    () => article.value,
    () => selectedDestinations.value,
  ], (array) => {
    if (type.value === 'find') {
      if (countOfChanges.value <= 0) {
        let foundedNomenclatures = [];
        // @ts-ignore
        handleFindNomenclatures(name.value ?? article.value);
        foundedNomenclatures = nomenclatures.value[0];

        if (foundedNomenclatures) {
          type.value = 'find';
          article.value = foundedNomenclatures.article;
          name.value = foundedNomenclatures.name;

          if (foundedNomenclatures?.destinations.length !== 0 && selectedDestinations.value?.length === 0) {
            for (let destination of foundedNomenclatures?.destinations) {
              // @ts-ignore
              selectedDestinations.value.push(destinationsArray.value?.data.find((item) => destination === item.id));
            }
            destinations.value = selectedDestinations.value.map((destination: any) => {
              return destination.id;
            });
          }
        } else {
          type.value = 'create';
        }

        setTimeout(() => {
          if (
            name.value !== undefined &&
            article.value !== undefined &&
            destinations.value !== undefined &&
            type.value !== 'create'
          ) {
            countOfChanges.value++;
          }
        }, 100);
      }
      if (countOfChanges.value >= 2 && type.value !== 'create') popoverOpened.value = true;
    }
  });

  onMounted(() => {
    createAdvertisementMounted();

    document.addEventListener('keydown', (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        handleClose();
      }
    });
  });

  onUnmounted(() => {
    document.removeEventListener('keydown', (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        handleClose();
      }
    });
  });

</script>

<template>
  <div
    class="absolute bottom-0 left-0 top-0 flex h-screen w-full flex-col items-center border-b border-r border-[#D0D4DB] bg-white md:max-w-[356px] z-3">
    <div
      class="flex w-full items-center justify-start gap-x-2 border-b border-[#D0D4DB] px-4 py-2">
      <Button @click="handleClose" size="icon" variant="ghost">
        <img
          src="./assets/backicon.svg"
          class="h-6 w-6 select-none"
          alt="arrow" />
      </Button>
      <p class="cursor-default text-[18px] font-semibold leading-3">
        Заявка на {{ advertisementType === 'sell' ? 'продажу' : 'покупку' }}
      </p>
      <Button
        v-if="formMode === 'form'"
        @click="handleClose"
        variant="ghost"
        size="icon"
        class="ml-auto">
        <X class="h-7 w-7 select-none" color="#0017FC" />
      </Button>
    </div>
    <ScrollArea
      class="flex h-[calc(100vh-40px)] w-full flex-col items-center gap-y-10 bg-[#F9FAFB] [&>div>div]:!flex [&>div>div]:h-full [&>div>div]:flex-col">
      <template v-if="formMode === 'selectType'">
        <div class="mt-20 flex flex-col items-center gap-y-4 px-5">
          <img src="./assets/bag.svg" alt="bag" class="h-[60px] w-[60px]" />
          <p class="text-[17px] font-medium">Хотите купить или продать?</p>
        </div>
        <div class="mt-6 flex w-full gap-x-4 px-5">
          <Button
            class="w-full rounded-[10px] text-[16px]"
            @click="handleSelectedType('buy')"
          >
            Купить
          </Button
          >
          <Button
            class="w-full rounded-[10px] text-[16px]"
            @click="handleSelectedType('sell')"
          >
            Продать
          </Button
          >
        </div>
      </template>
      <template v-else>
        <form @submit="onSubmit" class="my-5 flex w-full flex-col gap-y-4 px-5">
          <suggestion-input
            v-model='name'
            :options='names'
            label='Наименование'
            :loading='loading'

            @find='value => handleFindNomenclatures(value)'
            @select="(selectedName: any) => selectData(selectedName, 'name')"
          />
          <suggestion-input
            v-model='article'
            :options='articles'
            label='Артикул'
            :loading='loading'

            @find='value => handleFindNomenclatures(value)'
            @select="(selectedArticle: any) => selectData(selectedArticle, 'article')"
          />
          <FormField v-slot="{ componentField }" name="count">
            <FormItem>
              <FormLabel class='pb-2 text-[14px] font-semibold text-[#101828]'>Количество</FormLabel>

              <FormControl>
                <Input
                  class="h-fit rounded-[8px] border border-[#D0D4DB] px-4 py-2 text-[16px] placeholder:text-[#858FA3]"
                  type="number"
                  placeholder="Количество"
                  v-bind="componentField" />
              </FormControl>
              <FormMessage />
            </FormItem>
          </FormField>
          <FormField
            v-slot="{ componentField }"
            name="price"
            v-if="advertisementType === 'sell'"
          >
            <FormItem>
              <FormLabel class='pb-2 text-[14px] font-semibold text-[#101828]'>Цена</FormLabel>
              <FormControl>
                <Input
                  class="h-fit rounded-[8px] border border-[#D0D4DB] px-4 py-2 text-[16px] placeholder:text-[#858FA3]"
                  type="number"
                  placeholder="Цена"
                  v-bind="componentField" />
              </FormControl>
              <FormMessage />
            </FormItem>
          </FormField>
          <FormField
            v-if="advertisementType === 'sell'"
            v-slot="{ componentField }"
            name="delivery_time"
          >
            <FormItem>
              <FormLabel class='pb-2 text-[14px] font-semibold text-[#101828]'>Срок до клиента</FormLabel>
              <FormControl>
                <Input
                  class="h-fit rounded-[8px] border border-[#D0D4DB] px-4 py-2 text-[16px] placeholder:text-[#858FA3]"
                  type="number"
                  placeholder="Срок до клиента"
                  v-bind="componentField" />
              </FormControl>
              <FormMessage />
            </FormItem>
          </FormField>
          <div class="relative inline-block text-left">
            <Listbox
              :model-value="selectedDestinations"
              multiple
              @update:model-value='changeDestinations'
            >
              <p class="pb-2 text-[14px] font-semibold text-[#101828]">
                Назначение
              </p>
              <ListboxButton
                class="inline-flex w-full justify-between rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium hover:bg-gray-50">
                <p
                  :class="
                    cn(
                      'text-[16px] font-normal tracking-wide text-[#858FA3]',
                      selectedDestinations.length && 'text-black',
                    )
                  ">
                  {{ selectedDestinations?.length > 0 ? selectedDestinations?.map((destination: any) => destination.name).join(', ') : 'Назначение'
                  }}
                </p>
                <ChevronDown color="#858FA3" class="h-5 w-5" />
              </ListboxButton>

              <transition
                leave-active-class="transition ease-in duration-100"
                leave-from-class="opacity-100"
                leave-to-class="opacity-0">
                <ListboxOptions
                  class="absolute z-10 w-full max-h-60 overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                  <ListboxOption
                    v-if="destinationsArray"
                    v-for="item in destinationsArray?.data"
                    :value="item"
                    v-slot='{ selected }'
                  >
                    <li
                      :class="
                        cn(
                          'mx-1 my-1 cursor-pointer select-none rounded py-2 pl-3 pr-9 text-gray-900 hover:bg-opacity-90',
                          selected &&
                          'bg-gray-200 text-black',
                        )
                      ">
                      <span class="block truncate font-normal">
                        {{ item?.name }}
                      </span>
                    </li>
                  </ListboxOption>
                </ListboxOptions>
              </transition>
            </Listbox>
          </div>
          <div class="relative inline-block text-left" v-if="advertisementType === 'sell'">
            <Listbox v-model="category">
              <p class="pb-2 text-[14px] font-semibold text-[#101828]">
                Категория
              </p>
              <ListboxButton
                class="inline-flex w-full justify-between rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium hover:bg-gray-50">
                <p
                  :class="
                    cn(
                      'text-[16px] font-normal tracking-wide text-[#858FA3]',
                      category && 'text-black',
                    )
                  ">
                  {{
                    categories?.data?.find((value) => value.id === category)
                      ?.name ?? 'Категория'
                  }}
                </p>
                <ChevronDown color="#858FA3" class="h-5 w-5" />
              </ListboxButton>

              <transition
                leave-active-class="transition ease-in duration-100"
                leave-from-class="opacity-100"
                leave-to-class="opacity-0">
                <ListboxOptions
                  class="absolute z-10 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                  <ListboxOption
                    v-if="categories?.data"
                    v-for="item in categories?.data"
                    :value="item.id">
                    <li
                      :class="
                        cn(
                          'mx-1 my-1 cursor-pointer select-none rounded py-2 pl-3 pr-9 text-gray-900 hover:bg-opacity-90',
                          category === parseInt(item?.id ?? '0') &&
                            'bg-gray-200 text-black',
                        )
                      ">
                      <span class="block truncate font-normal">
                        {{ item.name }}
                      </span>
                    </li>
                  </ListboxOption>
                </ListboxOptions>
              </transition>
            </Listbox>
          </div>

          <div class="relative mb-5 inline-block text-left" v-if="advertisementType === 'sell'">
            <Listbox v-model="brand">
              <p class="pb-2 text-[14px] font-semibold text-[#101828]">Бренд</p>
              <ListboxButton
                class="inline-flex w-full justify-between rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium hover:bg-gray-50">
                <p
                  :class="
                    cn(
                      'text-[16px] font-normal tracking-wide text-[#858FA3]',
                      brand && 'text-black',
                    )
                  ">
                  {{
                    brands?.data?.find((value) => value.id === brand)?.name ??
                    'Бренд'
                  }}
                </p>
                <ChevronDown color="#858FA3" class="h-5 w-5" />
              </ListboxButton>

              <transition
                leave-active-class="transition ease-in duration-100"
                leave-from-class="opacity-100"
                leave-to-class="opacity-0">
                <ListboxOptions
                  class="absolute w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                  <ListboxOption
                    v-if="brands?.data"
                    v-for="item in brands?.data"
                    :value="item.id">
                    <li
                      :class="
                        cn(
                          'mx-1 my-1 cursor-pointer select-none rounded py-2 pl-3 pr-9 text-gray-900 hover:bg-opacity-90',
                          brand === parseInt(item?.id ?? '0') &&
                            'bg-gray-200 text-black',
                        )
                      ">
                      <span class="block truncate font-normal">
                        {{ item.name }}
                      </span>
                    </li>
                  </ListboxOption>
                </ListboxOptions>
              </transition>
            </Listbox>
          </div>
        </form>
      </template>
    </ScrollArea>
    <div
      v-if="advertisementType"
      class="mt-auto flex w-full items-center justify-center border-t border-[#D0D4DB] p-4">
      <Button @click="publishRequest" class="w-full rounded-[9px] text-[16px]">
        Опубликовать заявку
      </Button>
    </div>
    <TransitionRoot :show="popoverOpened" as="div">
      <TransitionChild
        as="div"
        enter="duration-300 ease-out"
        enter-from="opacity-0"
        enter-to="opacity-100"
        leave="duration-200 ease-in"
        leave-from="opacity-100"
        leave-to="opacity-0"
      >
        <div class="absolute inset-0 bg-black/25 z-2 min-h-[100%]" />
      </TransitionChild>
      <div class='absolute left-0 bottom-0 z-3'>
        <TransitionChild
          appear
          as='div'
          enter="transition-all duration-300"
          enter-from="opacity-0"
          enter-to="opacity-100"
          leave="transition-all duration-350"
          leave-from="opacity-100"
          leave-to="opacity-0"
        >
          <div class='bg-white h-54 w-full rounded-t-md'>
            <h2 class="w-full h-20 border-b-2 border-b-gray-100 border-solid p-4 text-blue-700 font-semibold">Вы
              изменили номенклатуру. Выберите действие</h2>
            <div class="flex flex-col gap-4 items-start p-4">
              <button @click="updateNomenclature">Сохранить с новыми значениями</button>
              <button @click="createNomenclature">Создать новую</button>
              <button @click="popoverOpened = false">Назад</button>
            </div>
          </div>
        </TransitionChild>
      </div>
    </TransitionRoot>
  </div>
</template>

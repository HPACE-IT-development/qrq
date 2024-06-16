<script setup lang="ts">
  import {
    Button,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
    Input,
  } from '@/shared/ui';
  import { ChevronDown, X } from 'lucide-vue-next';
  import { useUnit } from 'effector-vue/composition';
  import { onMounted, onUnmounted, ref, watch } from 'vue';
  import { useCreateAdvertisementForm } from '../lib/create-form';
  import {
    $advertisementType,
    $formMode,
    advertisementTypeSelected,
    createAdvertisementMounted,
    formClosed,
    formSubmitted,
    getDestinations,
    nomenclatureTypeSelected,
    $nomenclatureStore,
    names,
    articles, $nomenclatureType,
  } from '../model/create-advertisement';
  import {
    Listbox,
    ListboxButton,
    ListboxOption,
    ListboxOptions,
    TransitionRoot,
    TransitionChild,
  } from '@headlessui/vue';
  import { cn } from '@/shared/lib';
  import { ScrollArea } from '@/shared/ui/scroll-area';
  import SuggestionInput from '@/shared/ui/input/suggestion-input.vue';


  const emit = defineEmits(['close']);
  const {
    advertisementTypeSelected: handleSelectedType,
    $formMode: formMode,
    $nomenclatureType: nomenclatureType,
    nomenclatureTypeSelected: handleNomenclatureType,
    $nomenclatureStore: nomenclatureStore
  } =
    useUnit({
      $nomenclatureStore,
      $nomenclatureType,
      advertisementTypeSelected,
      nomenclatureTypeSelected,
      $formMode,
    });

  // const { data: categories } = useUnit(getCategories);
  // const { data: brands } = useUnit(getBrands);

  const advertisementType = useUnit($advertisementType);

  const { data: destinations } = useUnit(getDestinations)

  const { form, article, name, destination } = useCreateAdvertisementForm(
    advertisementType.value,
  );

  const findedNomenclature = ref();
  const type = ref("");
  const countOfChanges = ref(0);

  const onSubmit = async () => {
    await form.validate();
    console.log(form.errors.value);
    if (Object.keys(form.errors.value).length < 1) {
      formSubmitted(form.values);
    }
  };

  const updateNomenclature = () => {
    handleNomenclatureType('update')
    // @ts-ignore
    formSubmitted({
      name: name.value,
      article: article.value,
      destinations: [destination.value]
    })
    popoverOpened.value = false;
    onSubmit()
  }

  const createNomenclature = () => {
    handleNomenclatureType('create');
    formSubmitted(findedNomenclature.value)
    popoverOpened.value = false;
    onSubmit()
  }

  function handleClose() {
    emit('close');
    formClosed();
  }
  const popoverOpened = ref(false);

  const publishRequest = () => {
    if (type.value === 'create') handleNomenclatureType('create')
    onSubmit()
    emit('close');
  }

  const selectData = (data: { id: number, name: string } | string, field: string) => {
    if (typeof data === 'string') {
      if (field === 'name') name.value = data
      if (field === 'article') article.value = data
      type.value = 'create'
    }
    else {
      if (field === 'name') name.value = data.name
      if (field === 'article') article.value = data.name
      type.value = 'find'
    }
  }

  watch([
    () => name.value,
    () => article.value,
    () => destination.value
  ], (array) => {
    if (type.value === 'find') {
      if (countOfChanges.value <= 0) {
        nomenclatureStore.value?.map((nomenclature, index) => {
          if (index % 50 === 0) {
            // @ts-ignore
            if (nomenclature.name === name.value || nomenclature.article === article.value) {
              findedNomenclature.value = nomenclature
              // @ts-ignore
              article.value = nomenclature.article
              // @ts-ignore
              name.value = nomenclature.name
              // @ts-ignore
              destination.value = nomenclature.destinations[0]
            }
          }
        })
      } else {
        name.value = array[0]
        article.value = array[1]
        destination.value = array[2]
      }
      if (countOfChanges.value >= 2) popoverOpened.value = true
      countOfChanges.value++
    } else if (name.value !== undefined && article.value !== undefined && destination.value !== undefined) {
      if (type.value === 'create' && countOfChanges.value >= 1) popoverOpened.value = true
      countOfChanges.value++
    }
  })

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
    })
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
            :default-value='name'
            :options='names'
            label='Наименование'

            @select="(selectedName: any) => selectData(selectedName, 'name')"
          />
          <suggestion-input
            :default-value='article'
            :options='articles'
            label='Артикул'

            @select="(selectedArticle: any) => selectData(selectedArticle, 'article')"
          />
<!--          <FormField v-slot="{ componentField }" name="article">-->
<!--            <FormItem>-->
<!--              <FormLabel>Артикул</FormLabel>-->
<!--              <FormControl>-->
<!--                <Input-->
<!--                  class="h-fit rounded-[8px] border border-[#D0D4DB] px-4 py-2 text-[16px] placeholder:text-[#858FA3]"-->
<!--                  type="text"-->
<!--                  placeholder="Артикул"-->
<!--                  v-bind="componentField" />-->
<!--              </FormControl>-->
<!--              <FormMessage />-->
<!--            </FormItem>-->
<!--          </FormField>-->
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
          <div class="relative inline-block text-left">
            <Listbox v-model="destination">
              <p class="pb-2 text-[14px] font-semibold text-[#101828]">
                Назначение
              </p>
              <ListboxButton
                class="inline-flex w-full justify-between rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium hover:bg-gray-50">
                <p
                  :class="
                    cn(
                      'text-[16px] font-normal tracking-wide text-[#858FA3]',
                      destinations && 'text-black',
                    )
                  ">
                  {{
                    destinations?.data?.find((data) => data.id === destination)?.name
                    ?? 'Назначение'
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
                    v-if="destinations?.data"
                    v-for="item in destinations?.data"
                    :value="item.id">
                    <li
                      :class="
                        cn(
                          'mx-1 my-1 cursor-pointer select-none rounded py-2 pl-3 pr-9 text-gray-900 hover:bg-opacity-90',
                          destination === item.name &&
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
<!--          <FormField v-slot="{ componentField }" name="available">-->
<!--            <FormItem>-->
<!--              <FormLabel>Срок до клиента</FormLabel>-->

<!--              <FormControl>-->
<!--                <Input-->
<!--                  class="h-fit rounded-[8px] border border-[#D0D4DB] px-4 py-2 text-[16px] placeholder:text-[#858FA3]"-->
<!--                  type="number"-->
<!--                  placeholder="Срок до клиента"-->
<!--                  v-bind="componentField" />-->
<!--              </FormControl>-->
<!--              <FormMessage />-->
<!--            </FormItem>-->
<!--          </FormField>-->
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
            <h2 class="w-full h-20 border-b-2 border-b-gray-100 border-solid p-4 text-blue-700 font-semibold">Вы изменили номенклатуру. Выберите действие</h2>
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

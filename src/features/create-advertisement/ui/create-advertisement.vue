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
  import { computed, onMounted, onUnmounted, ref, watch } from 'vue';
  import { useCreateAdvertisementForm } from '../lib/create-form';
  import {
    $advertisementType,
    $formMode,
    advertisementTypeSelected,
    createAdvertisementMounted,
    formClosed,
    formSubmitted,
    getArticles,
    getDestinations,
    getNames,
    getNomenclatures,
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
  import {
    Dialog,
    DialogPanel,
    DialogTitle,
    DialogDescription,
  } from '@headlessui/vue'
  import SuggestionInput from '@/shared/ui/input/suggestion-input.vue';


  const emit = defineEmits(['close']);
  const { advertisementTypeSelected: handleSelectedType, $formMode: formMode } =
    useUnit({
      advertisementTypeSelected,
      $formMode,
    });

  // const { data: categories } = useUnit(getCategories);
  // const { data: brands } = useUnit(getBrands);

  const advertisementType = useUnit($advertisementType);

  const { data: nomenclatures } = useUnit(getNomenclatures)
  const { data: destinations } = useUnit(getDestinations)
  const { data: articles } = useUnit(getArticles)
  const { data: names } = useUnit(getNames)

  const { form, article, name, destination } = useCreateAdvertisementForm(
    advertisementType.value,
  );

  const findedNomenclature = ref();
  const countOfChangesNomenclature = ref(0);

  const onSubmit = async () => {
    await form.validate();
    console.log(form.errors.value);
    if (Object.keys(form.errors.value).length < 1) {
      emit('close');
      console.log(form.values);
      formSubmitted(form.values);
    }
  };

  function handleClose() {
    emit('close');
    formClosed();
  }
  const popoverOpened = ref(true);

  watch([() => name.value, () => article.value, () => countOfChangesNomenclature.value], (array) => {
    console.log(countOfChangesNomenclature.value);
    if (countOfChangesNomenclature.value >= 4) {
      popoverOpened.value = true
    } else if (array[0] || array[1]) {
      findedNomenclature.value = nomenclatures.value?.data?.filter((nomenclature) => article.value === nomenclature.article || name.value === nomenclature.name)[0];
      article.value = findedNomenclature.value?.article
      name.value = findedNomenclature.value?.name
      destination.value = destinations.value?.data.filter((destination) => findedNomenclature.value.destination === destination.id)[0]?.name
      countOfChangesNomenclature.value = countOfChangesNomenclature.value + 1
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

  onUnmounted(() =>
    document.removeEventListener('keydown', (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        handleClose();
      }
    }),
  );
</script>

<template>
  <div
    class="absolute bottom-0 left-0 top-0 flex h-screen w-full flex-col items-center border-b border-r border-[#D0D4DB] bg-white md:max-w-[356px]">
    <div
      class="flex w-full items-center justify-start gap-x-2 border-b border-[#D0D4DB] px-4 py-2">
      <Button class="-ml-2" @click="handleClose" size="icon" variant="ghost">
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
            >Купить</Button
          >
          <Button
            class="w-full rounded-[10px] text-[16px]"
            @click="handleSelectedType('sell')"
            >Продать</Button
          >
        </div>
      </template>
      <template v-else>
        <form @submit="onSubmit" class="my-5 flex w-full flex-col gap-y-4 px-5">
          <suggestion-input
            :default-value='name'
            :options='names'
            label='Наименование'

            @select='selectedName => name = selectedName.name'
          />
          <suggestion-input
            :default-value='article'
            :options='articles'
            label='Артикул'

            @select='selectedArticle => article = selectedArticle.name'
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
                  class="absolute z-10 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-black ring-opacity-5 focus:outline-none sm:text-sm">
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
<!--    {{ popoverOpened }}-->
    <div
      v-if="advertisementType"
      class="mt-auto flex w-full items-center justify-center border-t border-[#D0D4DB] p-4">
      <Button @click="onSubmit" class="w-full rounded-[9px] text-[16px]">
        Опубликовать заявку
      </Button>
    </div>
<!--    <TransitionRoot appear :show="popoverOpened" as="template">-->
<!--      <Dialog as="div" @close="popoverOpened = !popoverOpened" class="relative z-2 w-full">-->
<!--        <TransitionChild-->
<!--            as="template"-->
<!--            enter="duration-300 ease-out"-->
<!--            enter-from="opacity-0"-->
<!--            enter-to="opacity-100"-->
<!--            leave="duration-200 ease-in"-->
<!--            leave-from="opacity-100"-->
<!--            leave-to="opacity-0"-->
<!--        >-->
<!--          <div class="fixed inset-0 bg-black/25" />-->
<!--        </TransitionChild>-->

<!--        <div class="fixed inset-0 overflow-y-auto">-->
<!--          <div-->
<!--              class="flex min-h-full items-center justify-center p-4 text-center"-->
<!--          >-->
<!--            <TransitionChild-->
<!--                as="template"-->
<!--                enter="duration-300 ease-out"-->
<!--                enter-from="opacity-0 scale-95"-->
<!--                enter-to="opacity-100 scale-100"-->
<!--                leave="duration-200 ease-in"-->
<!--                leave-from="opacity-100 scale-100"-->
<!--                leave-to="opacity-0 scale-95"-->
<!--            >-->
<!--              <DialogPanel>-->
<!--                <DialogTitle>Deactivate account</DialogTitle>-->
<!--                <DialogDescription>-->
<!--                  This will permanently deactivate your account-->
<!--                </DialogDescription>-->

<!--                <p>-->
<!--                  Are you sure you want to deactivate your account? All of your data will be-->
<!--                  permanently removed. This action cannot be undone.-->
<!--                </p>-->

<!--                <button @click="">Deactivate</button>-->
<!--                <button @click="">Cancel</button>-->
<!--              </DialogPanel>-->
<!--            </TransitionChild>-->
<!--          </div>-->
<!--        </div>-->
<!--      </Dialog>-->
<!--    </TransitionRoot>-->
  </div>
</template>

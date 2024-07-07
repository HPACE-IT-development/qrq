<script setup lang="ts">
  import { Purchased } from '@/widgets/purchased';
  import { Button } from '@/shared/ui/button';
  import { X } from 'lucide-vue-next';
  import { Carousel, type CarouselApi, CarouselContent, CarouselItem } from '@/shared/ui/carousel';
  import { computed, onMounted, type Ref, ref, watch } from 'vue';
  import { watchOnce } from '@vueuse/core';
  import type { Item, Order } from '@/shared/api/generated/Api';
  import { useUnit } from 'effector-vue/composition';
  import { createOrderFx, offerAddButtonClicked } from '@/widgets/offers/model/offers-model';
  import {
    FormControl,
    FormField,
    FormItem, FormLabel,
    FormMessage,
    Input,
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
  } from '@/shared/ui';
  import { ScrollArea } from '@/shared/ui/scroll-area';
  import { companiesQuery } from '@/widgets/change-company/model/change-company-model';

  const api = ref<CarouselApi>();
  const totalCount = ref(0);
  const current = ref(0);
  const showDetails = ref(false);
  const step = ref(1);
  const purchasedItems = ref(new Map<string, boolean>());
  const props = defineProps<{
    productItem: Item;
    isProductCardOpen: boolean;
  }>();

  const emits = defineEmits(['close-product-card']);

  function closeProduct() {
    emits('close-product-card', false);
  }

  function setApi(val: CarouselApi) {
    api.value = val;
  }

  const handleAddOffer = useUnit(offerAddButtonClicked);

  watchOnce(api, (api) => {
    if (!api) return;

    totalCount.value = api.scrollSnapList().length;
    current.value = api.selectedScrollSnap() + 1;

    api.on('select', () => {
      current.value = api.selectedScrollSnap() + 1;
    });
  });
  watch(
    () => props.productItem,
    (newItem, oldItem) => {
      if (newItem !== oldItem) {
        step.value = 1;
        showDetails.value = false;
      }
    },
  );

  function handleBuyClick() {
    if (!props.productItem) return;

    if (step.value === 1) {
      step.value = 2;
    } else if (step.value === 2) {
      showDetails.value = true;
      step.value = 3;
    } else if (step.value === 3) {
      handleOrderCreation();
    }
  }

  const quantity = ref(1);
  const company: Ref<string> = ref("");
  const deliveryDate: Ref<string> = ref(new Date().toString());
  const city: Ref<string> = ref("");

  const { data: companies } = useUnit(companiesQuery);
  const { start: companiesMount } = useUnit(companiesQuery);

  function incrementQuantity() {
    quantity.value += 1;
  }

  function decrementQuantity() {
    if (quantity.value > 1) {
      quantity.value -= 1;
    }
  }

  const isPurchased = computed(() => {
    if (!props.productItem || !props.productItem.itemId) return false;
    return purchasedItems.value.get(props.productItem.itemId) || false;
  });
  const error = ref<string | null>(null);

  function handleOrderCreation() {
    if (!props.productItem) return;

    const order: Order = {
      name: props.productItem.title || '',
      amount: quantity.value,
      price: Number(props.productItem.price?.value),
      delivery_time: Number(props.productItem.parsedDelivery),
      company: Number(company.value),
      city: city.value,
      bid: 0,
      offer: Number(props.productItem.itemId),
      description: 'Order created from offer',
    };

    createOrderFx(order)
      .then((response) => {
        console.log('Order created successfully:', response);
        step.value = 4;
        error.value = null;
      })
      .catch((error) => {
        console.error('Error creating order:', error);
        error.value = 'Ошибка при создании заказа. Пожалуйста, попробуйте снова.';
      });
  }

  onMounted(() => {
    companiesMount();
  });
</script>

<template>
  <div
    v-if="isProductCardOpen"
    class="flex h-screen w-full min-w-[360px] flex-col justify-between border-l border-[#D0D4DB] bg-white lg:w-[360px]">
    <div class="flex flex-col overflow-hidden">
      <div>
        <div
          class="group flex cursor-pointer items-center gap-x-2 border-b border-[#D0D4DB] px-2 py-4"
          @click="closeProduct">
          <Button variant="ghost" size="icon">
            <X class="h-7 w-7 text-primary group-hover:text-primary/70" />
          </Button>
          <p
            class="text-center text-[17px] text-primary group-hover:text-primary/70">
            Закрыть
          </p>
        </div>
      </div>
      <ScrollArea v-if="step < 4 && !isPurchased" class="w-full">
        <div class='overflow-y-auto custom-scrollbar'>
          <Carousel
            @init-api="setApi"
            class="relative ml-[1px]"
            v-if="!!props.productItem.photo">
            <CarouselContent>
              <CarouselItem class="pl-2">
                <img :src="props.productItem.photo" alt="product_avatar" />
              </CarouselItem>
            </CarouselContent>
            <div
              class="absolute bottom-1 left-1/2 right-1/2 z-[5000] w-fit -translate-x-1/2 whitespace-nowrap rounded-lg bg-[#101828] px-2 py-0 text-center text-sm text-muted-foreground text-white opacity-80">
              {{ current }} / {{ totalCount }}
            </div>
          </Carousel>
          <div v-if="props.productItem" class="px-4 mb-9 mt-4 custom-scrollbar">
            <p class="text-[21px] font-semibold">
              {{
                props.productItem.price && props.productItem.price.formatted
                  ? props.productItem.price.formatted
                  : 'Не указано'
              }}
            </p>
            <p class="mb-4 text-[18px] font-normal">{{ props.productItem.title }}</p>

            <div class="flex w-full flex-col gap-y-2 font-normal text-[#858FA3]">
              <div v-if="props.productItem.brand" class="flex flex-row justify-between">
                <p>Бренд</p>
                <p class="font-normal text-[#101828] [&>p]:text-end">
                  {{ props.productItem.brand }}
                </p>
              </div>
              <div v-if="props.productItem.article" class="flex flex-row justify-between">
                <p>Артикул</p>
                <p class="font-normal text-[#101828] [&>p]:text-end">
                  {{ props.productItem.article }}
                </p>
              </div>
              <div
                v-if="props.productItem.quantity"
                class="flex flex-row justify-between">
                <p>Количество</p>
                <p class="font-normal text-[#101828] [&>p]:text-end">
                  {{ props.productItem.quantity.formatted }}
                </p>
              </div>
              <div
                v-if="props.productItem.vendorTitle"
                class="flex flex-row justify-between">
                <p>Поставщик</p>
                <p class="font-normal text-[#101828] [&>p]:text-end">
                  {{ props.productItem.vendorTitle }}
                </p>
              </div>
              <div
                v-if="props.productItem.warehouse"
                class="flex flex-row justify-between">
                <p>Местоположение</p>
                <p class="font-normal text-[#101828] [&>p]:text-end">
                  {{ props.productItem.warehouse }}
                </p>
              </div>
              <div
                v-if="props.productItem.parsedDelivery"
                class="flex flex-row justify-between">
                <p>Срок поставки</p>
                <p class="font-normal text-[#101828] [&>p]:text-end">
                  {{ props.productItem.parsedDelivery }} дн.
                </p>
              </div>
            </div>
            <div class="mt-7 flex flex-col gap-4">
              <h1 class="font-normal text-lg" v-if="step > 1">Уточните данные для покупки</h1>
              <div class='flex flex-col gap-2' v-if="step > 1">
                <p class="text-xs font-semibold">Количество</p>
                <div class='flex gap-3 items-center'>
                  <div
                    class='flex bg-[#5C5A57]/[0.1] rounded-lg w-[34px] h-[34px] items-center justify-center cursor-pointer'
                    @click="decrementQuantity">
                    <img src='./assets/minusIcon.svg' class='h-3.5 w-3.5' />
                  </div>
                  <p class='text-sm font-normal'>{{ quantity }}</p>
                  <div
                    class='flex bg-[#5C5A57]/[0.1] rounded-lg w-[34px] h-[34px] items-center justify-center cursor-pointer'
                    @click="incrementQuantity">
                    <img src='./assets/plusIcon.svg' class='h-3.5 w-3.5'>
                  </div>
                </div>
              </div>
              <div v-if="showDetails" class='flex flex-col gap-4'>
                <div class='flex flex-col gap-2'>
                  <p class="text-xs font-semibold">Выберите способ доставки</p>
                  <FormField v-slot="{ componentField }" name="deliveryMethod">
                    <FormItem>
                      <Select v-bind="componentField" v-model="city">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="one">Способ 1</SelectItem>
                          <SelectItem value="two">Способ 2</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormItem>
                  </FormField>
                </div>
                <div class='flex flex-col gap-2'>
                  <p class="text-xs font-semibold">Введите дату доставки</p>
                  <FormField v-slot="{ componentField }" name="deliveryDate">
                    <FormItem>
                      <FormControl>
                        <Input
                          class="h-fit rounded-[8px] border border-[#D0D4DB] px-4 py-2 text-[16px] w-1/2"
                          type="date" v-model="deliveryDate" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  </FormField>
                </div>
                <div class='flex flex-col gap-2'>
                  <p class="text-xs font-semibold">Выберите филиал</p>
                  <FormField v-slot="{ componentField }" name="branch">
                    <FormItem>
                      <Select v-bind="componentField" v-model="company">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem v-for="company in companies" :key="company.id" :value="company.id">
                            {{ company.name }}
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </FormItem>
                  </FormField>
                </div>
              </div>
            </div>
          </div>
        </div>
      </ScrollArea>
      <Purchased v-else-if='step === 4' class='pt-24' />
      <div v-if="error">
        <p class="text-red-500">{{ error }}</p>
      </div>
    </div>
    <div v-if='step < 4 && !isPurchased'
         class="flex flex-col gap-2.5 inset-x-0 bottom-0 border-t border-[#CCD0D9] bg-[#F9FAFB] p-4">
      <Button class="w-full text-[17px] font-semibold" @click="handleAddOffer()">Дать предложение</Button>
      <Button variant="tertiary" class="w-full text-[17px] font-semibold">Показать телефон</Button>
      <Button class="w-full text-[17px] font-semibold" @click="handleBuyClick">
        {{ step === 1 ? 'Купить' : step === 3 ? 'Подтвердить заказ' : 'Далее' }}
      </Button>
    </div>
  </div>
</template>
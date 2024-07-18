<script setup lang="ts">
  import { Purchased } from '@/widgets/purchased';
  import { Button } from '@/shared/ui/button';
  import { X } from 'lucide-vue-next';
  import { Carousel, type CarouselApi, CarouselContent, CarouselItem } from '@/shared/ui/carousel';
  import { computed, type Ref, ref, watch } from 'vue';
  import { watchOnce } from '@vueuse/core';
  import type { CartBody1 } from '@/shared/api/generated/Api';
  import { useUnit } from 'effector-vue/composition';
  import {
    createBidFx,
    createCartQWEP, createOfferFx, createOrderFx,
    createOrderQWEP,
    getCartQWEP,
    offerAddButtonClicked,
  } from '@/widgets/offers/model/offers-model';
  import {
    FormControl,
    FormField,
    FormItem,
    FormMessage,
    Input,
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
  } from '@/shared/ui';
  import { ScrollArea } from '@/shared/ui/scroll-area';

  const api = ref<CarouselApi>();
  const totalCount = ref(0);
  const current = ref(0);
  const showDetails = ref(false);
  const step = ref(1);
  const purchasedItems = ref(new Map<string, boolean>());
  const props = defineProps<{
    productItem: any;
    isProductCardOpen: boolean;
  }>();
  const quantity = ref(1);
  let cart: Ref<any> = ref(null);
  let fields: Ref<any> = ref([]);
  let fieldsObject: any = ref({});
  const isPurchased = computed(() => {
    if (!props.productItem || !props.productItem.itemId) return false;
    return purchasedItems.value.get(props.productItem.itemId) || false;
  });
  const error = ref<string | null>(null);

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

  function incrementQuantity() {
    quantity.value += 1;
  }

  function decrementQuantity() {
    if (quantity.value > 1) {
      quantity.value -= 1;
    }
  }

  async function handleBuyClick() {
    if (!props.productItem) return;

    if (step.value === 2) {
      await createQWEPOrder();
      step.value = 3;
    }

    if (step.value === 1) {
      const cartModel: CartBody1 = {
        search_id: props.productItem.search_id,
        item_id: props.productItem.itemId,
        quantity: quantity.value,
      };

      await createCartQWEP(cartModel);
      await getCart();
      step.value = 2;
    }

    if (step.value === 3) {
      await createOrderFromOffer(cartModel.item_id);
    }
    /*const orderModel = {
     price: cart.basketItems[0].price,
     amount: cart.basketItems[0].quantity,
   };

   await createOrderQWEP(orderModel);*/
    /*const order: Order = {
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
      });*/
  }

  async function getCart() {
    await getCartQWEP(props.productItem.accountId).then((data: any) => {
      cart.value = data.data.cart;
      if (data.data.cart.basketForm?.fields) {
        addFields(data.data.cart.basketForm?.fields);
      }
    });

    showDetails.value = true;
  }

  async function createQWEPOrder() {
    const orderModel = {
      account_id: cart.value.accountId,
      form_id: cart.value.basketForm?.formId,
      field_values: Object.entries(fieldsObject.value).map(([field_name, value]) => ([{ field_name, value }])),
    };

    await createOrderQWEP(orderModel).then((data: any) => {
      console.log(data);

      if (data.success) {
        createBidFromCart();
      }

      // TODO: если пришли дополнительные поля, то добавить с помощью метода addFields,
      // TODO: если полей нет то создаем заказ в системе (создаем bid, если нет => создаем offer, если нет => создаем order)
      // TODO: отображаем, сообщение о покупке
    });
  }

  async function createBidFromCart(orderId: number) {
    const bid = {
      order_id: orderId,
    };

    createBidFx(bid).then(async (bidResponse) => {
      if (bidResponse.success) {
        await createOfferFromBid();
      }
    })
  }

  async function createOfferFromBid(bidId: number) {
    const offer = {
      bid_id: bidId,
    };

    createOfferFx(offer).then(async (offerResponse) => {
      if (offerResponse.success) {
        await createOrderFromOffer();
      }
    })
  }

  async function createOrderFromOffer(offerId: number) {
    const order = {
      offer_id: offerId,
    };

    createOrderFx(order).then((orderResponse) => {
      if (orderResponse.success) {
        step.value = 4;
      }
    })
  }

  function addFields(data: any) {
    for (let obj of data) {
      fields.value.push(obj);
    }
  }
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
              <h1 class="font-normal text-lg">Уточните данные для покупки</h1>

              <div class='flex flex-col gap-2'>
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

              <template v-if="showDetails">
                <div v-for="field in fields" :key="field.fieldId" class='flex flex-col gap-4'>
                  <div class='flex flex-col gap-2'>
                    <p class="text-xs font-semibold">{{ field.title }}</p>
                    <FormField v-if="field.typeName === 'SelectField'"
                               v-slot="{ componentField }"
                               :name="field.fieldName"
                    >
                      <FormItem>
                        <Select v-bind="componentField" v-model="fieldsObject[field.fieldName]">
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem
                              v-for="(option, index) in field.options"
                              :key="index" :value="option.value"
                            >
                              {{ option.text }}
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </FormItem>
                    </FormField>
                    <FormField v-if="field.typeName === 'TextareaField'" v-slot="{ componentField }"
                               :name="field.fieldName">
                      <FormItem>
                        <FormControl>
                          <Input
                            class="h-fit rounded-[8px] border border-[#D0D4DB] px-4 py-2 text-[16px] placeholder:text-[#858FA3]"
                            type="text"
                            :placeholder="field.title"
                            v-bind="componentField"
                            v-model="fieldsObject[field.fieldName]" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    </FormField>
                  </div>
                </div>
              </template>
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
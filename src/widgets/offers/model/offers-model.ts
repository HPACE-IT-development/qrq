import { createEffect, createEvent, createStore, sample } from 'effector';
import { not } from 'patronum';
import { createMutation } from '@farfetched/core';
import type { basketItem, CartBody1, Confirmation } from '@/shared/api/generated/Api';
import { $api } from '@/shared/api';
import { offersQuery } from '@/widgets/my-suggestions';
import { $qwepApi } from '@/shared/api/api';

interface FormValues {
  name: string;
  amount: number;
  deliveryFrom?: number | undefined;
  deliveryTo?: number | undefined;
  article?: string | undefined;
  purpose?: string | undefined;
}

export const createOfferFx = createEffect(async (data: any) => {
  return $api.offers.createOffer(data);
});

export const createOrderFx = createEffect(async (order: any) => {
  return $api.order.createOrder(order);
});

export const createOfferMutation = createMutation({
  handler: (data: Confirmation) => $api.confirmations.createConfirmation(data),
});
export const createCartQWEP = createEffect(async (cart: CartBody1) => {
  return $qwepApi.cart.createCartItem(cart);
});
export const getCartQWEP: any = createEffect(async (accountId: number) => {
  return $qwepApi.cart.getCart({ query: { account_id: accountId } });
});
export const createOrderQWEP = createEffect(async (order: any) => {
  return $qwepApi.order.createOrder(order);
});

export const manuallyOfferAddButtonClicked = createEvent();
export const offerAddButtonClicked = createEvent();
export const formSubmitted = createEvent<FormValues>();

export const $showAddManuallyOffer = createStore(false);
export const $showAddOffer = createStore(false);

sample({
  clock: manuallyOfferAddButtonClicked,
  source: not($showAddManuallyOffer),
  target: $showAddManuallyOffer,
});
sample({
  clock: offerAddButtonClicked,
  source: not($showAddOffer),
  target: $showAddOffer,
});
sample({
  clock: formSubmitted,
  fn: (clk) => ({
    name: clk.name,
    article: clk.article,
    price: 0,
    amount: clk.amount,
    category: clk.purpose,
    delivery_time: clk.deliveryTo,
  }) as Confirmation,
  target: createOfferMutation.start,
});
sample({
  clock: createOfferMutation.finished.success,
  target: offersQuery.start,
});
sample({
  clock: createOfferMutation.finished.success,
  target: offersQuery.start,
});
// @ts-ignore
formSubmitted.watch(createOfferFx);
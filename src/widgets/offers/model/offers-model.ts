import { createEvent, createEffect, createStore, sample } from 'effector';
import { not } from 'patronum';
import { createMutation } from '@farfetched/core';
import type { Confirmation, Offer } from '@/shared/api/generated/Api';
import { $api } from '@/shared/api';

interface FormValues {
  supplier: string;
  name: string;
  amount: number;
  deliveryFrom?: number | undefined;
  deliveryTo?: number | undefined;
  article?: string | undefined;
  purpose?: string | undefined;
}

export const createOfferMutation = createMutation({
  handler: (data: Confirmation) => $api.confirmations.createConfirmation(data),
});
export const createOfferFx = createEffect(async (data: Offer) => {
  return $api.offers.createOffer(data);
});

export const offerAddButtonClicked = createEvent();
export const offerWidgetAddButtonClicked = createEvent();
export const formSubmitted = createEvent<FormValues>();

export const $showAddOfferModal = createStore(false);
export const $showAddOfferWidget = createStore(false);

sample({
  clock: offerAddButtonClicked,
  source: not($showAddOfferModal),
  target: $showAddOfferModal,
});
sample({
  clock: offerWidgetAddButtonClicked,
  source: not($showAddOfferWidget),
  target: $showAddOfferWidget,
});
sample({
  clock: formSubmitted,
  fn: (clk) =>
    ({
      name: clk.name,
      article: clk.article,
      price: 0,
      amount: clk.amount,
      category: clk.purpose,
      delivery_time: clk.deliveryTo,
    }) as Confirmation,
  target: createOfferMutation.start,
});
 // @ts-ignore
formSubmitted.watch(createOfferFx);
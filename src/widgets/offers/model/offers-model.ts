import { createEvent, createEffect, createStore, sample } from 'effector';
import { not } from 'patronum';
import { createMutation } from '@farfetched/core';
import type { Confirmation, Offer } from '@/shared/api/generated/Api';
import { $api } from '@/shared/api';
import { offersQuery } from '@/widgets/my-suggestions';
interface FormValues {
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
 // @ts-ignore
formSubmitted.watch(createOfferFx);
import { createEvent, createStore, sample } from 'effector';
import { not } from 'patronum';
import { createQuery } from '@farfetched/core';
import { $api } from '@/shared/api';

export const changeOffersVisibleChanged = createEvent<boolean | void>();

export const $isChangeOffersVisible = createStore(false);

export const offersQuery = createQuery({
  handler: async () => {
    const response = await $api.offers.getOffers();
    return response.data;
  },
});

sample({
  source: not($isChangeOffersVisible),
  clock: changeOffersVisibleChanged,
  fn: (src, clk) => clk ?? src,
  target: $isChangeOffersVisible,
});

sample({
  clock: changeOffersVisibleChanged,
  filter: (clk) => !!clk,
  target: offersQuery.start,
});
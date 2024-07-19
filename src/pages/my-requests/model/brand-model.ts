import { $api } from '@/shared/api';
import { createQuery, keepFresh } from '@farfetched/core';
import { createEvent, sample } from 'effector';
import type { RequestParams } from '@/shared/api/generated/Api';

export const listBrandsQuery = createQuery({
  handler: async () => {
    return (await $api.brands.getBrands());
  },
});

export const createBrandsQuery = createQuery({
  handler: async (data: RequestParams) => {
    return (await $api.brands.createBrand(data));
  },
});

export const getBrands = createQuery({
  handler: async () => $api.brands.getBrands(),
});


export const deleteBrandsQuery = createQuery({
  handler: async (data: RequestParams) => {
    return (await $api.brands.deleteBrand(data)).data;
  },
});

export const mounted = createEvent();
export const handleMount = createEvent();

sample({
  clock: handleMount,
  target: listBrandsQuery.start,
});

sample({
  clock: mounted,
  target: getBrands.start,
});

keepFresh(listBrandsQuery, {
  automatically: true,
  triggers: [
    createBrandsQuery.finished.success,
    deleteBrandsQuery.finished.success,
  ],
});
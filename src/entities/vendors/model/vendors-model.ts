import { createEvent, createStore, sample } from 'effector';
import type { Vendor } from '@/shared/api/generated/Api';
import { persist } from 'effector-storage/query';
import { createQuery } from "@farfetched/core";
import { $qwepApi } from "@/shared/api/api";
import { $searchTerm } from '@/widgets/header/model/header-modal';

export const handleMount = createEvent()
export const vendorClicked = createEvent<Vendor>();
export const $selectedVendor = createStore<Vendor | null>(null);
export const $selectedVendorId = createStore<string | null>(null).on(
  $selectedVendor,
  (_, src) => src?.id ?? null,
);

export const getVendors = createQuery({
  handler: async () => {
    const response = await $qwepApi.vendors.getVendors();
    return response.data;
  }
});

export const listVendorsQuery = createQuery({
  handler: async () => {
    return (await $qwepApi.vendors.getVendors()).data
  },
});


persist({
  store: $selectedVendorId,
  key: 'selected-vendor',
});

sample({
  clock: getVendors.finished.success,
  source: getVendors.$data,
  target: $selectedVendor,
  skipVoid: false,
});

sample({
  clock: vendorClicked,
  target: $selectedVendor,
  skipVoid: false,
});

export const $filteredVendors = createStore<Vendor[]>([])
  .on(getVendors.finished.success, (_, vendors) => vendors)
  .on($searchTerm, (state, searchTerm) => {
    if (!searchTerm) return state;
    return state.filter(vendor =>
      vendor.title?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

sample({
  clock: getVendors.finished.success,
  source: { vendors: getVendors.$data, searchTerm: $searchTerm },
  fn: ({ vendors, searchTerm }) => {
    if (!searchTerm) return vendors;
    // @ts-ignore
    return vendors.filter(vendor =>
      vendor.title?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  },
  target: $filteredVendors,
  // @ts-ignore
  skipVoid: false,
});

sample({
  clock: handleMount,
  target: listVendorsQuery.start
})
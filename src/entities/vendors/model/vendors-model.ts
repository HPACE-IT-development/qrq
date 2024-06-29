import { createEvent, createStore, sample } from 'effector';
import type {Vendor} from '@/shared/api/generated/Api';
import { persist } from 'effector-storage/query';
import {createQuery} from "@farfetched/core";
import {$qwepApi} from "@/shared/api/api";

export const vendorClicked = createEvent<Vendor>();
export const $selectedVendor = createStore<Vendor|null>(null);
export const $selectedVendorId = createStore<string | null>(null).on(
    $selectedVendor,
    (_, src) => src?.id,
);
export const getVendors = createQuery({
  handler: () => $qwepApi.vendors.getVendors()
});

persist({
    store: $selectedVendorId,
    key: 'selected-vendor',
})

sample({
    clock: vendorClicked,
    target: $selectedVendor
});
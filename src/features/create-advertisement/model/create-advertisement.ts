import { $api } from '@/shared/api';
import type { Bid, Offer } from '@/shared/api/generated/Api';
import { createMutation, createQuery, keepFresh } from '@farfetched/core';
import { createEvent, createStore, sample } from 'effector';
import { spread } from 'patronum';
import { myRequestsQuery } from '@/entities/requests';
import { ref } from 'vue';
import { createGate } from 'effector-vue/composition';

type TFormMode = 'selectType' | 'form';
type TNomenclatureType = 'update' | 'create' | 'default';
type TAdvertisementType = 'buy' | 'sell';

export interface FormValues {
  id?: number;
  name: string;
  article: string;
  count: string;
  category?: number;
  brand?: number;
  price?: number;
  delivery_time?: number;
  destinations?: Array<number>;
}

const createAd = createMutation({
  handler: (data: Offer) => $api.ads.createAd(data),
});

const createBidMutation = createMutation({
  handler: (data: Bid) =>
    $api.bids.createBid({
      name: data.name,
      article: data.article || 'Не указано',
      amount: data.amount,
      destinations: data.destinations,
      status: 0
    }),
});

export const getNomenclatures = createQuery({
  handler: async (search) => await $api.nomenclatures.getNomenclatures({ query: search }).then((response) => {
      nomenclatures.value = response.data;

    names.value = response.data.map((nomenclature) => {
      return {
        id: nomenclature.id,
        name: nomenclature.name
      }
    })

    articles.value = response.data.map((nomenclature) => {
      return {
        id: nomenclature.id,
        name: nomenclature.article
      }
    })
  })
})

export const getDestinations = createQuery({
    handler: () => $api.destinations.getDestinations()
})
export const getCategories = createQuery({
  handler: () => $api.categories.getCategories(),
});
export const getBrands = createQuery({
  handler: () => $api.brands.getBrands(),
});

export const createNomenclature =  createMutation({
  handler: async (data: FormValues) =>
    $api.nomenclatures.createNomenclature(
      Object.assign(
        {
          name: data.name,
          article: data.article,
          destinations: data.destinations
        },
      ),
    ),
})

export const updateNomenclature =  createMutation({
  handler: async (data: FormValues) =>
    $api.nomenclatures.updateNomenclature(
      data.id ?? 1,
      Object.assign(
        {
          name: data.name,
          article: data.article,
          destinations: data.destinations
        },
      ),
    ),
})


export const advertisementTypeSelected = createEvent<TAdvertisementType>();
export const formClosed = createEvent();
export const formSubmitted = createEvent<FormValues>();
export const createAdvertisementMounted = createEvent();
export const nomenclatureTypeSelected = createEvent<TNomenclatureType>();
export const findNomenclatures = createEvent<string>()
export const nomenclaturesGate = createGate()

export const names = ref()
export const articles = ref()
export const nomenclatures = ref()

export const $nomenclatureType = createStore<TNomenclatureType>('default')
  .reset([formClosed]);

export const $advertisementType = createStore<TAdvertisementType | null>(
  null,
).reset([formClosed]);

export const $formMode = createStore<TFormMode>('selectType').reset([
  formClosed,
]);

sample({
  clock: findNomenclatures,
  fn: (search) => ({
    search
  }),
  target: [getNomenclatures.start]
})

sample({
  clock: nomenclaturesGate.open,
  to: getNomenclatures.start
})

sample({
  clock: nomenclatureTypeSelected,
  fn: (type) => ({
    $nomenclatureType: type,
  }),
  target: spread({ $nomenclatureType })
})

sample({
  clock: formSubmitted,
  source: $nomenclatureType,
  filter: (src) => src === 'create',
  fn: (_, clk) => ({
    name: clk.name,
    article: clk.article,
    destinations: clk.destinations,
    count: clk.count,
  }),
  target: [createNomenclature.start],
});

sample({
  clock: formSubmitted,
  source: $nomenclatureType,
  filter: (src) => src === 'update',
  fn: (_, clk) => (
  {
    id: clk.id,
    name: clk.name,
    article: clk.article,
    destinations: clk.destinations,
    count: clk.count,
  }),
  target: [updateNomenclature.start],
});

sample({
  clock: createAdvertisementMounted,
  target: [getDestinations.start, getCategories.start, getBrands.start],
});

sample({
  clock: advertisementTypeSelected,
  fn: (clk) => ({
    $advertisementType: clk,
    $formMode: 'form' as const,
  }),
  target: spread({
    $advertisementType,
    $formMode,
  }),
});

sample({
  clock: formSubmitted,
  source: $advertisementType,
  filter: (src) => src === 'buy',
  fn: (_, clk) => ({
    name: clk.name,
    article: clk.article,
    amount: parseInt(clk?.count ?? '1'),
    destinations: clk.destinations
  }),
  target: [createBidMutation.start, formClosed],
});

sample({
  clock: formSubmitted,
  source: $advertisementType,
  filter: (src) => src === 'sell',
  fn: (_, clk) => ({
    name: clk.name,
    article: clk.article,
    amount: parseInt(clk?.count ?? '1'),
    price: clk.price,
    delivery_time: clk.delivery_time,
    category: clk.category ?? '',
    brand: clk.brand ?? ''
  }),
  target: [createAd.start, formClosed],
});

keepFresh(myRequestsQuery, {
  triggers: [
    createAd.finished.success,
    createBidMutation.finished.success,
  ],
  automatically: true,
});

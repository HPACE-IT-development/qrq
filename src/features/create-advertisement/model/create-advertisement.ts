import { $api } from '@/shared/api';
import type { Bid, Offer } from '@/shared/api/generated/Api';
import { createMutation, createQuery, keepFresh } from '@farfetched/core';
import { createEvent, createStore, sample } from 'effector';
import { spread } from 'patronum';
import { myRequestsQuery } from '@/entities/requests';

type TFormMode = 'selectType' | 'form';
type TNomenclatureType = 'update' | 'create';
type TAdvertisementType = 'buy' | 'sell';

export interface FormValues {
  id?: number;
  name: string;
  article: string;
  count: string;
  category?: number;
  brand?: number;
  price?: number;
  available?: number;
  destination?: number;
}

const createOfferMutation = createMutation({
  handler: (data: Offer) => $api.offers.createOffer(data),
});

const createBidMutation = createMutation({
  handler: (data: Bid) =>
    $api.bids.createBid({
      name: data.name,
      article: data.article || 'Не указано',
      amount: data.amount,
      category: data.category,
      brand: data.brand,
      status: 0,
    }),
});

export const getCategories = createQuery({
  handler: () => $api.categories.getCategories(),
});

export const getBrands = createQuery({
  handler: () => $api.brands.getBrands(),
});

export const getNomenclatures = createQuery({
  handler: () => $api.nomenclatures.getNomenclatures()
})

export const getDestinations = createQuery({
    handler: () => $api.destinations.getDestinations()
})

export const getArticles = createQuery({
  handler: () => $api.nomenclatures.getNomenclatures()
    .then((response) => response.data.map((nomenclature) => {
      return {
        id: nomenclature.id,
        name: nomenclature.article
      }
    }))
})

export const getNames = createQuery({
  handler: () => $api.nomenclatures.getNomenclatures()
    .then((response) => response.data.map((nomenclature) => {
      return {
        id: nomenclature.id,
        name: nomenclature.name
      }
    }))
})

export const createNomenclature =  createMutation({
  handler: async (data: FormValues) =>
    $api.nomenclatures.createNomenclature(
      Object.assign(
        {
          name: data.name,
          article: data.article,
          destination: data.destination
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
          destination: data.destination
        },
      ),
    ),
})


export const advertisementTypeSelected = createEvent<TAdvertisementType>();
export const formClosed = createEvent();
export const formSubmitted = createEvent<FormValues>();
export const createAdvertisementMounted = createEvent();
export const nomenclatureTypeSelected = createEvent<TNomenclatureType>();

export const $nomenclatureType = createStore<TNomenclatureType>('create')
  .reset([formClosed])

export const $advertisementType = createStore<TAdvertisementType | null>(
  null,
).reset([formClosed]);
export const $formMode = createStore<TFormMode>('selectType').reset([
  formClosed,
]);

sample({
  clock: nomenclatureTypeSelected,
  source: $nomenclatureType,
  fn: (type) => ({
    $nomenclatureType: type
  })
})

sample({
  clock: formSubmitted,
  source: $nomenclatureType,
  filter: (src) => src === 'create',
  fn: (_, clk) => ({
    name: clk.name,
    article: clk.article,
    destination: clk.destination,
    count: clk.count,
  }),
  target: createNomenclature.start,
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
    destination: clk.destination,
    count: clk.count,
  }),
  target: updateNomenclature.start,
});

sample({
  clock: createAdvertisementMounted,
  target: [getArticles.start, getNames.start, getNomenclatures.start, getDestinations.start],
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
    category: clk.category,
    brand: clk.brand,
  }),
  target: [createBidMutation.start, formClosed],
});

sample({
  clock: formSubmitted,
  source: $advertisementType,
  filter: (src) => src === 'sell',
  fn: (_, clk) => ({
    name: clk.name,
    amount: parseInt(clk?.count ?? '1'),
    category: clk.category,
    brand: clk.brand,
    price: clk.price!,
    delivery_time: clk.available,
  }),
  target: [createOfferMutation.start, formClosed],
});

keepFresh(myRequestsQuery, {
  triggers: [
    createOfferMutation.finished.success,
    createBidMutation.finished.success,
  ],
  automatically: true,
});

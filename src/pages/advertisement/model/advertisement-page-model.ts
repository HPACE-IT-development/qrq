import { advertisementClicked } from '@/entities/advertisement';
import { searchQuery } from '@/entities/offer';
import { $requestViewMode } from '@/pages/my-requests/model/my-requests-model';
import { sample } from 'effector';
import { spread } from 'patronum';
import { createQuery } from '@farfetched/core';
import { $qwepApi } from '@/shared/api/api';

const getVendors = createQuery({
  handler: async (search) => $qwepApi.vendors.getVendors({ query: { search: search.id } })
})

sample({
  clock: advertisementClicked,
  fn: (clk) =>
    ({
      mutation: {
        search: clk.article ?? '',
        brand: clk.brand ?? '',
      },
      $requestViewMode: 'offers',
    }) as const,
  target: spread({
    mutation: searchQuery.start,
    $requestViewMode,
  }),
});

sample({
  clock: advertisementClicked,
  target: getVendors.start
})
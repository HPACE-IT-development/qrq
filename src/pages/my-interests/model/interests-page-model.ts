import { createQuery, keepFresh } from '@farfetched/core';
import type {RequestParams} from '@/shared/api/generated/Api';
import { $api, $qwepApi } from '@/shared/api/api';
import { createEvent, createStore, sample } from 'effector';
import { spread } from 'patronum';

type TButtonMode = 'show-all' | 'show-interests';

export const listInterestsQuery = createQuery({
    handler: async () => {
        return (await $qwepApi.interests.getInterests()).data
    },
});

export const createInterestQuery = createQuery({
    handler: async (data: RequestParams) => {
        return (await $qwepApi.interests.createInterest(data));
    }
});

export const getInterestQuery = createQuery({
    handler: async (data: RequestParams) => {
        return (await $qwepApi.interests.getInterest(data));
    }
});

export const deleteInterestQuery = createQuery({
    handler: async (data: RequestParams) => {
        return (await $qwepApi.interests.deleteInterest(data)).data;
    }
});

export const handleMount = createEvent()
export const formClosed = createEvent()
export const changeButtonMode = createEvent<TButtonMode>()
export const $buttonMode = createStore<TButtonMode>('show-all').reset([
    formClosed,
]);

sample({
    clock: handleMount,
    target: listInterestsQuery.start
})

sample({
    clock: changeButtonMode,
    fn: (mode ) => ({
       $buttonMode: mode
    }),
    target: spread({ $buttonMode })
})


keepFresh(listInterestsQuery, {
    automatically: true,
    triggers: [
        createInterestQuery.finished.success,
        deleteInterestQuery.finished.success,
    ]
})
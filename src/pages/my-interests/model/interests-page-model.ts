import {createQuery} from '@farfetched/core';
import type {RequestParams} from '@/shared/api/generated/Api';
import {$qwepApi} from "@/shared/api/api";

export const listInterestsQuery = createQuery({
    handler: async () => {
        return (await $qwepApi.interests.getInterests()).data;
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
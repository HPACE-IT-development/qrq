<script setup lang="ts">
  import { SearchHistory } from '@/widgets/search-history';
  import { useRoute, useRouter } from 'vue-router';
  import { AdvertisementList } from '@/entities/advertisement';
  import type { PreSearchResponse } from '@/shared/api/generated/Api';
  import { useUnit } from 'effector-vue/composition';
  import { preSearchQuery, searchQuery } from '@/entities/offer';
  import { $searchTerm } from '@/widgets/header/model/header-modal';
  import { ScrollArea } from '@/shared/ui/scroll-area';
  import '../model/advertisement-page-model';
  import { $selectedAdvertisementId } from '@/entities/advertisement/model/advertisement-model';
  import {onMounted, ref, watch} from 'vue';
  import VendorsList from "@/entities/vendors/ui/vendors-list.vue";
  import {getVendors} from "@/entities/vendors/model/vendors-model";

  const route = useRoute();
  const router = useRouter();

  const searchValue = useUnit($searchTerm);

  const { start: search, data: searchData } = useUnit(searchQuery);
  const { data: preSearchData } = useUnit(preSearchQuery);
  const { start: handleVendors, data: vendors } = useUnit(getVendors);
  const selectedAdvertisement = useUnit($selectedAdvertisementId);

  const isVendorList = ref(false);

  onMounted(() => {
    if (selectedAdvertisement.value && !preSearchData.value?.data) {
      router.push('/');
    } else {
      handleVendors();
    }
  }); // watch(route, fetchSearchResult);
  watch(preSearchData, () => {
    if (preSearchData.value?.data.length > 0) {
      isVendorList.value = true;
    }
  });

  function getAnnouncementText(count: number) {
    if (count === 0 || !count) {
      return 'Нет объявлений';
    } else if (count === 1) {
      return 'Найдено 1 объявление';
    } else if (count % 10 === 1 && count !== 11) {
      return `Найдено ${count} объявление`;
    } else if (
      count % 10 >= 2 &&
      count % 10 <= 4 &&
      (count < 10 || count >= 20)
    ) {
      return `Найдено ${count} объявления`;
    } else {
      return `Найдено ${count} объявлений`;
    }
  }
  function getAnnouncementVendorText(count: number) {
    let arr = [2,3,4];
    if (count === 0 || !count) {
      return false;
    } else if (count === 1) {
      return 'Найден 1 пользователь';
    } else if (arr.includes(count)) {
      return `Найдено ${count} пользователя`;
    } else {
      return `Найдено ${count} пользователей`;
    }
  }

  const emit = defineEmits([
    'advertisementClicked',
    'advertisementItems',
    'advertisementFilters',
  ]);

  const handleCardClicked = async (data: PreSearchResponse) => {
    try {
      const { article, brand } = data;
      await router.push({
        path: '/advertisements',
        query: {
          search: route.query.search,
          'active-pre-search': brand,
          'active-card': route.query['active-card'],
        },
      });
      if (data) {
        search({
          search: article?.toString() ?? '',
          page: searchData.value?.data.page,
          page_size: 10,
          brand: brand?.toString() ?? '',
        });
      }
    } catch (err) {
      console.error(err);
    }
  };
</script>

<template>
  <div class="w-full">
    <div
      class="flex items-center justify-between border-b border-r border-[#D0D4DB] p-4 pr-5">
      <h3
        v-if="route.path === '/advertisements'"
        class="text-[18px] font-semibold">
        {{ getAnnouncementText(preSearchData?.data.length ?? 0) }}
      </h3>
      <h3 v-else class="text-[18px] font-semibold">История поиска</h3>
    </div>
  </div>
  <ScrollArea class="max-h-[calc(100vh-177px)] w-full">
    <template
      v-if="
        (route.path === '/advertisements' &&
          route.query.article &&
          route.query.brand) ||
        searchValue
      ">
      <AdvertisementList
        v-if="preSearchData"
        :search-result="preSearchData?.data"
        class="custom-scrollbar h-full w-full overflow-auto bg-[#F9FAFB]" />
    </template>

    <SearchHistory
      class="custom-scrollbar h-full overflow-auto"
      v-if="route.path === '/search-history'" />
  </ScrollArea>
  <div class="w-full" v-if="isVendorList">
    <div
        class="flex items-center justify-between border-b border-r border-[#D0D4DB] p-4 pr-5">
      <h3
          v-if="route.path === '/advertisements'"
          class="text-[18px] font-semibold">
        {{ getAnnouncementVendorText(vendors?.data.length ?? 0) }}
      </h3>
    </div>
  </div>
  <ScrollArea class="max-h-[calc(100vh-177px)] w-full">
    <template
        v-if="
        (route.path === '/advertisements' &&
          route.query.article &&
          route.query.brand) ||
        searchValue
      ">
        <VendorsList
          v-if="vendors"
          :vendors-list="vendors?.data"
          class="custom-scrollbar h-full w-full overflow-auto bg-[#F9FAFB]" />
    </template>

    <SearchHistory
      class="custom-scrollbar h-full overflow-auto"
      v-if="route.path === '/search-history'" />
  </ScrollArea>
  <div
    v-if="!preSearchData"
    class="h-[100vh] w-full border-r bg-[#F9FAFB]"></div>
</template>

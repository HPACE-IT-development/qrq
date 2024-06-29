<script setup lang="ts">
  import {MoveLeft} from 'lucide-vue-next';
  import {Button} from "@/shared/ui";
  import {getButtonList} from "../lib/button-list";
  import {Trash2 } from "lucide-vue-next";
  import {onMounted, defineProps} from "vue";
  import {
    deleteInterestQuery,
    listInterestsQuery,
    handleMount
  } from "@/pages/my-interests/model/interests-page-model";

  import {useUnit} from "effector-vue/composition";
  import {filterSubmitted} from "@/features/filter/model/filter-model";
  import {requestViewModeChanged} from "@/pages/my-requests/model/my-requests-model";
  import {cn} from "@/shared/lib";

  defineProps<{
    isInterestsCardOpen: boolean;
  }>();

  const emits = defineEmits(['close-interests-card', 'change-view', 'open-interests-card', 'close-filter-by-interests']);
  const buttonList = getButtonList();
  const { data: interestsList } = useUnit(listInterestsQuery);
  const changeRequestViewMode = useUnit(requestViewModeChanged);
  const { start: handleRemove } = useUnit(deleteInterestQuery);
  const handleFilterSubmit = useUnit(filterSubmitted);


  function closeInterests() {
    handleMount();
    emits('close-interests-card', false);
  }
  const remove = async (id) => {
    await handleRemove(id);
    handleMount();
  };

  const openFilter = () => {
    emits('change-view', false);
  };
  const submit = async (id: any) => {
    if (interestsList.value === null) return;
    let filterBy = interestsList.value.find((interest) => interest.id === id);

    if (!filterBy) return;

    let vendors = filterBy.vendor;
    let brands = filterBy.brand;
    let cities = filterBy.city;
    let search = filterBy.description?.split(',').pop();
    let values = {
      article: filterBy.article,
      countFrom: JSON.parse(filterBy.delivery_time).lower,
      countTo: JSON.parse(filterBy.delivery_time).upper,
      priceFrom: JSON.parse(filterBy.amount).lower,
      priceTo: JSON.parse(filterBy.amount).upper
    };

    if (!vendors || !brands || !cities) return;

    handleFilterSubmit({ ...values, search, vendors, brands, cities });
    changeRequestViewMode('offers');
    emits('close-filter-by-interests');
  };

  onMounted(() => {
    handleMount()
  });

</script>

<template>
  <div
      v-if="isInterestsCardOpen"
      class="flex w-full flex-col border-l bg-white lg:max-w-[355px]">
    <div
        class="w-full flex items-center justify-left md:max-w-[356px] pt-4 px-4 cursor-pointer">
      <MoveLeft class="inline-flex h-7 w-7 text-primary group-hover:text-primary/70 mx-2" @click="closeInterests"/>
      <p class="text-center text-[17px] group-hover:text-primary/70">
        Мои интересы
      </p>
    </div>
    <div class="flex w-full items-center justify-between gap-6 py-4 pl-4">
      <div
          ref="scrollableContainer"
          class="no-scrollbar overflow-x-auto whitespace-nowrap"
          style="scrollbar-width:none">
        <Button
            v-for="(button) in buttonList"
            variant="outline"
            :class="cn('max-h-[28px] rounded-lg mx-2', button.class)"
            @click="() => {
              if (button.status === 1 ) {
                openFilter();
              }
            }"
            size="sm">
          {{ button.label }}
        </Button>
      </div>
    </div>
    <div
        v-if="!Array.isArray(interestsList) || interestsList.length == 0"
        class="h-[calc(100vh-177px)] w-full border-t border-[#D0D4DB] bg-[#F9FAFB]">
      <div class="mx-auto flex flex-col items-center justify-center gap-y-6 p-4">
        <img src="./assetes/star.png" class="mt-4">
        <div class="flex flex-col items-center gap-y-2">
          <p class="text-[16px]">Ваш список интересов пуст</p>
          <p class="text-center text-[12px] text-[#858FA3]">
            Чтобы добавить интересы воспользуйтесь фильтром <br/>
            или добавьте интересы конкретного пользователя
          </p>
        </div>
      </div>
    </div>
    <div class="justify-normal">
    <div
        v-if="interestsList"
        v-for="(interest) in interestsList"
        class="w-full border-t custom-scrollbar overflow-auto bg-[#F9FAFB]">
      <div class="mx-auto flex w-full flex-col items-center justify-center gap-y-6 p-4">
        <div
            class="vue-recycle-scroller ready direction-vertical flex w-full max-w-[324px] flex-col gap-y-4 max-sm:w-[100vw]">
          <div
              class="flex w-full items-start justify-between rounded-lg border-2 bg-white p-4 pr-5 duration-200 hover:border-[#0017FC] hover:bg-[#1778EA] hover:bg-opacity-10">
            <p class="text-[14px] cursor-pointer" @click="submit(interest.id)">{{ interest.description }}</p>
            <div class="cursor-pointer" @click="remove(interest.id)">
              <Trash2/>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  </div>
</template>
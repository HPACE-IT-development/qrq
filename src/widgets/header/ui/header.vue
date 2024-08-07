<script setup lang="ts">
import { nextTick, onMounted, ref, watch } from 'vue';
import { getButtonList } from '../lib/button-list';
import { Button } from '@/shared/ui/button';
import BurgerMenu from './burger-menu.vue';
import Search from './assets/search.vue';
import { Input } from '@/shared/ui/input';
import { useRouter } from 'vue-router';
import { useUnit } from 'effector-vue/composition';
import {
  $selectedSortType,
  searchTermInputed,
  sortTypeSelected,
} from '@/widgets/header/model/header-modal';
import { myRequestsQuery } from '@/entities/requests';

const router = useRouter();

const searchTerm = ref('');

const handleSubmit = useUnit(searchTermInputed);

const isBurgerMenuOpen = ref(false);

const visibleSearch = ref(false);
const buttonList = getButtonList(visibleSearch);
const formFocused = ref(false);
const scrollableContainer = ref();

const { start: handleMount, data: requests } = useUnit(myRequestsQuery);
const handleSortTypeSelected = useUnit(sortTypeSelected);
const selectedSortType = useUnit($selectedSortType);

onMounted(handleMount);

function handleSubmitSearch(event: Event) {
  event.preventDefault();
  if (searchTerm.value !== '') {
    handleSubmit(searchTerm.value);
  }
}

const emit = defineEmits([
  'submitSearch',
  'submitLogin',
  'createClicked',
  'openSidebar',
  'buttonClicked',
]);

watch(visibleSearch, (newValue) => {
  if (newValue) {
    nextTick(() => {
      formFocused.value = true;
    });
    nextTick(() => {
      document.getElementById('search')?.focus();
      router.push('/advertisements');
    });
  }
});

const scrollToButton = (index: number) => {
  if (!scrollableContainer.value) {
    console.error('scrollableContainer is null!');
    return;
  }

  const buttonElement = scrollableContainer.value.children[index];
  const buttonWidth = buttonElement.offsetWidth;
  const containerWidth = scrollableContainer.value.offsetWidth;
  const scrollPosition = scrollableContainer.value.scrollLeft;

  const targetPosition = buttonElement.offsetLeft;

  const offset = 170;

  if (targetPosition < scrollPosition) {
    scrollableContainer.value.scrollTo({
      left: targetPosition - offset,
      behavior: 'smooth',
    });
  } else if (targetPosition > scrollPosition + containerWidth - buttonWidth) {
    scrollableContainer.value.scrollTo({
      left: targetPosition - containerWidth + buttonWidth + offset,
      behavior: 'smooth',
    });
  }
};
</script>

<template>
  <div class="w-full flex-col items-center justify-between border-b border-r border-[#D0D4DB] md:max-w-[356px]">
    <div class="flex w-full items-center justify-between px-4 pt-4">
      <div v-if="!visibleSearch" class="flex flex-row items-center">
        <BurgerMenu @click="emit('openSidebar')" v-model="isBurgerMenuOpen" />
        <div class="ml-4 flex w-[5.75rem] items-center">
          <RouterLink to="/" class="flex w-full items-center">
            <img src="./assets/logo.svg" alt="logo" class="logo w-full" />
          </RouterLink>
        </div>
      </div>
      <RouterLink to="/">
        <Button class="-ml-2" v-if="visibleSearch" @click="visibleSearch = false" size="icon" variant="ghost">
          <img src="./assets/backIcon.svg" class="h-6 w-6 select-none" alt="arrow" />
        </Button>
      </RouterLink>
      <div v-if="!visibleSearch" class="flex items-center gap-0">
        <Button @click="visibleSearch = true" size="icon" variant="ghost">
          <Search />
        </Button>
        <Button @click="emit('submitLogin', true)" size="icon" variant="ghost">
          <img src="./assets/login.svg" alt="login" />
        </Button>
        <Button size="icon" variant="ghost" @click="$emit('createClicked')">
          <img src="./assets/create.svg" alt="create" />
        </Button>
      </div>
      <form @submit="handleSubmitSearch" v-if="visibleSearch" :style="{
        border: formFocused ? '2px solid #0017FC' : '2px solid #D0D4DB',
      }"
        class="relative ml-2 flex w-full max-w-sm items-center gap-x-2 rounded-xl border-2 px-2 transition-all duration-100">
        <Search :color="formFocused ? '#0015FA' : '#858FA3'" @click="handleSubmitSearch" />
        <Input :key="visibleSearch ? 'true' : 'false'" v-model="searchTerm" @keydown.enter="handleSubmitSearch"
          @input="handleSubmitSearch" id="search" type="text" @focus="formFocused = true" @blur="formFocused = false"
          class="border-0 py-0 focus:outline-none" />
      </form>
    </div>
    <div class="flex w-full items-center py-4 pl-4">
      <div ref="scrollableContainer" class="overflow-x-scroll whitespace-nowrap pb-1">
        <RouterLink v-for="(button, index) in buttonList" :key="button.label" :to="button?.link"
          @click="scrollToButton(index)" class="mr-4 focus:outline-none">
          <Button variant="outline" @click="() => {
            handleSortTypeSelected(button.status);
            emit('buttonClicked', index);
          }
            " :class="{
              'border-[#0017FC] bg-[#1778EA] bg-opacity-10 text-[#0017FC] hover:border-[#0017FC] hover:bg-[#1778EA] hover:bg-opacity-10 hover:text-[#0017FC]':
                selectedSortType === button.status,
            }" class="max-h-[28px] rounded-lg" size="sm">
            {{ button.label }}
            <template v-if="button.link === '/' && requests?.length">
              ({{
                button.status >= 0
                  ? requests?.filter(
                    (request) => request.status === button.status,
                  ).length
                  : requests?.length
              }})
            </template>
          </Button>
        </RouterLink>
      </div>
    </div>
  </div>
</template>

<style scoped lang="postcss">
.no-scrollbar {
  scrollbar-width: none;
  -ms-overflow-style: none;
  -webkit-overflow-scrolling: touch;
}

.no-scrollbar::-webkit-scrollbar {
  @apply hidden w-0;
}
</style>

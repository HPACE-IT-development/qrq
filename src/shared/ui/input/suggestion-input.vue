<script setup lang='ts'>
import {
  Combobox,
  ComboboxInput,
  ComboboxOptions,
  ComboboxOption,
  ComboboxLabel,
} from '@headlessui/vue'
import { cn } from '@/shared/lib';
import { computed, ref, watch } from 'vue';
import Loader from '@/shared/ui/loader/Loader.vue';

interface IOption {
  readonly id: string
  readonly name: string
}

interface Props {
  defaultValue?: string;
  options: IOption[] | null
  label?: string
  name?: string
  disabled?: boolean
  placeholder?: string
  loading: Boolean
}

const props = defineProps<Props>()
const emit = defineEmits<{
  select: [value: IOption | string],
  find: [value: string]
}>()
const selected = defineModel<string>({ default: '' })
const query = ref<string>('')

const queryEmpty = computed(() => {
  return query.value === ''
})

const queryValue = computed(() => {
  return query.value === '' ? null : query.value
})

watch([
  () => selected.value,
  () => query.value,
], ([
  newSelectedValue,
  newQueryValue
  ]) => {
  if (newSelectedValue) {
    selected.value = newSelectedValue;
    emit('select', newSelectedValue);
  }
  if (newQueryValue.length >= 3) emit('find', newQueryValue);
  if (selected.value !== '' && newSelectedValue !== newQueryValue) selected.value = newQueryValue;
})

</script>

<template>
  <div class="relative inline-block text-left w-full">
    <Combobox
      v-model='selected'
      nullable
      :name='name'
      v-slot='{ value }'
    >
      <ComboboxLabel class='pb-2 text-[14px] font-semibold text-[#101828]'>{{ label }}</ComboboxLabel>
      <ComboboxInput
        :model-value='value'
        @change="query = $event.target.value"
        class='h-fit rounded-[8px] max-h-60 border border-[#D0D4DB] px-4 py-2 text-[16px] placeholder:text-[#858FA3] w-full outline-0'
        :placeholder='placeholder'
      />
      <transition
        leave-active-class="transition ease-in duration-100"
        leave-from-class="opacity-100"
        leave-to-class="opacity-0"
      >
        <section
          v-if='!selected && !queryEmpty'
          class='absolute z-10 w-full overflow-y-auto max-h-60 rounded-md bg-white py-1 text-base shadow-lg ring-black ring-opacity-5 focus:outline-none sm:text-sm'
        >
          <Loader v-if='loading'/>
          <ComboboxOptions v-if='!loading'>
            <ComboboxOption
              v-if="queryValue"
              :value="queryValue"
            >
              <li
                :class="
                cn(
                  'mx-1 my-1 cursor-pointer select-none rounded py-2 pl-3 pr-9 text-gray-900 hover:bg-opacity-90',
                )
              ">
              <span class="block truncate font-normal">
                {{ query }}
              </span>
              </li>
            </ComboboxOption>
            <ComboboxOption
              v-for="item in options"
              :key="item.id"
              :value="item.name"
            >
              <li
                :class="
                cn(
                  'mx-1 my-1 cursor-pointer select-none rounded py-2 pl-3 pr-9 text-gray-900 hover:bg-opacity-90',
                  query === item.name &&
                    'bg-gray-200 text-black',
                )
              ">
              <span class="block truncate font-normal">
                {{ item.name }}
              </span>
              </li>
            </ComboboxOption>
          </ComboboxOptions>
        </section>
      </transition>
    </Combobox>
  </div>
</template>

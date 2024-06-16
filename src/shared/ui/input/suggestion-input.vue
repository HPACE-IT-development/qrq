<script setup lang='ts'>
import {
  Combobox,
  ComboboxInput,
  ComboboxOptions,
  ComboboxOption,
  ComboboxLabel,
} from '@headlessui/vue'
import { cn } from '@/shared/lib';
import { computed, ref, toRaw, watch } from 'vue';

interface IOption {
  readonly id: string
  readonly name: string
}

interface Props {
  options: IOption[] | null
  label?: string
  name?: string
  disabled?: boolean
  defaultValue?: string
  placeholder?: string
}

const props = defineProps<Props>()
const emit = defineEmits<{
  select: [value: IOption | string]
}>()
const selected = ref<string>('')
const query = ref<string>('')
const loadingFlag = ref<boolean>(true)

const queryEmpty = computed(() => {
  return query.value === ''
})

const loading = computed({
  get: () => {
    return loadingFlag.value;
  },
  set: (newValue) => {
    loadingFlag.value = newValue;
  }
})

const queryPerson = computed(() => {
  return query.value === '' ? null : query.value
})

const filteredOptions = ref<IOption[]>([])
const selectedOption = computed(() => {
  if (selected.value) {
    const findedValue = filteredOptions.value?.find((option) => option.name === selected.value)
    if (!findedValue) {
      return query.value
    } else {
      return findedValue;
    }
  }
})

watch([
  () => selectedOption.value,
  () => props.defaultValue,
  () => query.value,
  () => props.options
], (array) => {
  if (array[0] && selectedOption.value) {
    loadingFlag.value = false
    emit('select', selectedOption.value)
  }
  if (array[1]) selected.value = array[1] ?? ''
  if (array[2]) {
    loadingFlag.value = true
    let timer: any;
    if (!timer) {
      timer = setTimeout(() => {
        if (query.value === '' || props.options?.length === 0) {
          filteredOptions.value = []
          clearTimeout(timer)
        } else {
          filteredOptions.value = []
          props.options?.map((option, index) => {
            if (index % 50 === 0) {
              if (option.name?.toLowerCase().includes(query.value.toLowerCase())) {
                filteredOptions.value = [option, ...filteredOptions.value]
                loadingFlag.value = false;
              }
            }
          })
          clearTimeout(timer)
        }
      }, 1000)
    }
  }
  if (array[3]?.length !== 0) {
    loadingFlag.value = false
  }
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
        :model-value="value"
        @change="query = $event.target.value"
        class='h-fit rounded-[8px] max-h-60 border border-[#D0D4DB] px-4 py-2 text-[16px] placeholder:text-[#858FA3] w-full outline-0'
        :placeholder='placeholder'
        aria-autocomplete='none'
        autcocomplete='off'
      />
      <transition
        leave-active-class="transition ease-in duration-100"
        leave-from-class="opacity-100"
        leave-to-class="opacity-0">
        <section
          v-if='!selectedOption && !queryEmpty'
          class='absolute z-10 w-full overflow-y-auto max-h-60 rounded-md bg-white py-1 text-base shadow-lg ring-black ring-opacity-5 focus:outline-none sm:text-sm'
        >
          <article class='flex justify-center items-center h-10' v-if='loading'>
            <div
              class="inline-block h-4 w-4 animate-spin rounded-full border-2 border-solid border-current text-blue-700 border-e-transparent align-[-0.125em] text-surface motion-reduce:animate-[spin_1.5s_linear_infinite] dark:text-white"
              role="status">
              <span
                class="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]"
              >
                Loading...
              </span>
            </div>
          </article>
          <ComboboxOptions v-if='!loading'>
            <ComboboxOption v-if="queryPerson" :value="queryPerson">
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
              v-for="item in filteredOptions"
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
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
  select: [value: IOption]
}>()
const selected = ref<string>('')
const query = ref<string>('')
const filteredOptions = computed(() => query.value === '' ? props.options : props.options?.filter((option) => option.name?.toLowerCase().includes(query.value.toLowerCase())))
const selectedOption = computed(() => selected.value && filteredOptions.value?.find((option) => option.name === selected.value))

watch([() => selectedOption.value, () => props.defaultValue], (array) => {
  if (array[0] && selectedOption.value) emit('select', selectedOption.value)
  if (array[1]) selected.value = array[1] ?? ''
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
        class='h-fit rounded-[8px] border border-[#D0D4DB] px-4 py-2 text-[16px] placeholder:text-[#858FA3] w-full outline-0'
        :placeholder='placeholder'
      />
      <transition
        leave-active-class="transition ease-in duration-100"
        leave-from-class="opacity-100"
        leave-to-class="opacity-0">
        <ComboboxOptions
          v-if='filteredOptions'
          class='absolute z-10 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-black ring-opacity-5 focus:outline-none sm:text-sm'
        >
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
      </transition>
    </Combobox>
  </div>
</template>
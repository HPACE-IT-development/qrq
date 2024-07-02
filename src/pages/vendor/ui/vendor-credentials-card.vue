<script setup lang="ts">
import {
  Button,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
  Select, SelectContent,
  SelectGroup, SelectItem, SelectTrigger, SelectValue
} from "@/shared/ui";
import {MoveLeft} from "lucide-vue-next";
import {useUnit} from "effector-vue/composition";
import {$selectedVendor} from "@/entities/vendors/model/vendors-model";
import {ref} from "vue";
import {createAccountQuery, useVendorCredentialsForm} from "@/pages/vendor/model/vendor-credentials-model";
import { createInterestQuery } from '@/pages/my-interests/model/interests-page-model';

const emit = defineEmits(['close-card', 'open-filter-by-vendor']);
const {form} = useVendorCredentialsForm();
const selectedVendor = useUnit($selectedVendor);
const loginError = ref(false);
const { start: handleVendorCredentials } = useUnit(createAccountQuery);

const onSubmit = async () => {
  await form.validate();
  if (Object.keys(form.errors.value).length <= 0) {
    const login = form.values.login;
    const pass = form.values.password;
    const type = form.values.type;
    const vendor = selectedVendor.value.qwep_vendors.find((value)=>value.title === type);
    handleVendorCredentials({
      vendor_id: vendor.id,
      branch_id: vendor.branches?.id ?? '',
      title: vendor.title,
      login: login,
      password: pass,
      is_active: vendor.is_active
    });
    createInterestQuery.start({
      vendor: vendor.title,
      description: vendor.title,
    });
    // emit('open-filter-by-vendor')
  }
}

function closeCard() {
  emit('close-card');
}

</script>

<template>
  <div
      class="flex w-full flex-col border-l bg-white lg:max-w-[355px]">
    <div
        class="w-full items-center border-b border-[#D0D4DB] px-0 py-3">
      <Button
          class="flex gap-x-2"
          variant="ghost"
          @click="closeCard()"
      >
        <MoveLeft class="inline-flex h-7 w-7 text-primary group-hover:text-primary/70 mx-2"/>
        <p class="text-[16px] font-semibold">
          Назад
        </p>
      </Button>
    </div>
    <div
        class="h-[calc(100vh-177px)] w-full bg-[#F9FAFB]">
      <form
          class="mt-4 flex w-full flex-col gap-y-4 px-5"
          @submit.prevent="onSubmit">
        <p class="text-[18px] font-semibold">{{ selectedVendor?.title }}</p>
        <p v-if="loginError" class="text-[14px] font-semibold text-[#858FA3]">
          Неверные данные, попробуйте еще раз или продолжите регистрацию.
        </p>
        <FormField v-slot="{componentField}" name="type">
          <FormItem>
            <FormLabel>Вариант подключения</FormLabel>
            <FormControl>
                <Select v-bind="componentField">
                <FormControl>
                  <SelectTrigger>
                    <SelectValue :placeholder="'Вариант подключения'" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem
                        v-for="item of selectedVendor.qwep_vendors"
                        :value="item.title"
                    >
                      {{ item.title}}
                    </SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </FormControl>
          </FormItem>
        </FormField>
        <FormField v-slot="{ componentField }" name="login">
          <FormItem>
            <FormLabel>Логин</FormLabel>
            <FormControl>
              <Input
                  class="h-fit rounded-[8px] border border-[#D0D4DB] px-4 py-2 text-[16px] placeholder:text-[#858FA3]"
                  type="text"
                  placeholder="Логин"
                  v-bind="componentField" />
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>

        <FormField v-slot="{ componentField }" name="password">
          <FormItem>
            <FormLabel>Пароль</FormLabel>
            <FormControl>
              <Input
                  type="password"
                  placeholder="Пароль"
                  v-bind="componentField" />
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>
      </form>
    </div>
    <div
        class="inset-x-0 bottom-0 flex w-full flex-col gap-y-3 border-t border-[#CCD0D9] bg-white p-4">
      <Button @click.prevent="onSubmit"
              variant='tertiary'
              class="w-full text-base font-semibold mt-4"
              type="button"
      >Добавить в Интересы</Button
      >
    </div>
  </div>
</template>
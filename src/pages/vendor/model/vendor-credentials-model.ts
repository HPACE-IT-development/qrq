import type { FormContext } from 'vee-validate';
import { toTypedSchema } from '@vee-validate/zod';
import * as z from 'zod';
import { useForm } from 'vee-validate';
import { createQuery } from '@farfetched/core';
import type { RequestParams } from '@/shared/api/generated/Api';
import { $qwepApi } from '@/shared/api/api';
import { createEffect, createEvent, createStore, sample } from 'effector';

export const createAccountQuery = createEffect(async (data: any) => {
  return $qwepApi.accounts.createAccount(data);
});

export const getAccountsQuery = createEffect(async () => {
  return (await $qwepApi.accounts.getAccounts()).data;
});

export const deleteAccountsQuery = createEffect(async (id: number) => {
  $qwepApi.accounts.deleteAccount(id);
  await getAccountsQuery();
});

export const $accountStore = createStore<any[]>([]).on(
  getAccountsQuery,
  (_, repos) => repos,
);

sample({
  clock: getAccountsQuery.doneData,
  target: $accountStore,
});

export function useVendorCredentialsForm(): {
  form: FormContext<any, {}>;
} {
  const schema = toTypedSchema(
    z.object({
      type: z.string({ required_error: 'Выберите вариант' }),
      login: z.string({ required_error: 'Введите логин' }),
      password: z.string({ required_error: 'Введите пароль' }),
    }),
  );
  const form = useForm({
    validationSchema: schema,
  });
  return {
    form,
  };
}

import type {FormContext} from "vee-validate";
import {toTypedSchema} from "@vee-validate/zod";
import * as z from "zod";
import {useForm} from "vee-validate";
import {createQuery} from "@farfetched/core";
import type {RequestParams} from "@/shared/api/generated/Api";
import {$qwepApi} from "@/shared/api/api";
import { createEffect } from 'effector';

export const createAccountQuery = createEffect(async (data: any) => {
    return $qwepApi.accounts.createAccount(data);
});
export function useVendorCredentialsForm(): {
    form: FormContext<any, {}>;
} {
    const schema = toTypedSchema(
        z.object({
            type: z.string({required_error: 'Выберите вариант'}),
            login: z.string({required_error: 'Введите логин'}),
            password: z.string({required_error: 'Введите пароль'}),
        }),
    );
    const form = useForm({
        validationSchema: schema,
    });
    return {
        form,
    };
}
import { toTypedSchema } from '@vee-validate/zod';
import { type FormContext, useForm } from 'vee-validate';
import { type Ref } from 'vue';
import * as z from 'zod';

export function useCreateAdvertisementForm(mode: 'sell' | 'buy' | null): {
  form: FormContext<any, {}>;
  // category: Ref<number | undefined>;
  // brand: Ref<number | undefined>;
  article: Ref<string | undefined>;
  name: Ref<string | undefined>;
  destination: Ref<number | undefined>;
} {
  const buySchema = toTypedSchema(
    z.object({
      name: z
        .string({ required_error: 'Введите наименование' })
        .min(1, 'Введите наименование'),
      article: z.string().optional(),
      count: z
        .number({
          required_error: 'Введите количество',
          invalid_type_error: 'Введите количество',
        })
        .min(1, 'Введите количество'),
      // category: z.number({ required_error: 'Выберите категорию' }),
      destination: z.number().optional(),
    }),
  );

  const sellSchema = toTypedSchema(
    z.object({
      name: z
        .string({ required_error: 'Введите наименование' })
        .min(1, 'Введите наименование'),
      article: z.string().optional(),
      count: z
        .number({
            required_error: 'Введите количество',
            invalid_type_error: 'Введите количество',
        })
        .min(1, 'Введите количество'),
      // category: z.number({ required_error: 'Выберите категорию' }),
      destination: z.number().optional(),
      // price: z.number({ required_error: 'Введите цену' }),
      // available: z.number({ required_error: 'Введите наличие' }),
    }),
  );

  const form = useForm({
    validationSchema: mode === 'sell' ? sellSchema : buySchema,
  });

  const [article] = form.defineField('article');
  const [name] = form.defineField('name');
  const [destination] = form.defineField('destination');

  return {
    form,
    article,
    name,
    destination,
  };
}

import { toTypedSchema } from '@vee-validate/zod';
import { type FormContext, useForm } from 'vee-validate';
import { type Ref } from 'vue';
import * as z from 'zod';

export function useCreateAdvertisementForm(mode: 'sell' | 'buy' | null): {
  form: FormContext<any, {}>,
  article: Ref<string | undefined>,
  name: Ref<string | undefined>,
  category: Ref<string | number | number[] | undefined>,
  brand: Ref<string | number | number[] | undefined>,
  destinations: Ref<number[] | undefined>,
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
        .min(1, 'Введите количество')
        .optional(),
      destinations: z.array(z.number()).optional(),
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
        .min(1, 'Введите количество')
        .optional(),
      destinations: z.array(z.number()).optional(),
      price: z.number({ required_error: 'Введите цену' }),
      delivery_time: z.number({ required_error: 'Введите срок до клиента'}),
      category: z.number({ required_error: 'Выберите категорию' }),
      brand: z.number().optional(),
    }),
  );

  const form = useForm({
    validationSchema: mode === 'sell' ? sellSchema : buySchema,
  });

  const [article] = form.defineField('article');
  const [name] = form.defineField('name');
  const [destinations] = form.defineField('destinations');
  const [category] = form.defineField('category');
  const [brand] = form.defineField('brand');

  return {
    form,
    article,
    name,
    destinations,
    category,
    brand
  };
}

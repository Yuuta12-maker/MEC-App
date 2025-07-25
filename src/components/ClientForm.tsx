'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Client } from '@/types/client';

const formSchema = z.object({
  name: z.string().min(1, { message: '名前は必須です。' }),
  kana: z.string().min(1, { message: 'カナは必須です。' }),
  email: z.string().email({ message: '有効なメールアドレスを入力してください。' }),
  status: z.enum(['アクティブ', 'トライアル', '非アクティブ']),
});

interface ClientFormProps {
  onSubmit: (values: z.infer<typeof formSchema>) => void;
  initialData?: Partial<Client>;
  isSubmitting: boolean;
}

export function ClientForm({ onSubmit, initialData, isSubmitting }: ClientFormProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData || {
      name: '',
      kana: '',
      email: '',
      status: 'トライアル',
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>名前</FormLabel>
              <FormControl>
                <Input placeholder="田中 太郎" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="kana"
          render={({ field }) => (
            <FormItem>
              <FormLabel>カナ</FormLabel>
              <FormControl>
                <Input placeholder="タナカ タロウ" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>メールアドレス</FormLabel>
              <FormControl>
                <Input placeholder="taro.tanaka@example.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>ステータス</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="ステータスを選択" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="アクティブ">アクティブ</SelectItem>
                  <SelectItem value="トライアル">トライアル</SelectItem>
                  <SelectItem value="非アクティブ">非アクティブ</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? '保存中...' : '保存'}
        </Button>
      </form>
    </Form>
  );
}

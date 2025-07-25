'use client';

import { useState } from 'react';
import { ApplicationForm } from '@/components/ApplicationForm';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import * as z from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';

function ApplyPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (values: z.infer<typeof ApplicationForm>) => {
    setIsSubmitting(true);
    try {
      // Firestoreにクライアントデータを追加
      await addDoc(collection(db, "clients"), {
        name: values.name,
        kana: values.kana,
        email: values.email,
        status: 'トライアル', // 申込フォームからの登録は常にトライアル
        joinDate: serverTimestamp(),
        gender: values.gender || null,
        birthday: values.birthday || null,
        phone: values.phone || null,
        address: values.address || null,
        preferredSessionType: values.preferredSessionType || null,
        notes: values.notes || null,
      });

      // 管理者と申込者本人への通知メール送信ロジック（Resendを使用）
      // ここではダミーのログ出力とします。実際にはResend APIを呼び出します。
      console.log("管理者への通知メールを送信:", values);
      console.log("申込者本人への確認メールを送信:", values);

      toast({
        title: "お申し込みありがとうございます！",
        description: "内容を確認後、改めてご連絡いたします。",
      });

    } catch (error) {
      console.error("Error submitting application: ", error);
      toast({
        title: "エラーが発生しました",
        description: "お申し込みの送信中に問題が発生しました。",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900 p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="text-2xl">新規クライアントお申し込み</CardTitle>
          <CardDescription>以下のフォームにご記入の上、送信してください。</CardDescription>
        </CardHeader>
        <CardContent>
          <ApplicationForm onSubmit={handleSubmit} isSubmitting={isSubmitting} />
        </CardContent>
      </Card>
    </div>
  );
}

export default ApplyPage;

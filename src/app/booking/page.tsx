'use client';

import { useState, useEffect } from 'react';
import { BookingForm } from '@/components/BookingForm';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp, onSnapshot, query, where } from 'firebase/firestore';
import * as z from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { Session } from '@/types/session';
import { Client } from '@/types/client';

function BookingPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [availableSessions, setAvailableSessions] = useState<Session[]>([]);

  useEffect(() => {
    // 予約可能なセッション枠（ステータスが「予定」のセッション）を取得
    const q = query(collection(db, "sessions"), where("status", "==", "予定"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const sessionsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        date: doc.data().date?.toDate().toISOString().split('T')[0] || '',
      } as Session));
      setAvailableSessions(sessionsData);
    });

    return () => unsubscribe();
  }, []);

  const handleSubmit = async (values: z.infer<typeof BookingForm>) => {
    setIsSubmitting(true);
    try {
      // 新しいクライアントとして登録（または既存クライアントを検索して利用）
      // ここではシンプルに新規クライアントとして登録します。
      const newClientRef = await addDoc(collection(db, "clients"), {
        name: values.clientName,
        email: values.email,
        status: 'トライアル', // 予約からの登録もトライアル
        joinDate: serverTimestamp(),
      });

      // セッションを登録
      await addDoc(collection(db, "sessions"), {
        clientId: newClientRef.id,
        clientName: values.clientName,
        date: values.date, // DateオブジェクトのままFirestoreに保存
        time: values.time,
        type: 'トライアル', // 予約からのセッションはトライアル
        status: '予定',
        coachName: '森山雄太', // デフォルトで森山雄太
        notes: values.notes || null,
        createdAt: serverTimestamp(),
      });

      // 管理者と申込者本人への通知メール送信ロジック（Resendを使用）
      console.log("管理者への通知メールを送信 (予約):");
      console.log("申込者本人への確認メールを送信 (予約):");

      toast({
        title: "セッション予約が完了しました！",
        description: "内容を確認後、改めてご連絡いたします。",
      });

    } catch (error) {
      console.error("Error submitting booking: ", error);
      toast({
        title: "エラーが発生しました",
        description: "セッション予約の送信中に問題が発生しました。",
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
          <CardTitle className="text-2xl">セッション予約</CardTitle>
          <CardDescription>ご希望の日時を選択してセッションを予約してください。</CardDescription>
        </CardHeader>
        <CardContent>
          <BookingForm onSubmit={handleSubmit} isSubmitting={isSubmitting} availableSessions={availableSessions} />
        </CardContent>
      </Card>
    </div>
  );
}

export default BookingPage;

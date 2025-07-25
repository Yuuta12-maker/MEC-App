'use client';

import { useState, useEffect } from 'react';
import withAuth from '@/components/withAuth';
import Layout from '@/components/Layout';
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Calendar } from "@/components/ui/calendar"
import { PlusCircle, ArrowUpRight } from 'lucide-react';
import Link from 'next/link';
import { db } from '@/lib/firebase';
import { collection, query, where, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { Client } from '@/types/client';
import { Session } from '@/types/session';
import { addDays, format } from 'date-fns';

function DashboardPage() {
  const [upcomingSessions, setUpcomingSessions] = useState<Session[]>([]);
  const [clientStats, setClientStats] = useState({
    total: 0,
    active: 0,
    trial: 0,
    inactive: 0,
  });
  const [sessionDates, setSessionDates] = useState<Date[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // クライアント統計の取得
    const unsubscribeClients = onSnapshot(collection(db, "clients"), (snapshot) => {
      const clientsData = snapshot.docs.map(doc => doc.data() as Client);
      const total = clientsData.length;
      const active = clientsData.filter(c => c.status === 'アクティブ').length;
      const trial = clientsData.filter(c => c.status === 'トライアル').length;
      const inactive = clientsData.filter(c => c.status === '非アクティブ').length;
      setClientStats({ total, active, trial, inactive });
    });

    // 今週のセッションとカレンダーデータの取得
    const today = new Date();
    const nextSevenDays = addDays(today, 7);

    const q = query(
      collection(db, "sessions"),
      where("date", ">=", today),
      where("date", "<=", nextSevenDays),
      orderBy("date"),
      limit(5)
    );

    const unsubscribeSessions = onSnapshot(q, (snapshot) => {
      const sessionsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        date: doc.data().date?.toDate().toISOString().split('T')[0] || '',
      } as Session));
      setUpcomingSessions(sessionsData);

      // カレンダー用の日付を抽出
      const allSessionDates = sessionsData.map(s => new Date(s.date));
      setSessionDates(allSessionDates);
      setLoading(false);
    });

    return () => {
      unsubscribeClients();
      unsubscribeSessions();
    };
  }, []);

  const getMarkedDates = (date: Date) => {
    return sessionDates.some(sessionDate => 
      sessionDate.getFullYear() === date.getFullYear() &&
      sessionDate.getMonth() === date.getMonth() &&
      sessionDate.getDate() === date.getDate()
    ) ? "bg-primary text-primary-foreground rounded-full" : "";
  };

  return (
    <Layout>
      <div className="flex items-center justify-between space-y-2">
        <h1 className="text-3xl font-bold">ダッシュボード</h1>
        <div className="flex items-center space-x-2">
          <Link href="/clients/new"><Button><PlusCircle className="mr-2 h-4 w-4" /> 新規クライアント登録</Button></Link>
          <Link href="/sessions/new"><Button><PlusCircle className="mr-2 h-4 w-4" /> 新規セッション登録</Button></Link>
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">総クライアント数</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{clientStats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">アクティブ</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{clientStats.active}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">トライアル</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{clientStats.trial}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">非アクティブ</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{clientStats.inactive}</div>
          </CardContent>
        </Card>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>今週のセッション</CardTitle>
            <CardDescription>7日以内に予定されているセッションです。</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p>読み込み中...</p>
            ) : upcomingSessions.length > 0 ? (
              <div className="space-y-4">
                {upcomingSessions.map(session => (
                  <div key={session.id} className="flex items-center">
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium leading-none">{session.clientName}</p>
                      <p className="text-sm text-muted-foreground">{session.type}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">{new Date(session.date).toLocaleDateString()}</p>
                      <p className="text-sm text-muted-foreground">{session.time}</p>
                    </div>
                    <Button variant="ghost" size="sm" className="ml-4">
                      <ArrowUpRight className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <p>今週のセッションはありません。</p>
            )}
          </CardContent>
        </Card>
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>セッションカレンダー</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
             <Calendar
                mode="single"
                className="rounded-md border"
                modifiers={{ sessionDates: sessionDates }}
                modifiersStyles={{
                  sessionDates: { backgroundColor: '#007bff', color: 'white' },
                }}
                dayContentRenderer={(day) => (
                  <div className={getMarkedDates(day)}>
                    {day.getDate()}
                  </div>
                )}
              />
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}

export default withAuth(DashboardPage);

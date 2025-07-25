'use client';

import { useState, useEffect } from 'react';
import withAuth from '@/components/withAuth';
import Layout from '@/components/Layout';
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuCheckboxItem, DropdownMenuItem } from "@/components/ui/dropdown-menu"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { MoreHorizontal, PlusCircle, ListFilter } from "lucide-react"
import { Session } from '@/types/session';
import { Client } from '@/types/client';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, addDoc, doc, updateDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar as CalendarIcon } from "lucide-react"
import { Calendar } from "@/components/ui/calendar"
import { SessionForm } from '@/components/SessionForm';
import * as z from 'zod';

function SessionsPage() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [clients, setClients] = useState<Client[]>([]); // クライアントリスト
  const [loading, setLoading] = useState(true);
  const [currentTab, setCurrentTab] = useState('list');
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [isNewSessionDialogOpen, setIsNewSessionDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const unsubscribeSessions = onSnapshot(collection(db, "sessions"), (snapshot) => {
      const sessionsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        date: doc.data().date?.toDate().toISOString().split('T')[0] || '',
      } as Session));
      setSessions(sessionsData);
      setLoading(false);
    });

    const unsubscribeClients = onSnapshot(collection(db, "clients"), (snapshot) => {
      const clientsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      } as Client));
      setClients(clientsData);
    });

    return () => {
      unsubscribeSessions();
      unsubscribeClients();
    };
  }, []);

  const handleCreateSession = async (values: z.infer<typeof SessionForm>) => {
    setIsSubmitting(true);
    try {
      await addDoc(collection(db, "sessions"), {
        ...values,
        date: values.date, // DateオブジェクトのままFirestoreに保存
        createdAt: serverTimestamp(),
      });
      setIsNewSessionDialogOpen(false);
    } catch (error) {
      console.error("Error adding document: ", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Layout>
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">セッション管理</h1>
        <Dialog open={isNewSessionDialogOpen} onOpenChange={setIsNewSessionDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" /> 新規セッション登録
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>新規セッション登録</DialogTitle>
            </DialogHeader>
            <SessionForm onSubmit={handleCreateSession} isSubmitting={isSubmitting} clients={clients} />
          </DialogContent>
        </Dialog>
      </div>
      <Tabs value={currentTab} onValueChange={setCurrentTab} className="mt-4">
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="list">リストビュー</TabsTrigger>
            <TabsTrigger value="calendar">カレンダービュー</TabsTrigger>
          </TabsList>
          {currentTab === 'list' && (
            <div className="flex items-center">
              <Input placeholder="クライアント名で検索..." className="max-w-sm mr-2" />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline">
                    <ListFilter className="mr-2 h-4 w-4" />
                    ステータス
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>ステータsで絞り込み</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuCheckboxItem checked>予定</DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem>実施済み</DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem>キャンセル</DropdownMenuCheckboxItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
        </div>
        <TabsContent value="list" className="mt-4">
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>クライアント名</TableHead>
                  <TableHead>日時</TableHead>
                  <TableHead>タイプ</TableHead>
                  <TableHead>ステータス</TableHead>
                  <TableHead><span className="sr-only">Actions</span></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">
                      読み込み中...
                    </TableCell>
                  </TableRow>
                ) : sessions.map((session) => (
                  <TableRow key={session.id}>
                    <TableCell className="font-medium">{session.clientName}</TableCell>
                    <TableCell>{session.date} {session.time}</TableCell>
                    <TableCell>{session.type}</TableCell>
                    <TableCell>{session.status}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button aria-haspopup="true" size="icon" variant="ghost">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Toggle menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>操作</DropdownMenuLabel>
                          <DropdownMenuItem>詳細</DropdownMenuItem>
                          <DropdownMenuItem>編集</DropdownMenuItem>
                          <DropdownMenuItem>ステータス更新</DropdownMenuItem>
                          <DropdownMenuItem>フォローアップメール作成</DropdownMenuItem>
                          <DropdownMenuItem>削除</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
        <TabsContent value="calendar" className="mt-4">
          <div className="flex justify-center">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              className="rounded-md border"
            />
          </div>
          {selectedDate && (
            <div className="mt-4">
              <h3 className="text-lg font-semibold mb-2">{selectedDate.toLocaleDateString()} のセッション</h3>
              {sessions.filter(s => s.date === selectedDate.toISOString().split('T')[0]).length > 0 ? (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>クライアント名</TableHead>
                        <TableHead>時間</TableHead>
                        <TableHead>タイプ</TableHead>
                        <TableHead>ステータス</TableHead>
                        <TableHead><span className="sr-only">Actions</span></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {sessions.filter(s => s.date === selectedDate.toISOString().split('T')[0]).map((session) => (
                        <TableRow key={session.id}>
                          <TableCell className="font-medium">{session.clientName}</TableCell>
                          <TableCell>{session.time}</TableCell>
                          <TableCell>{session.type}</TableCell>
                          <TableCell>{session.status}</TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button aria-haspopup="true" size="icon" variant="ghost">
                                  <MoreHorizontal className="h-4 w-4" />
                                  <span className="sr-only">Toggle menu</span>
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuLabel>操作</DropdownMenuLabel>
                                <DropdownMenuItem>詳細</DropdownMenuItem>
                                <DropdownMenuItem>編集</DropdownMenuItem>
                                <DropdownMenuItem>ステータス更新</DropdownMenuItem>
                                <DropdownMenuItem>フォローアップメール作成</DropdownMenuItem>
                                <DropdownMenuItem>削除</DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <p>この日のセッションはありません。</p>
              )}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </Layout>
  );
}

export default withAuth(SessionsPage);


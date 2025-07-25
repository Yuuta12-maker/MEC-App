'use client';

import { useState, useEffect } from 'react';
import withAuth from '@/components/withAuth';
import Layout from '@/components/Layout';
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuCheckboxItem, DropdownMenuItem } from "@/components/ui/dropdown-menu"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { MoreHorizontal, PlusCircle, ListFilter } from "lucide-react"
import { Payment } from '@/types/payment';
import { Client } from '@/types/client';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, addDoc, doc, updateDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { PaymentForm } from '@/components/PaymentForm';
import * as z from 'zod';

function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [clients, setClients] = useState<Client[]>([]); // クライアントリスト
  const [loading, setLoading] = useState(true);
  const [isNewPaymentDialogOpen, setIsNewPaymentDialogOpen] = useState(false);
  const [isEditPaymentDialogOpen, setIsEditPaymentDialogOpen] = useState(false);
  const [editingPayment, setEditingPayment] = useState<Payment | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const unsubscribePayments = onSnapshot(collection(db, "payments"), (snapshot) => {
      const paymentsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        dueDate: doc.data().dueDate?.toDate().toISOString().split('T')[0] || '',
        paymentDate: doc.data().paymentDate?.toDate().toISOString().split('T')[0] || undefined,
      } as Payment));
      setPayments(paymentsData);
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
      unsubscribePayments();
      unsubscribeClients();
    };
  }, []);

  const handleCreatePayment = async (values: z.infer<typeof PaymentForm>) => {
    setIsSubmitting(true);
    try {
      await addDoc(collection(db, "payments"), {
        ...values,
        dueDate: values.dueDate, // DateオブジェクトのままFirestoreに保存
        paymentDate: values.paymentDate || null, // DateオブジェクトのままFirestoreに保存
        createdAt: serverTimestamp(),
      });
      setIsNewPaymentDialogOpen(false);
    } catch (error) {
      console.error("Error adding document: ", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditPayment = (payment: Payment) => {
    setEditingPayment(payment);
    setIsEditPaymentDialogOpen(true);
  };

  const handleUpdatePayment = async (values: z.infer<typeof PaymentForm>) => {
    if (!editingPayment) return;
    setIsSubmitting(true);
    try {
      const paymentRef = doc(db, "payments", editingPayment.id);
      await updateDoc(paymentRef, {
        ...values,
        dueDate: values.dueDate, // DateオブジェクトのままFirestoreに保存
        paymentDate: values.paymentDate || null, // DateオブジェクトのままFirestoreに保存
      });
      setIsEditPaymentDialogOpen(false);
      setEditingPayment(null);
    } catch (error) {
      console.error("Error updating document: ", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeletePayment = async (paymentId: string) => {
    try {
      await deleteDoc(doc(db, "payments", paymentId));
    } catch (error) {
      console.error("Error deleting document: ", error);
    }
  };

  return (
    <Layout>
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">支払い管理</h1>
        <Dialog open={isNewPaymentDialogOpen} onOpenChange={setIsNewPaymentDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" /> 新規支払い登録
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>新規支払い登録</DialogTitle>
            </DialogHeader>
            <PaymentForm onSubmit={handleCreatePayment} isSubmitting={isSubmitting} clients={clients} />
          </DialogContent>
        </Dialog>
      </div>
      <div className="flex items-center justify-between mt-4">
        <div className="flex-1">
          <Input placeholder="クライアント名で検索..." className="max-w-sm" />
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="ml-auto">
              <ListFilter className="mr-2 h-4 w-4" />
              ステータス
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>ステータスで絞り込み</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuCheckboxItem checked>未払い</DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem>支払い済み</DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem>延滞</DropdownMenuCheckboxItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="rounded-md border mt-4">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>クライアント名</TableHead>
              <TableHead>支払い種別</TableHead>
              <TableHead>支払期日</TableHead>
              <TableHead>ステータス</TableHead>
              <TableHead>支払日</TableHead>
              <TableHead>金額</TableHead>
              <TableHead><span className="sr-only">Actions</span></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  読み込み中...
                </TableCell>
              </TableRow>
            ) : payments.map((payment) => (
              <TableRow key={payment.id}>
                <TableCell className="font-medium">{payment.clientName}</TableCell>
                <TableCell>{payment.paymentType}</TableCell>
                <TableCell>{payment.dueDate}</TableCell>
                <TableCell>{payment.status}</TableCell>
                <TableCell>{payment.paymentDate || '-'}</TableCell>
                <TableCell>{payment.amount.toLocaleString()}円</TableCell>
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
                      <DropdownMenuItem onClick={() => handleEditPayment(payment)}>編集</DropdownMenuItem>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <DropdownMenuItem onSelect={(e) => e.preventDefault()}>削除</DropdownMenuItem>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>本当に削除しますか？</AlertDialogTitle>
                            <AlertDialogDescription>
                              この操作は元に戻せません。支払い「{payment.clientName} - {payment.paymentType}」のデータが完全に削除されます。
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>キャンセル</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDeletePayment(payment.id)}>削除</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Edit Payment Dialog */}
      <Dialog open={isEditPaymentDialogOpen} onOpenChange={setIsEditPaymentDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>支払い編集</DialogTitle>
          </DialogHeader>
          {editingPayment && (
            <PaymentForm
              onSubmit={handleUpdatePayment}
              initialData={editingPayment}
              isSubmitting={isSubmitting}
              clients={clients}
            />
          )}
        </DialogContent>
      </Dialog>
    </Layout>
  );
}

export default withAuth(PaymentsPage);

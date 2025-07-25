export interface Payment {
  id: string;
  clientId: string;
  clientName: string;
  paymentType: string; // 例: '月額', '単発', '追加セッション'
  dueDate: string; // ISO string or Date
  status: '未払い' | '支払い済み' | '延滞';
  paymentDate?: string; // ISO string or Date
  amount: number;
  notes?: string;
}

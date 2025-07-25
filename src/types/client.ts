export interface Client {
  id: string;
  name: string;
  kana: string;
  email: string;
  status: 'アクティブ' | 'トライアル' | '非アクティブ';
  joinDate: string; // or Date
  gender?: '男性' | '女性' | 'その他';
  birthday?: string; // or Date
  phone?: string;
  address?: string;
  sessionType?: 'オンライン' | '対面';
  notes?: string;
}

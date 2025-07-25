export interface ApplicationForm {
  name: string;
  kana: string;
  email: string;
  gender?: '男性' | '女性' | 'その他';
  birthday?: string; // YYYY-MM-DD
  phone?: string;
  address?: string;
  preferredSessionType?: 'オンライン' | '対面';
  notes?: string;
}

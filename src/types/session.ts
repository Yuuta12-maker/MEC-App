export interface Session {
  id: string;
  clientId: string;
  clientName: string;
  date: string; // ISO string or Date
  time: string; // HH:mm
  type: 'トライアル' | '通常セッション' | 'その他';
  status: '予定' | '実施済み' | 'キャンセル';
  coachName: string;
  googleMeetLink?: string;
  notes?: string;
  summary?: string;
}

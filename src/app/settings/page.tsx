'use client';

import withAuth from '@/components/withAuth';
import Layout from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useTheme } from 'next-themes';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';

function SettingsPage() {
  const { theme, setTheme } = useTheme();

  const handleProfileSave = () => {
    toast({
      title: "プロフィールを保存しました",
      description: "（デモ機能）",
    });
  };

  const handlePasswordChange = () => {
    toast({
      title: "パスワードを変更しました",
      description: "（デモ機能）",
    });
  };

  return (
    <Layout>
      <h1 className="text-3xl font-bold mb-6">設定</h1>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>表示設定</CardTitle>
          <CardDescription>アプリケーションの表示テーマを設定します。</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-between">
          <Label htmlFor="dark-mode">ダークモード</Label>
          <Switch
            id="dark-mode"
            checked={theme === 'dark'}
            onCheckedChange={(checked) => setTheme(checked ? 'dark' : 'light')}
          />
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>プロフィール設定</CardTitle>
          <CardDescription>ログインしているユーザーの情報を編集します。</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="name">名前</Label>
            <Input id="name" defaultValue="森山雄太" className="mt-1" />
          </div>
          <div>
            <Label htmlFor="email">メールアドレス</Label>
            <Input id="email" defaultValue="mindengineeringcoaching@gmail.com" className="mt-1" />
          </div>
          <Button onClick={handleProfileSave}>保存</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>パスワード変更</CardTitle>
          <CardDescription>パスワードを変更します。</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="current-password">現在のパスワード</Label>
            <Input id="current-password" type="password" className="mt-1" />
          </div>
          <div>
            <Label htmlFor="new-password">新しいパスワード</Label>
            <Input id="new-password" type="password" className="mt-1" />
          </div>
          <div>
            <Label htmlFor="confirm-password">新しいパスワード（確認）</Label>
            <Input id="confirm-password" type="password" className="mt-1" />
          </div>
          <Button onClick={handlePasswordChange}>パスワードを変更</Button>
        </CardContent>
      </Card>
    </Layout>
  );
}

export default withAuth(SettingsPage);

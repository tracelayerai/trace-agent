import { AppShell } from '../components/layout';
import { Card } from '../components/ui';

export default function SettingsPage() {
  return (
    <AppShell>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-text-primary mb-1">Settings</h1>
          <p className="text-sm text-text-secondary">Manage your account and preferences</p>
        </div>
        <Card padding="lg">
          <p className="text-sm text-text-secondary">Settings content — placeholder for wireframe.</p>
        </Card>
      </div>
    </AppShell>
  );
}

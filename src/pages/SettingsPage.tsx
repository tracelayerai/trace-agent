import { useState } from 'react';
import Sidebar from '@/components/layout/Sidebar';
import { CaseHeader } from '@/components/core/CaseHeader';

export default function SettingsPage() {
  const [sidebarExpanded, setSidebarExpanded] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-[#070D1F] p-[16px] gap-[16px] box-border">
      <Sidebar expanded={sidebarExpanded} setExpanded={setSidebarExpanded} />

      <div className="flex-1 overflow-hidden">
        <main className="h-full overflow-hidden bg-white rounded-[12px] shadow-[0_4px_24px_rgba(0,0,0,0.28)] flex flex-col">
          <div className="shrink-0">
            <CaseHeader
              title="Settings"
              showStatusRow={false}
            />
          </div>

          <div className="flex-1 overflow-y-auto flex flex-col">
            <div className="flex-1 bg-[#F9FAFB] flex items-center justify-center">
              <span className="text-[14px] text-[#9CA3AF]">Coming soon</span>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

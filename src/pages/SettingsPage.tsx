import { useState } from 'react';
import { SURFACE } from '@/tokens/designTokens';
import Sidebar from '@/components/layout/Sidebar';
import { CaseHeader } from '@/components/core/CaseHeader';

export default function SettingsPage() {
  const [sidebarExpanded, setSidebarExpanded] = useState(false);

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: SURFACE.frame.bg, padding: SURFACE.frame.padding, gap: SURFACE.frame.padding, boxSizing: 'border-box' }}>
      <Sidebar expanded={sidebarExpanded} setExpanded={setSidebarExpanded} />

      <div style={{ flex: 1, overflow: 'hidden' }}>

        <main style={{ height: '100%', overflow: 'hidden', background: SURFACE.content.bg, borderRadius: SURFACE.content.borderRadius, boxShadow: SURFACE.content.shadow, display: 'flex', flexDirection: 'column' }}>
          <div style={{ flexShrink: 0 }}>
            <CaseHeader
              title="Settings"
              showStatusRow={false}
            />
          </div>

          <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
            <div style={{ flex: 1, background: SURFACE.content.bodyBg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: 14, color: '#9CA3AF' }}>Coming soon</span>
            </div>
          </div>
        </main>

      </div>
    </div>
  );
}

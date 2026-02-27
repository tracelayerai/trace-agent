import { Sidebar } from './Sidebar';

export const AppShell = ({ children }) => {
  return (
    <div className="min-h-screen bg-page">
      <Sidebar />
      <main className="ml-16 p-8 overflow-y-auto min-h-screen">
        {children}
      </main>
    </div>
  );
};

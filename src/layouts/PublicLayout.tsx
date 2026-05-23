import { Outlet } from 'react-router-dom';

export const PublicLayout = () => {
  return (
    <div className="min-h-screen relative overflow-hidden bg-[var(--app-bg)]">
      {/* Dynamic Background Gradients */}
      <div className="absolute top-0 right-0 w-[80vw] h-[80vw] bg-[var(--app-accent)] opacity-[0.05] rounded-full blur-[150px] -translate-y-1/2 translate-x-1/2"></div>
      <div className="absolute bottom-0 left-0 w-[60vw] h-[60vw] bg-[var(--app-accent-soft)] opacity-[0.08] rounded-full blur-[120px] translate-y-1/3 -translate-x-1/4"></div>


      <main className="relative z-10 w-full">
        <Outlet />
      </main>
    </div>
  );
};

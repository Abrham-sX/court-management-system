export const SkeletonCard = ({ lines = 3, className = '' }: { lines?: number; className?: string }) => (
  <div className={`app-card animate-pulse-soft ${className}`}>
    <div className="space-y-3">
      <div className="h-4 rounded-full w-2/3" style={{ background: 'var(--app-panel-soft)' }} />
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className="h-3 rounded-full"
          style={{ background: 'var(--app-panel-soft)', width: `${85 - i * 10}%` }}
        />
      ))}
    </div>
  </div>
);
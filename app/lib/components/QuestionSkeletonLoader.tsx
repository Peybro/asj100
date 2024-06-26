export default function QuestionSkeletonLoader() {
  return (
    <div className="article space-y-6">
      {Array.from({ length: 3 }).map((_, i) => {
        return (
          <div key={`skeleton-key-${i}`} className="animate-pulse space-y-1">
            <div className="h-5 w-5/6 rounded-xl bg-slate-500"></div>
            <div className="h-5 w-2/3 rounded-xl bg-slate-500"></div>
            <div className="h-14 w-full rounded-md border border-slate-600 bg-gray-800"></div>
          </div>
        );
      })}
    </div>
  );
}

const Skeleton = ({ className = '', variant = 'default', count = 1 }) => {
  const variants = {
    default: 'h-4 rounded-lg',
    title: 'h-6 w-3/4 rounded-lg',
    text: 'h-4 rounded-lg',
    avatar: 'h-12 w-12 rounded-full',
    card: 'h-48 rounded-2xl',
    button: 'h-10 w-32 rounded-xl',
    image: 'h-40 w-full rounded-xl',
    stat: 'h-24 rounded-2xl',
  };

  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={`animate-shimmer ${variants[variant]} ${className}`}
        />
      ))}
    </>
  );
};

export const CardSkeleton = () => (
  <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4">
    <Skeleton variant="title" />
    <Skeleton variant="text" className="w-full" />
    <Skeleton variant="text" className="w-2/3" />
    <div className="flex gap-2 pt-2">
      <Skeleton variant="button" />
      <Skeleton variant="button" />
    </div>
  </div>
);

export const StatSkeleton = () => (
  <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-3">
    <div className="flex justify-between items-start">
      <Skeleton variant="avatar" />
      <Skeleton className="h-4 w-16" />
    </div>
    <Skeleton className="h-8 w-24" />
    <Skeleton variant="text" className="w-1/2" />
  </div>
);

export const ListSkeleton = ({ items = 5 }) => (
  <div className="space-y-3">
    {Array.from({ length: items }).map((_, i) => (
      <div key={i} className="flex items-center gap-4 p-4 bg-white border border-slate-200 rounded-xl">
        <Skeleton variant="avatar" />
        <div className="flex-1 space-y-2">
          <Skeleton variant="title" />
          <Skeleton variant="text" className="w-1/2" />
        </div>
      </div>
    ))}
  </div>
);

export const ChatSkeleton = () => (
  <div className="space-y-4 p-4">
    {Array.from({ length: 3 }).map((_, i) => (
      <div key={i} className={`flex ${i % 2 === 0 ? 'justify-end' : 'justify-start'}`}>
        <div className={`max-w-[70%] space-y-2 ${i % 2 === 0 ? 'items-end' : 'items-start'}`}>
          <Skeleton className={`h-16 ${i % 2 === 0 ? 'w-48' : 'w-64'} rounded-2xl`} />
        </div>
      </div>
    ))}
  </div>
);

export default Skeleton;

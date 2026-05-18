export default function TrainerCardSkeleton() {
  return (
    <div className="flex flex-col border border-white/10 bg-charcoal">
      <div className="aspect-[4/5] animate-pulse bg-white/[0.06]" />
      <div className="flex flex-col gap-3 p-5">
        <div className="h-6 w-2/3 animate-pulse bg-white/10" />
        <div className="h-3 w-full animate-pulse bg-white/[0.06]" />
        <div className="flex gap-1.5">
          <div className="h-5 w-16 animate-pulse bg-white/10" />
          <div className="h-5 w-20 animate-pulse bg-white/10" />
        </div>
        <div className="h-3 w-28 animate-pulse bg-white/[0.06]" />
        <div className="mt-2 flex items-center justify-between border-t border-white/10 pt-4">
          <div className="h-8 w-24 animate-pulse bg-white/10" />
          <div className="h-4 w-14 animate-pulse bg-white/[0.06]" />
        </div>
      </div>
    </div>
  );
}

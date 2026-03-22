export default function SkeletonCard() {
  return (
    <div className="card overflow-hidden">
      <div className="skeleton h-52 w-full" />
      <div className="p-4 space-y-3">
        <div className="flex justify-between">
          <div className="skeleton h-6 w-24 rounded-full" />
          <div className="skeleton h-5 w-32 rounded-full" />
        </div>
        <div className="flex gap-2">
          <div className="skeleton h-5 w-20 rounded-full" />
          <div className="skeleton h-5 w-24 rounded-full" />
        </div>
        <div className="skeleton h-4 w-32 rounded" />
        <div className="skeleton h-4 w-full rounded" />
        <div className="skeleton h-4 w-3/4 rounded" />
        <div className="skeleton h-1.5 w-full rounded-full" />
        <div className="flex gap-2">
          <div className="skeleton h-10 flex-1 rounded-xl" />
          <div className="skeleton h-10 w-16 rounded-xl" />
        </div>
      </div>
    </div>
  )
}

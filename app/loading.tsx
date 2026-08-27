export default function Loading() {
  return (
    <div className="shell py-20" aria-busy="true" aria-live="polite">
      <span className="sr-only">Loading</span>
      <div aria-hidden="true" className="flex flex-col gap-14">
        <div className="h-[45vh] min-h-64 w-full animate-pulse bg-bone-deep" />
        <div className="grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-6 sm:gap-y-14 lg:grid-cols-3 xl:grid-cols-4">
          {[0, 1, 2, 3].map((card) => (
            <div key={card} className="flex flex-col gap-4">
              <div className="aspect-[4/5] w-full animate-pulse bg-bone-deep" />
              <div className="h-3 w-16 animate-pulse bg-bone-deep" />
              <div className="h-5 w-3/4 animate-pulse bg-bone-deep" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

import Skeleton from "react-loading-skeleton";

export default function SkeletonLoading({ count = 6 }) {
  const items = Array.from({
    length: count,
  });

  return (
    <div className="row g-4">
      {items.map((_, index) => {
        return (
          <div
            className="col-md-6 col-lg-4"
            key={index}
          >
            <div className="product-card h-100">
              <Skeleton
                height={220}
                borderRadius={18}
              />

              <div className="mt-3">
                <Skeleton
                  width="35%"
                />

                <Skeleton
                  height={24}
                />

                <Skeleton
                  count={2}
                />

                <Skeleton
                  width="45%"
                  height={28}
                />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

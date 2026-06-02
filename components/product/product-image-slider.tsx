"use client";

import Image from "next/image";
import type { MouseEvent } from "react";
import { useEffect, useMemo, useState } from "react";

type ProductImageSliderProps = {
  images: string[];
  alt: string;
  sizes: string;
  imageClassName?: string;
};

export function ProductImageSlider({ images, alt, sizes, imageClassName = "" }: ProductImageSliderProps) {
  const validImages = useMemo(() => images.filter(Boolean), [images]);
  const [activeIndex, setActiveIndex] = useState(0);
  const hasMultipleImages = validImages.length > 1;
  const activeImage = validImages[activeIndex] ?? validImages[0];

  useEffect(() => {
    setActiveIndex(0);
    if (!hasMultipleImages) return;

    const intervalId = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % validImages.length);
    }, 4500);

    return () => window.clearInterval(intervalId);
  }, [hasMultipleImages, validImages.length]);

  function showNextImage(event: MouseEvent<HTMLDivElement>) {
    if (!hasMultipleImages) return;
    event.preventDefault();
    event.stopPropagation();
    setActiveIndex((current) => (current + 1) % validImages.length);
  }

  if (!validImages.length) {
    return <div className="h-full w-full bg-slate-100 dark:bg-white/10" />;
  }

  return (
    <div
      onClick={showNextImage}
      className={`absolute inset-0 ${hasMultipleImages ? "cursor-pointer" : ""}`}
    >
      <Image
        key={`${activeImage}-${activeIndex}`}
        src={activeImage}
        alt={alt}
        fill
        unoptimized={activeImage.startsWith("data:")}
        sizes={sizes}
        className={`object-cover transition duration-1000 ease-out ${imageClassName}`}
      />
      {hasMultipleImages ? (
        <div className="absolute bottom-3 right-3 flex gap-1.5 rounded-full bg-ink/55 px-2 py-1 backdrop-blur">
          {validImages.map((image, index) => (
            <span
              key={`${image}-dot-${index}`}
              className={`size-1.5 rounded-full transition ${index === activeIndex ? "bg-white" : "bg-white/45"}`}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}

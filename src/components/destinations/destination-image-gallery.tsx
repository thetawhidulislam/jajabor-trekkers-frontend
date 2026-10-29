"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { messages } from "@/messages/en";

export type DestinationGalleryImage = {
  src: string;
  caption: string | null;
};

const imageFallback = "/destination-fallback.svg";

export function DestinationImageGallery({
  name,
  images,
}: {
  name: string;
  images: DestinationGalleryImage[];
}) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [failedImages, setFailedImages] = useState<Set<string>>(() => new Set());
  const dialogRef = useRef<HTMLDialogElement>(null);
  const activeImage = activeIndex === null ? null : images[activeIndex];

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (activeIndex !== null && !dialog.open) dialog.showModal();
    if (activeIndex === null && dialog.open) dialog.close();
  }, [activeIndex]);

  function imageSource(src: string) {
    return src.includes("example.com") || failedImages.has(src) ? imageFallback : src;
  }

  function markFailed(src: string) {
    setFailedImages((current) => new Set(current).add(src));
  }

  function changeImage(direction: -1 | 1) {
    setActiveIndex((current) => {
      if (current === null) return current;
      return (current + direction + images.length) % images.length;
    });
  }

  function closeLightbox() {
    if (dialogRef.current?.open) dialogRef.current.close();
    setActiveIndex(null);
  }

  return (
    <>
      <div className="destination-gallery" role="group" aria-label={messages.destinationsPage.galleryLabel(name)}>
        {images.map((image, index) => (
          <button
            className="destination-gallery-item"
            type="button"
            key={`${image.src}-${index}`}
            aria-label={messages.destinationsPage.openImage(index + 1)}
            onClick={() => setActiveIndex(index)}
          >
            <Image
              src={imageSource(image.src)}
              alt={messages.destinationsPage.galleryImageAlt(name, image.caption)}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 35vw, 420px"
              onError={() => markFailed(image.src)}
            />
          </button>
        ))}
      </div>
      <dialog
        className="destination-lightbox"
        ref={dialogRef}
        aria-label={messages.destinationsPage.galleryLabel(name)}
        onCancel={(event) => {
          event.preventDefault();
          closeLightbox();
        }}
        onClose={() => setActiveIndex(null)}
        onKeyDown={(event) => {
          if (event.key === "ArrowLeft") changeImage(-1);
          if (event.key === "ArrowRight") changeImage(1);
          if (event.key === "Escape") {
            event.preventDefault();
            closeLightbox();
          }
        }}
      >
        {activeImage && activeIndex !== null && (
          <div className="destination-lightbox-content">
            <button
              className="destination-lightbox-close"
              type="button"
              aria-label={messages.destinationsPage.closeImage}
              onClick={closeLightbox}
            >
              <X size={22} />
            </button>
            {images.length > 1 && (
              <>
                <button
                  className="destination-lightbox-previous"
                  type="button"
                  aria-label={messages.destinationsPage.previousImage}
                  onClick={() => changeImage(-1)}
                >
                  <ChevronLeft size={25} />
                </button>
                <button
                  className="destination-lightbox-next"
                  type="button"
                  aria-label={messages.destinationsPage.nextImage}
                  onClick={() => changeImage(1)}
                >
                  <ChevronRight size={25} />
                </button>
              </>
            )}
            <div className="destination-lightbox-image">
              <Image
                src={imageSource(activeImage.src)}
                alt={messages.destinationsPage.galleryImageAlt(name, activeImage.caption)}
                fill
                sizes="90vw"
                onError={() => markFailed(activeImage.src)}
              />
            </div>
            {activeImage.caption && <p>{activeImage.caption}</p>}
          </div>
        )}
      </dialog>
    </>
  );
}

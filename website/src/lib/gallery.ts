/**
 * Shared types for project gallery slides.
 *
 * A slide is either an image or a self-hosted video. Video slides require a
 * poster image so the carousel can render a real frame without downloading a
 * single video byte (`preload="none"` everywhere) — this is what keeps video
 * slides Lighthouse-neutral.
 *
 * Slides can be local (theme assets, `ImageMetadata`) or remote (Payload CMS
 * media URLs). Remote slides are resolved through `payload.resolveMediaUrl`
 * and rendered with `<Image inferSize>`.
 */
import type { ImageMetadata } from 'astro';
import { payload } from '@/lib/payload-client';
import type { Project } from '@/lib/payload-types';

export interface GalleryImageSlide {
  src: ImageMetadata;
  alt: string;
}

export interface GalleryVideoSlide {
  /** Root-relative path to a video file in `public/`, e.g. `/videos/demo.mp4`. */
  video: string;
  /** Poster frame shown before playback — required, it doubles as the slide's visual. */
  poster: ImageMetadata;
  alt: string;
}

export interface GalleryRemoteImageSlide {
  /** Absolute URL (resolved via payload.resolveMediaUrl). */
  src: string;
  alt: string;
}

export interface GalleryRemoteVideoSlide {
  /** Absolute URL to a video file. */
  video: string;
  /** Absolute URL to the poster frame. */
  poster: string;
  alt: string;
}

export type GallerySlide =
  | GalleryImageSlide
  | GalleryVideoSlide
  | GalleryRemoteImageSlide
  | GalleryRemoteVideoSlide;

export function isVideoSlide(slide: GallerySlide): slide is GalleryVideoSlide | GalleryRemoteVideoSlide {
  return 'video' in slide;
}

export function isRemoteSlide(
  slide: GallerySlide
): slide is GalleryRemoteImageSlide | GalleryRemoteVideoSlide {
  return typeof (slide as GalleryRemoteImageSlide).src === 'string' || isVideoSlide(slide);
}

/**
 * Build carousel/gallery slides from a Payload project: the cover image first,
 * then each gallery image. Only slides with a resolvable URL are included.
 */
export function projectToSlides(project: Project): GallerySlide[] {
  const slides: GallerySlide[] = [];

  const cover =
    project.coverImage && typeof project.coverImage !== 'number' ? project.coverImage : null;
  if (cover?.url) {
    slides.push({ src: payload.resolveMediaUrl(cover.url), alt: cover.alt || project.title });
  }

  for (const item of project.gallery ?? []) {
    const img = item.image && typeof item.image !== 'number' ? item.image : null;
    if (img?.url) {
      slides.push({
        src: payload.resolveMediaUrl(img.url),
        alt: item.alt || img.alt || project.title,
      });
    }
  }

  return slides;
}
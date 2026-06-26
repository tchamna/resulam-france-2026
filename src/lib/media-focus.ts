export const MEDIA_FOCUS_EVENT = "resulam:media-focus";
export const MEDIA_RELEASE_EVENT = "resulam:media-release";

export function dispatchMediaFocus() {
  window.dispatchEvent(new CustomEvent(MEDIA_FOCUS_EVENT));
}

export function dispatchMediaRelease() {
  window.dispatchEvent(new CustomEvent(MEDIA_RELEASE_EVENT));
}

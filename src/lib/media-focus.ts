export const MEDIA_FOCUS_EVENT = "resulam:media-focus";

export function dispatchMediaFocus() {
  window.dispatchEvent(new CustomEvent(MEDIA_FOCUS_EVENT));
}

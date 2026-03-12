// useStickyTabSwap — shared scroll logic for sticky tab swap pattern
//
// When `triggerRef` element scrolls out of the scroll container:
//   - shows `stickyRef`  (the sticky tab strip)
//   - hides `hideRef`    (optional: the element being replaced, e.g. compact search)
//
// edge: 'top' (default) — triggers when trigger's top reaches container top
//       'bottom'         — triggers when trigger's bottom reaches container top (full element gone)

import type { RefObject } from 'react';

interface UseStickyTabSwapOptions {
  triggerRef: RefObject<HTMLElement>;
  stickyRef: RefObject<HTMLElement>;
  hideRef?: RefObject<HTMLElement>;
  edge?: 'top' | 'bottom';
}

export function useStickyTabSwap({ triggerRef, stickyRef, hideRef, edge = 'top' }: UseStickyTabSwapOptions) {
  function handleScroll(e: React.UIEvent<HTMLElement>) {
    if (!triggerRef.current || !stickyRef.current) return;
    const containerTop = e.currentTarget.getBoundingClientRect().top;
    const rect         = triggerRef.current.getBoundingClientRect();
    const sticky       = edge === 'bottom'
      ? rect.bottom <= containerTop + 1
      : rect.top    <= containerTop + 1;
    stickyRef.current.style.display = sticky ? 'flex' : 'none';
    if (hideRef?.current)
      hideRef.current.style.display = sticky ? 'none' : 'flex';
  }

  // Call with the scroll container element before switching tabs.
  // Anchors scroll so trigger sits at container top — prevents layout shift
  // when tab content height changes.
  function scrollToAnchor(scrollEl: HTMLElement | null) {
    if (!scrollEl || !stickyRef.current) return;
    if (stickyRef.current.style.display !== 'flex') return;
    scrollEl.scrollTop = 0;
    stickyRef.current.style.display = 'none';
    if (hideRef?.current) hideRef.current.style.display = 'flex';
  }

  return { handleScroll, scrollToAnchor };
}

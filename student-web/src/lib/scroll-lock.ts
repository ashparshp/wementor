let lockCount = 0;
let scrollY = 0;

export function lockScroll() {
  if (typeof window === "undefined") return;

  if (lockCount === 0) {
    scrollY = window.scrollY;
    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
    document.body.style.position = "fixed";
    document.body.style.top = `-${scrollY}px`;
    document.body.style.left = "0";
    document.body.style.right = "0";
    document.body.style.width = "100%";
  }

  lockCount += 1;
}

export function unlockScroll() {
  if (typeof window === "undefined") return;

  lockCount = Math.max(0, lockCount - 1);

  if (lockCount === 0) {
    document.documentElement.style.overflow = "";
    document.body.style.overflow = "";
    document.body.style.position = "";
    document.body.style.top = "";
    document.body.style.left = "";
    document.body.style.right = "";
    document.body.style.width = "";
    window.scrollTo(0, scrollY);
  }
}

export function preventBackgroundTouchMove(event: TouchEvent) {
  const target = event.target as Element | null;
  if (target?.closest("[data-scroll-lock-ignore]")) return;
  event.preventDefault();
}

import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'

type Photo = {
  src: string
  alt: string
}

type MobileGalleryProps = {
  photos: Photo[]
  selected: number
  onSelect: (index: number) => void
}

type Rect = {
  top: number
  left: number
  width: number
  height: number
}

type ViewerPhase = 'closed' | 'opening' | 'open' | 'closing'

function getPreviewBounds(): Rect {
  const vw = window.innerWidth
  const vh = window.innerHeight
  const topBar = 52
  const bottomChrome = 148
  const pad = 16
  const availableH = vh - topBar - bottomChrome

  return {
    top: topBar + pad / 2,
    left: pad,
    width: vw - pad * 2,
    height: availableH - pad,
  }
}

function getContainRect(naturalW: number, naturalH: number, bounds: Rect): Rect {
  if (!naturalW || !naturalH) return bounds

  const scale = Math.min(bounds.width / naturalW, bounds.height / naturalH)
  const width = naturalW * scale
  const height = naturalH * scale

  return {
    top: bounds.top + (bounds.height - height) / 2,
    left: bounds.left + (bounds.width - width) / 2,
    width,
    height,
  }
}

function rectFromDOMRect(r: DOMRect): Rect {
  return { top: r.top, left: r.left, width: r.width, height: r.height }
}

function applyFlyRect(fly: HTMLImageElement, rect: Rect, opacity = 1) {
  gsap.set(fly, {
    position: 'fixed',
    top: rect.top,
    left: rect.left,
    width: rect.width,
    height: rect.height,
    opacity,
    objectFit: 'cover',
    zIndex: 60,
    borderRadius: 0,
    margin: 0,
    padding: 0,
  })
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = () => resolve(img)
    img.src = src
  })
}

function tweenFlyRect(
  fly: HTMLImageElement,
  to: Rect,
  duration: number,
  ease: string,
): gsap.core.Tween {
  return gsap.to(fly, {
    top: to.top,
    left: to.left,
    width: to.width,
    height: to.height,
    duration,
    ease,
  })
}

export function MobileGallery({ photos, selected, onSelect }: MobileGalleryProps) {
  const [phase, setPhase] = useState<ViewerPhase>('closed')
  const touchStartX = useRef(0)
  const touchStartY = useRef(0)
  const stripRef = useRef<HTMLUListElement>(null)
  const gridRefs = useRef<(HTMLButtonElement | null)[]>([])
  const gridImgRefs = useRef<(HTMLImageElement | null)[]>([])
  const flyRef = useRef<HTMLImageElement>(null)
  const backdropRef = useRef<HTMLDivElement>(null)
  const chromeRef = useRef<HTMLDivElement>(null)
  const animating = useRef(false)
  const currentRect = useRef<Rect | null>(null)
  const prevSelected = useRef(selected)

  const isViewerActive = phase !== 'closed'
  const photo = photos[selected]

  const goNext = () => onSelect(Math.min(selected + 1, photos.length - 1))
  const goPrev = () => onSelect(Math.max(selected - 1, 0))

  useEffect(() => {
    if (phase !== 'open') return
    const active = stripRef.current?.querySelector(`[data-index="${selected}"]`)
    active?.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' })
  }, [selected, phase])

  // Smoothly resize flying image when switching photos in the viewer
  useEffect(() => {
    if (phase !== 'open' || animating.current) {
      prevSelected.current = selected
      return
    }

    if (prevSelected.current === selected) return
    prevSelected.current = selected

    const fly = flyRef.current
    if (!fly) return

    let cancelled = false
    gsap.killTweensOf(fly)

    const updatePhoto = async () => {
      const loaded = await loadImage(photo.src)
      if (cancelled || !flyRef.current) return

      flyRef.current.src = photo.src
      flyRef.current.alt = photo.alt

      const to = getContainRect(loaded.naturalWidth, loaded.naturalHeight, getPreviewBounds())
      await tweenFlyRect(flyRef.current, to, 0.32, 'power2.inOut')
      currentRect.current = to
    }

    updatePhoto()
    return () => {
      cancelled = true
    }
  }, [selected, photo.src, photo.alt, phase])

  const openViewer = async (index: number, button: HTMLButtonElement) => {
    if (animating.current) return

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    onSelect(index)

    const fly = flyRef.current
    const backdrop = backdropRef.current

    if (reducedMotion || !fly || !backdrop) {
      setPhase('open')
      return
    }

    animating.current = true
    setPhase('opening')

    const from = rectFromDOMRect(button.getBoundingClientRect())
    const loaded = await loadImage(photos[index].src)
    const to = getContainRect(loaded.naturalWidth, loaded.naturalHeight, getPreviewBounds())

    fly.src = photos[index].src
    fly.alt = photos[index].alt
    applyFlyRect(fly, from)
    gsap.set(backdrop, { opacity: 0 })
    gsap.set(chromeRef.current, { opacity: 0 })

    gsap
      .timeline({
        onComplete: () => {
          currentRect.current = to
          setPhase('open')
          animating.current = false
        },
      })
      .to(backdrop, { opacity: 1, duration: 0.4, ease: 'power2.out' }, 0)
      .add(tweenFlyRect(fly, to, 0.5, 'power3.inOut'), 0)
      .to(chromeRef.current, { opacity: 1, duration: 0.3, ease: 'power2.out' }, 0.24)
  }

  const closeViewer = () => {
    if (animating.current) return

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reducedMotion) {
      setPhase('closed')
      return
    }

    const button = gridRefs.current[selected]
    const gridImg = gridImgRefs.current[selected]
    const fly = flyRef.current
    const backdrop = backdropRef.current

    if (!button || !fly || !backdrop) {
      setPhase('closed')
      return
    }

    animating.current = true
    setPhase('closing')

    button.scrollIntoView({ block: 'nearest', inline: 'nearest' })

    const from =
      currentRect.current ?? rectFromDOMRect(fly.getBoundingClientRect())

    requestAnimationFrame(() => {
      const to = rectFromDOMRect(button.getBoundingClientRect())
      applyFlyRect(fly, from)

      gsap
        .timeline({
          onComplete: () => {
            if (gridImg) gsap.set(gridImg, { opacity: 1 })
            gsap.set(fly, { opacity: 0 })
            currentRect.current = null
            setPhase('closed')
            animating.current = false
          },
        })
        .to(chromeRef.current, { opacity: 0, duration: 0.16, ease: 'power2.in' }, 0)
        .to(backdrop, { opacity: 0, duration: 0.38, ease: 'power2.in' }, 0.06)
        .add(tweenFlyRect(fly, to, 0.44, 'power3.inOut'), 0.02)
    })
  }

  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX
    touchStartY.current = e.touches[0].clientY
  }

  const onTouchEnd = (e: React.TouchEvent) => {
    if (phase !== 'open' || animating.current) return

    const dx = touchStartX.current - e.changedTouches[0].clientX
    const dy = touchStartY.current - e.changedTouches[0].clientY

    if (Math.abs(dx) > 48 && Math.abs(dx) > Math.abs(dy)) {
      if (dx > 0) goNext()
      else goPrev()
    } else if (dy < -64 && Math.abs(dy) > Math.abs(dx)) {
      closeViewer()
    }
  }

  return (
    <>
      <div className="flex min-h-0 flex-1 flex-col lg:hidden">
        <div className="min-h-0 flex-1 pt-4 overflow-y-auto">
          <ul className="grid grid-cols-3 gap-3 bg-paper p-4 pb-6">
            {photos.map((p, i) => (
              <li key={p.src}>
                <button
                  ref={(el) => {
                    gridRefs.current[i] = el
                  }}
                  type="button"
                  onClick={(e) => openViewer(i, e.currentTarget)}
                  aria-label={`Open photo: ${p.alt}`}
                  className="relative block aspect-square w-full cursor-pointer touch-manipulation active:opacity-60"
                  style={{ WebkitTapHighlightColor: 'transparent' }}
                >
                  <img
                    ref={(el) => {
                      gridImgRefs.current[i] = el
                    }}
                    src={p.src}
                    alt={p.alt}
                    loading="lazy"
                    draggable={false}
                    className="h-full w-full object-cover select-none"
                    style={{
                      opacity: isViewerActive && selected === i ? 0 : 1,
                    }}
                  />
                  <span
                    className="pointer-events-none absolute inset-0 flex items-center justify-center"
                    style={{
                      opacity: isViewerActive && selected === i ? 0 : 1,
                    }}
                  >
                    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden>
                      <path
                        d="M9 3V15M15 9H3"
                        stroke="white"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Single flying image — visible for the entire open / view / close cycle */}
      <img
        ref={flyRef}
        alt=""
        aria-hidden={phase === 'closed'}
        className="pointer-events-none fixed opacity-0 select-none"
        draggable={false}
      />

      <div
        ref={backdropRef}
        aria-hidden
        className={`fixed inset-0 z-50 bg-paper ${isViewerActive ? '' : 'pointer-events-none opacity-0'}`}
      />

      {isViewerActive && (
        <div
          ref={chromeRef}
          className="fixed inset-0 z-50 flex flex-col bg-transparent"
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
        >
          <div className="flex shrink-0 items-center justify-between border-b border-dashed border-ink/20 bg-paper px-4 py-3">
            <button
              type="button"
              onClick={closeViewer}
              className="nav-text flex cursor-pointer items-center gap-1 text-ink"
              style={{ WebkitTapHighlightColor: 'transparent' }}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
                <path
                  d="M10.5 3 5.5 8l5 5"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              Back
            </button>
            <p className="nav-text text-[#5C5C5C]">
              {String(selected + 1).padStart(2, '0')} /{' '}
              {String(photos.length).padStart(2, '0')}
            </p>
          </div>

          {/* Empty preview area — flying image renders above this */}
          <div className="dotted-panel min-h-0 flex-1" aria-hidden />

          <p className="nav-text shrink-0 truncate bg-paper px-4 pt-3 text-center text-[#5C5C5C]">
            {photo.alt}
          </p>

          <ul
            ref={stripRef}
            className="viewer-strip flex shrink-0 items-center gap-[3px] overflow-x-auto bg-paper px-4 py-3"
            aria-label="Photo filmstrip"
          >
            {photos.map((p, i) => (
              <li key={p.src} data-index={i} className="shrink-0">
                <button
                  type="button"
                  onClick={() => onSelect(i)}
                  aria-label={`View photo: ${p.alt}`}
                  aria-current={i === selected}
                  className={`block h-12 cursor-pointer overflow-hidden transition-all duration-300 ease-out ${
                    i === selected ? 'w-12' : 'w-7'
                  }`}
                  style={{ WebkitTapHighlightColor: 'transparent' }}
                >
                  <img
                    src={p.src}
                    alt=""
                    draggable={false}
                    className="h-full w-full object-cover select-none"
                  />
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </>
  )
}

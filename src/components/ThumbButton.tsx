import { useRef } from 'react'
import gsap from 'gsap'

type ThumbButtonProps = {
  src: string
  alt: string
  isSelected: boolean
  onSelect: () => void
}

export function ThumbButton({ src, alt, isSelected, onSelect }: ThumbButtonProps) {
  const buttonRef = useRef<HTMLButtonElement>(null)
  const pressed = useRef(false)

  const press = () => {
    if (!buttonRef.current || pressed.current) return
    pressed.current = true

    gsap.to(buttonRef.current, {
      scale: 0.92,
      y: 2,
      duration: 0.1,
      ease: 'power3.out',
      overwrite: true,
    })
  }

  const release = () => {
    if (!buttonRef.current || !pressed.current) return
    pressed.current = false

    gsap.to(buttonRef.current, {
      scale: 1,
      y: 0,
      duration: 0.55,
      ease: 'elastic.out(1, 0.65)',
      overwrite: true,
    })
  }

  return (
    <button
      ref={buttonRef}
      type="button"
      onPointerDown={press}
      onPointerUp={release}
      onPointerLeave={release}
      onPointerCancel={release}
      onClick={onSelect}
      aria-pressed={isSelected}
      aria-label={`View photo: ${alt}`}
      className={`thumb cursor-pointer touch-manipulation will-change-transform focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-select ${
        isSelected ? 'border-select' : 'border-transparent'
      }`}
    >
      <img
        src={src}
        alt={alt}
        loading="lazy"
        draggable={false}
        className="pointer-events-none h-full w-full object-cover select-none"
      />
    </button>
  )
}

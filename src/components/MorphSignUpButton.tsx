import { useId, useRef } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import { interpolate } from 'flubber'
import { CornerBorder } from './CornerBorder'

const PATH_IDLE = 'M 0 100 V 100 Q 50 100 100 100 V 100 z'
const PATH_START = 'M 0 100 V 50 Q 50 0 100 50 V 100 z'
const PATH_END = 'M 0 100 V 0 Q 50 0 100 0 V 100 z'

type MorphSignUpButtonProps = {
  activeImage: string
}

export function MorphSignUpButton({ activeImage }: MorphSignUpButtonProps) {
  const buttonRef = useRef<HTMLButtonElement>(null)
  const pathRef = useRef<SVGPathElement>(null)
  const maskId = useId().replace(/:/g, '')

  useGSAP(
    () => {
      const path = pathRef.current
      const button = buttonRef.current
      if (!path || !button) return

      const toStart = interpolate(PATH_IDLE, PATH_START)
      const toEnd = interpolate(PATH_START, PATH_END)

      const tl = gsap.timeline({ paused: true })

      tl.to(
        {},
        {
          duration: 0.35,
          ease: 'power2.in',
          onUpdate: function () {
            path.setAttribute('d', toStart(this.progress()))
          },
        },
      ).to(
        {},
        {
          duration: 0.35,
          ease: 'power2.out',
          onUpdate: function () {
            path.setAttribute('d', toEnd(this.progress()))
          },
        },
      )

      const onEnter = () => tl.play()
      const onLeave = () => tl.reverse()

      button.addEventListener('mouseenter', onEnter)
      button.addEventListener('mouseleave', onLeave)

      return () => {
        button.removeEventListener('mouseenter', onEnter)
        button.removeEventListener('mouseleave', onLeave)
        tl.kill()
      }
    },
    { scope: buttonRef, dependencies: [activeImage] },
  )

  return (
    <button
      ref={buttonRef}
      type="button"
      className="nav-text group relative isolate min-w-[108px] cursor-pointer overflow-visible bg-ink px-5 py-2.5 text-paper"
    >
      <div className="absolute inset-0 z-10 overflow-hidden">
        <svg
          viewBox="0 0 100 100"
          preserveAspectRatio="xMidYMid slice"
          className="absolute inset-0 h-full w-full"
        >
          <defs>
            <mask id={maskId}>
              <rect x="0" y="0" width="100" height="100" fill="black" />
              <path ref={pathRef} fill="white" d={PATH_IDLE} />
            </mask>
          </defs>

          <image
            href={activeImage}
            preserveAspectRatio="xMidYMid slice"
            width="100"
            height="100"
            x="0"
            y="0"
            mask={`url(#${maskId})`}
          />
        </svg>
      </div>

      <span className="relative z-20 mix-blend-difference">Sign up</span>
      <CornerBorder borderClass="border-paper/60" />
    </button>
  )
}

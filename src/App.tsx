import { useState } from 'react'
import { CornerBorder } from './components/CornerBorder'
import { MobileGallery } from './components/MobileGallery'
import { MorphSignUpButton } from './components/MorphSignUpButton'
import { ThumbButton } from './components/ThumbButton'

type Photo = {
  src: string
  alt: string
}

const PHOTOS: Photo[] = [
  { src: '/images/im3.png', alt: 'Surface laptop on a travel map' },
  { src: '/images/im2.png', alt: 'Woman working at a home office desk' },
  { src: '/images/im1.png', alt: 'Code on a monitor lit in blue' },
  { src: '/images/im4.png', alt: 'PS5 controller in front of a match screen' },
  { src: '/images/im5.png', alt: 'Dear Dolly book beside a notebook' },
  { src: '/images/im6.png', alt: 'Tea and snacks on a patio table' },
  { src: '/images/im7.png', alt: 'Air Peace plane on the tarmac' },
  { src: '/images/im8.png', alt: 'Five-a-side football pitch at night' },
  { src: '/images/im9.png', alt: 'Laptop open on a plane seat tray' },
  { src: '/images/im10.png', alt: 'Pepper robot smiling' },
  { src: '/images/im11.png', alt: 'Airplane wing above the clouds' },
  { src: '/images/im12.png', alt: 'Pastry and a knife on a floral plate' },
]

const NAV_LINKS = ['Home', 'Gallery', 'Contact']

type NavProps = {
  activeImage: string
}

function Nav({ activeImage }: NavProps) {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <header className="relative shrink-0 border-b-2 border-dashed border-ink/20 bg-paper">
      <nav className="flex items-center justify-between gap-4 px-4 py-3 sm:px-8 sm:py-4">
        {/* Mobile: just Home + hamburger */}
        <a href="#" className="nav-text text-ink lg:hidden">
          Home
        </a>

        <ul className="hidden items-center gap-7 lg:flex">
          {NAV_LINKS.map((link, i) => (
            <li key={link}>
              <a
                href="#"
                className={`nav-text group relative inline-flex px-3 py-2 transition-colors hover:text-ink ${
                  i === 0 ? 'text-ink' : 'text-[#5C5C5C]'
                }`}
              >
                {link}
                <CornerBorder />
              </a>
            </li>
          ))}
        </ul>

        <div className="hidden shrink-0 items-center gap-3 lg:flex">
          <a
            href="#"
            className="nav-text group relative bg-panel px-5 py-2.5 transition-colors hover:bg-ink/10"
          >
            Login
            <CornerBorder />
          </a>
          <MorphSignUpButton activeImage={activeImage} />
        </div>

        <button
          type="button"
          onClick={() => setMenuOpen((open) => !open)}
          aria-expanded={menuOpen}
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          className="flex w-[52px] h-[44px] cursor-pointer items-center justify-center bg-ink lg:hidden"
          style={{ WebkitTapHighlightColor: 'transparent' }}
        >
          {menuOpen ? (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path d="M6 6L18 18" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
              <path d="M18 6L6 18" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          ) : (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path
                d="M10 5H20"
                stroke="white"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M4 12H20"
                stroke="white"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M4 19H14"
                stroke="white"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          )}
        </button>
      </nav>

      {/* Mobile dropdown menu */}
      {menuOpen && (
        <div className="menu-in absolute inset-x-0 top-full z-40 border-b-2 border-dashed border-ink/20 bg-paper lg:hidden">
          <ul className="flex flex-col px-4 py-2">
            {NAV_LINKS.map((link, i) => (
              <li key={link}>
                <a
                  href="#"
                  onClick={() => setMenuOpen(false)}
                  className={`nav-text block border-b border-dashed border-ink/10 py-3 ${
                    i === 0 ? 'text-ink' : 'text-[#5C5C5C]'
                  }`}
                >
                  {link}
                </a>
              </li>
            ))}
            <li>
              <a
                href="#"
                onClick={() => setMenuOpen(false)}
                className="nav-text block border-b border-dashed border-ink/10 py-3 text-[#5C5C5C]"
              >
                Login
              </a>
            </li>
            <li>
              <a
                href="#"
                onClick={() => setMenuOpen(false)}
                className="nav-text my-3 inline-block bg-ink px-5 py-2.5 text-paper"
              >
                Sign up
              </a>
            </li>
          </ul>
        </div>
      )}
    </header>
  )
}

export default function App() {
  const [selected, setSelected] = useState(10)
  const photo = PHOTOS[selected]

  return (
    <div className="app-shell flex w-full flex-col max-lg:h-dvh">
      <Nav activeImage={PHOTOS[selected].src} />

      <main className="flex w-full flex-col items-start max-lg:min-h-0 max-lg:flex-1 lg:flex-row lg:gap-20">
        {/* Desktop thumbnail grid */}
        <section className="hidden shrink-0 bg-paper py-6 pl-10 pr-4 lg:block">
          <ul className="grid grid-cols-3 gap-x-10 gap-y-10">
            {PHOTOS.map((p, i) => (
              <li key={p.src}>
                <ThumbButton
                  src={p.src}
                  alt={p.alt}
                  isSelected={i === selected}
                  onSelect={() => setSelected(i)}
                />
              </li>
            ))}
          </ul>
        </section>

        {/* Desktop preview */}
        <section className="dotted-panel hidden w-full flex-1 items-start justify-start self-stretch py-6 pl-[99px] pr-6 lg:flex">
          <img
            key={photo.src}
            src={photo.src}
            alt={photo.alt}
            className="preview-in preview-image"
            draggable={false}
          />
        </section>

        {/* Mobile: Apple Photos style gallery */}
        <MobileGallery photos={PHOTOS} selected={selected} onSelect={setSelected} />
      </main>
    </div>
  )
}

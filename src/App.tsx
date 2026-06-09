import { useState } from 'react'
import { CornerBorder } from './components/CornerBorder'
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
  return (
    <header className="border-b-2 border-dashed border-ink/20 bg-paper">
      <nav className="flex items-center justify-between px-6 py-4 sm:px-8">
        <ul className="flex items-center gap-7">
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

        <div className="flex items-center gap-3">
          <a
            href="#"
            className="nav-text group relative bg-panel px-5 py-2.5 transition-colors hover:bg-ink/10"
          >
            Login
            <CornerBorder />
          </a>
          <MorphSignUpButton activeImage={activeImage} />
        </div>
      </nav>
    </header>
  )
}

export default function App() {
  const [selected, setSelected] = useState(10)
  const photo = PHOTOS[selected]

  return (
    <div className="flex w-full flex-col">
      <Nav activeImage={PHOTOS[selected].src} />

      <main className="flex w-full flex-col items-start md:flex-row">
        {/* Thumbnail grid */}
        <section className="shrink-0 bg-paper px-6 py-6">
          <ul className="grid grid-cols-3 gap-x-8 gap-y-6">
            {PHOTOS.map((p, i) => {
              const isSelected = i === selected
              return (
                <li key={p.src}>
                  <ThumbButton
                    src={p.src}
                    alt={p.alt}
                    isSelected={isSelected}
                    onSelect={() => setSelected(i)}
                  />
                </li>
              )
            })}
          </ul>
        </section>

        {/* Preview pane */}
        <section className="dotted-panel flex w-full flex-1 items-start justify-start self-stretch py-6 pl-[99px] pr-6">
          <img
            key={photo.src}
            src={photo.src}
            alt={photo.alt}
            className="preview-in preview-image"
          />
        </section>
      </main>
    </div>
  )
}

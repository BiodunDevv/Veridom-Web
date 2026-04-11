"use client"

import * as React from "react"
import Image from "next/image"

type ShowcaseItem = {
  src: string
  alt: string
}

type AuthShowcaseProps = {
  title: string
  description: string
}

const IMAGE_POOL: ShowcaseItem[] = [
  {
    src: "https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=1600&q=80",
    alt: "Modern property exterior with a bright architectural facade",
  },
  {
    src: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1600&q=80",
    alt: "Contemporary luxury house with strong residential lines",
  },
  {
    src: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1600&q=80",
    alt: "Professionally staged apartment interior with natural daylight",
  },
  {
    src: "https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=1600&q=80",
    alt: "Premium kitchen interior inside a modern residential property",
  },
  {
    src: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1600&q=80",
    alt: "Elegant living room in a refined modern home",
  },
  {
    src: "https://images.unsplash.com/photo-1460317442991-0ec209397118?auto=format&fit=crop&w=1600&q=80",
    alt: "Luxury home exterior with landscaped surroundings",
  },
  {
    src: "https://images.unsplash.com/photo-1448630360428-65456885c650?auto=format&fit=crop&w=1600&q=80",
    alt: "Residential apartment building photographed in clear daylight",
  },
]

const shuffle = <T,>(items: T[]) => {
  const copy = [...items]

  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1))
    ;[copy[index], copy[swapIndex]] = [copy[swapIndex], copy[index]]
  }

  return copy
}

export function AuthShowcase({
  title,
  description,
}: AuthShowcaseProps) {
  const [slides, setSlides] = React.useState<ShowcaseItem[]>(
    IMAGE_POOL.slice(0, 5),
  )
  const [activeIndex, setActiveIndex] = React.useState(0)

  React.useEffect(() => {
    setSlides(shuffle(IMAGE_POOL).slice(0, 5))
  }, [])

  React.useEffect(() => {
    const intervalId = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % slides.length)
    }, 5000)

    return () => {
      window.clearInterval(intervalId)
    }
  }, [slides.length])

  return (
    <>
      {slides.map((slide, index) => (
        <Image
          key={slide.src}
          src={slide.src}
          alt={slide.alt}
          fill
          priority={index === 0}
          className={[
            "absolute inset-0 h-full w-full object-cover transition-opacity duration-700",
            index === activeIndex ? "opacity-100" : "opacity-0",
            "dark:brightness-[0.55] dark:grayscale-[0.08]",
          ].join(" ")}
        />
      ))}
      <div className="absolute inset-0 bg-gradient-to-t from-black/62 via-black/10 to-transparent dark:from-black/72 dark:via-black/18 dark:to-black/8" />
      <div className="absolute right-0 bottom-0 left-0 p-8 text-white">
        <h2 className="mb-2 text-2xl font-semibold">{title}</h2>
        <p className="text-sm opacity-90">{description}</p>
      </div>
    </>
  )
}

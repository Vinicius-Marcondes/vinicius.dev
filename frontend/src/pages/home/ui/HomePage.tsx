import { useEffect, useState } from 'react'
import { useLoaderData } from 'react-router-dom'
import { StatusStrip } from '../../../widgets/status-strip'
import { Container } from '../../../shared/ui'
import type { HomeLoaderData } from '../route'
import { ChannelChangeOverlay } from './ChannelChangeOverlay'

const attractPrompts = [
  'press [ any key ] to enter',
  'insert coin to continue',
  'select a channel above',
] as const

export function HomePage() {
  const { statusEntries } = useLoaderData() as HomeLoaderData
  const [attractIndex, setAttractIndex] = useState(0)
  const [isChannelChangeOpen, setIsChannelChangeOpen] = useState(false)

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setAttractIndex((current) => (current + 1) % attractPrompts.length)
    }, 2200)

    return () => window.clearInterval(intervalId)
  }, [])

  return (
    <>
      <Container className="home-page">
        <section className="home-hero fx-vignette">
          <div className="home-hero__sky" aria-hidden="true" />
          <div className="home-hero__horizon" aria-hidden="true" />
          <div className="home-hero__grid" aria-hidden="true" />
          <div className="home-hero__ticks" aria-hidden="true">
            <span className="home-hero__tick home-hero__tick--tl" />
            <span className="home-hero__tick home-hero__tick--tr" />
            <span className="home-hero__tick home-hero__tick--bl" />
            <span className="home-hero__tick home-hero__tick--br" />
          </div>
          <div className="home-hero__inner">
            <p className="home-hero__caption">transmitting from sao paulo // ch.03</p>
            <h1 className="home-hero__title">
              <button
                type="button"
                className="home-hero__wordmark fx-crt-title glitch-hover"
                onClick={() => setIsChannelChangeOpen(true)}
              >
                vinicius
                <span className="home-hero__wordmark-dot">.</span>
                <span className="home-hero__wordmark-dev">dev</span>
              </button>
            </h1>
            <p className="home-hero__tagline">
              engineer
              <span className="home-hero__tag-separator">·</span>
              photographer
              <span className="home-hero__tag-separator home-hero__tag-separator--cyan">·</span>
              operator of late-night signals
              <span className="cursor" />
            </p>
            <p className="home-hero__prompt" key={attractPrompts[attractIndex]}>
              {attractPrompts[attractIndex]}
            </p>
          </div>
          <StatusStrip className="home-hero__status" entries={statusEntries} />
        </section>
      </Container>
      <ChannelChangeOverlay
        key={isChannelChangeOpen ? 'open' : 'closed'}
        open={isChannelChangeOpen}
        onClose={() => setIsChannelChangeOpen(false)}
      />
    </>
  )
}

import { render, screen } from '@testing-library/react'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'
import { describe, expect, it } from 'vitest'

import { HomePage } from './HomePage'

describe('home page', () => {
  it('renders loader-provided status entries and route cues', async () => {
    const router = createMemoryRouter(
      [
        {
          path: '/',
          loader: () => ({
            statusEntries: [
              {
                accent: 'pink',
                label: 'current focus',
                value: 'cluster 3',
              },
              {
                label: 'location',
                value: 'sao paulo',
              },
            ],
          }),
          element: <HomePage />,
        },
      ],
      {
        initialEntries: ['/'],
      },
    )

    render(<RouterProvider router={router} />)

    expect(await screen.findByText('cluster 3')).toBeInTheDocument()

    const photosLink = screen.getByRole('link', { name: /photos/i })
    const projectsLink = screen.getByRole('link', { name: /projects/i })
    const thoughtsLink = screen.getByRole('link', { name: /thoughts/i })
    const chatLink = screen.getByRole('link', { name: /chat room/i })

    expect(photosLink).toHaveAttribute('href', '/photos')
    expect(projectsLink).toHaveAttribute('href', '/projects')
    expect(thoughtsLink).toHaveAttribute('href', '/thoughts')
    expect(chatLink).toHaveAttribute('href', '/chat')
  })
})

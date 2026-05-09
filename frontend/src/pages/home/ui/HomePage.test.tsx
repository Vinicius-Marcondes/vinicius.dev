import { render, screen } from '@testing-library/react'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'
import { describe, expect, it } from 'vitest'

import { HomePage } from './HomePage'

describe('home page', () => {
  it('renders loader-provided status entries', async () => {
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

    expect(screen.queryByRole('link', { name: /photos/i })).toBeNull()
  })
})

import type { RouteObject } from 'react-router-dom'
import { PublicShell } from '../public-shell'
import { HomePage } from '../../pages/home'
import { ThoughtsFeedPage } from '../../pages/thoughts/feed'
import { ProjectsCatalogPage } from '../../pages/projects/catalog'
import { PhotosGalleryPage } from '../../pages/photos/gallery'
import { ChatRoomPage } from '../../pages/chat/room'

export const publicRoutes: RouteObject = {
  path: '/',
  element: <PublicShell />,
  children: [
    { index: true, element: <HomePage /> },
    { path: 'thoughts', element: <ThoughtsFeedPage /> },
    { path: 'projects', element: <ProjectsCatalogPage /> },
    { path: 'photos', element: <PhotosGalleryPage /> },
    { path: 'chat', element: <ChatRoomPage /> },
  ],
}

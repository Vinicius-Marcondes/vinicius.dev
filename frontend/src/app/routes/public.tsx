import type { RouteObject } from 'react-router-dom'
import { PublicShell } from '../public-shell'
import { HomePage, homeLoader } from '../../pages/home'
import { ThoughtsFeedPage } from '../../pages/thoughts/feed'
import { ProjectsCatalogPage } from '../../pages/projects/catalog'
import { PhotosGalleryPage, photosGalleryLoader } from '../../pages/photos/gallery'
import { ChatRoomPage } from '../../pages/chat/room'

export const publicRoutes: RouteObject = {
  path: '/',
  element: <PublicShell />,
  children: [
    { index: true, loader: homeLoader, element: <HomePage /> },
    { path: 'thoughts', element: <ThoughtsFeedPage /> },
    { path: 'projects', element: <ProjectsCatalogPage /> },
    { path: 'photos', loader: photosGalleryLoader, element: <PhotosGalleryPage /> },
    { path: 'chat', element: <ChatRoomPage /> },
  ],
}

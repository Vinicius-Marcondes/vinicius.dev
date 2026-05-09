type NavigationItem = {
  detail?: string
  label: string
  to: string
}

type SocialItem = {
  href: string
  label: string
}

export const publicNavigation: readonly NavigationItem[] = [
  { label: 'photos', to: '/photos' },
  { label: 'projects', to: '/projects' },
  { label: 'thoughts', to: '/thoughts' },
  { detail: 'auth', label: 'chat room', to: '/chat' },
] as const

export const footerNavigation: readonly NavigationItem[] = [...publicNavigation]

export const socialNavigation: readonly SocialItem[] = [
  { href: 'https://instagram.com', label: 'instagram' },
  { href: 'https://x.com', label: 'x.com' },
  { href: 'https://github.com/Vinicius-Marcondes', label: 'github' },
  { href: 'https://linkedin.com', label: 'linkedin' },
  { href: 'https://reddit.com', label: 'reddit' },
] as const

export const nowPlayingItems = [
  '► now playing // home route status strip online',
  'runtime 00:24:11',
  'sao paulo // gmt-3 // late shift',
  'projects, photos, thoughts, and chat room',
  'vinicius.dev // channel 03',
] as const

export const adminNavigation = [
  { label: 'Dashboard', to: '/admin/dashboard' },
  { label: 'Photos', to: '/admin/photos' },
] as const

type NavigationItem = {
  detail?: string
  label: string
  to: string
}

type SocialItem = {
  href: string
  icon: string
  label: string
}

export const publicNavigation: readonly NavigationItem[] = [
  { label: 'Photos', to: '/photos' },
  { label: 'Projects', to: '/projects' },
  { label: 'Thoughts', to: '/thoughts' },
  { detail: 'auth', label: 'Chat Room', to: '/chat' },
] as const

export const footerNavigation: readonly NavigationItem[] = [
  { label: 'Photos', to: '/photos' },
  { label: 'Projects', to: '/projects' },
  { label: 'Thoughts', to: '/thoughts' },
  { detail: 'auth', label: 'Chat Room', to: '/chat' },
] as const

export const socialNavigation: readonly SocialItem[] = [
  { href: 'https://instagram.com', icon: 'IG', label: 'Instagram' },
  { href: 'https://x.com', icon: 'X', label: 'X.com' },
  { href: 'https://github.com/Vinicius-Marcondes', icon: 'GH', label: 'GitHub' },
  { href: 'https://linkedin.com', icon: 'IN', label: 'LinkedIn' },
  { href: 'https://reddit.com', icon: 'RD', label: 'Reddit' },
] as const

export const adminNavigation = [
  { label: 'Dashboard', to: '/admin/dashboard' },
  { label: 'Login', to: '/admin/login' },
] as const

import type { PhotoRecord } from '../model/types'
import { toPhotoRecord } from './mappers'

export const photoCamera = 'Canon T7+'

export const photoFixtures: PhotoRecord[] = [
  toPhotoRecord({ id: 'p-2026-014', frame: '014', date: '2026-03-22', title: 'paulista at 02:14', location: 'Sao Paulo', tone: 'sunset', tags: ['night', 'street'] }),
  toPhotoRecord({ id: 'p-2026-013', frame: '013', date: '2026-03-18', title: 'arcade exit', location: 'Sao Paulo', tone: 'cyan', tags: ['night', 'arcade'] }),
  toPhotoRecord({ id: 'p-2026-012', frame: '012', date: '2026-03-11', title: 'pool hall, mirror', location: 'Sao Paulo', tone: 'amber', tags: ['interior'] }),
  toPhotoRecord({ id: 'p-2026-011', frame: '011', date: '2026-02-28', title: 'empty lot / sodium', location: 'Sao Paulo', tone: 'amber', tags: ['night', 'urban'] }),
  toPhotoRecord({ id: 'p-2026-010', frame: '010', date: '2026-02-14', title: 'green line, last train', location: 'Sao Paulo', tone: 'violet', tags: ['transit'] }),
  toPhotoRecord({ id: 'p-2026-009', frame: '009', date: '2026-01-30', title: 'orange sky over tiete', location: 'Sao Paulo', tone: 'sunset', tags: ['sky'] }),
  toPhotoRecord({ id: 'p-2025-028', frame: '028', date: '2025-11-12', title: 'shinjuku / crossing', location: 'Tokyo', tone: 'cyan', tags: ['night', 'crowd'] }),
  toPhotoRecord({ id: 'p-2025-027', frame: '027', date: '2025-11-10', title: 'golden gai, side door', location: 'Tokyo', tone: 'amber', tags: ['night', 'alley'] }),
  toPhotoRecord({ id: 'p-2025-026', frame: '026', date: '2025-11-08', title: 'pachinko halo', location: 'Tokyo', tone: 'sunset', tags: ['neon'] }),
  toPhotoRecord({ id: 'p-2025-025', frame: '025', date: '2025-11-07', title: 'shibuya rain', location: 'Tokyo', tone: 'cyan', tags: ['rain', 'night'] }),
  toPhotoRecord({ id: 'p-2025-024', frame: '024', date: '2025-11-05', title: 'family mart / 03:40', location: 'Tokyo', tone: 'mono', tags: ['interior'] }),
  toPhotoRecord({ id: 'p-2025-023', frame: '023', date: '2025-11-04', title: 'vending-machine row', location: 'Tokyo', tone: 'amber', tags: ['color'] }),
  toPhotoRecord({ id: 'p-2024-018', frame: '018', date: '2024-09-22', title: 'chiado slope', location: 'Lisbon', tone: 'mono', tags: ['bw', 'street'] }),
  toPhotoRecord({ id: 'p-2024-017', frame: '017', date: '2024-09-21', title: 'graca rooftops', location: 'Lisbon', tone: 'mono', tags: ['bw', 'sky'] }),
  toPhotoRecord({ id: 'p-2024-016', frame: '016', date: '2024-09-20', title: 'tram 28 / window seat', location: 'Lisbon', tone: 'mono', tags: ['bw', 'transit'] }),
  toPhotoRecord({ id: 'p-2024-015', frame: '015', date: '2024-09-19', title: 'alfama cat', location: 'Lisbon', tone: 'mono', tags: ['bw', 'cat'] }),
  toPhotoRecord({ id: 'p-2024-011', frame: '011', date: '2024-06-14', title: 'ferry wake', location: 'Ilha Grande', tone: 'cyan', tags: ['water'] }),
  toPhotoRecord({ id: 'p-2024-010', frame: '010', date: '2024-06-13', title: 'red roof / abraao', location: 'Ilha Grande', tone: 'sunset', tags: ['architecture'] }),
  toPhotoRecord({ id: 'p-2024-009', frame: '009', date: '2024-06-12', title: 'green palm / noon', location: 'Ilha Grande', tone: 'amber', tags: ['nature'] }),
  toPhotoRecord({ id: 'p-2024-008', frame: '008', date: '2024-06-11', title: 'storm rolling in', location: 'Ilha Grande', tone: 'violet', tags: ['sky', 'storm'] }),
  toPhotoRecord({ id: 'p-2026-005', frame: '005', date: '2026-01-08', title: 'airport benches', location: 'Roaming', tone: 'mono', tags: ['transit'] }),
  toPhotoRecord({ id: 'p-2026-004', frame: '004', date: '2026-01-07', title: 'lobby clock / 04:58', location: 'Roaming', tone: 'amber', tags: ['interior'] }),
  toPhotoRecord({ id: 'p-2026-003', frame: '003', date: '2026-01-06', title: 'cab window, highway', location: 'Roaming', tone: 'violet', tags: ['motion'] }),
  toPhotoRecord({ id: 'p-2026-002', frame: '002', date: '2026-01-05', title: 'hotel sign, burned out', location: 'Roaming', tone: 'sunset', tags: ['neon'] }),
]

export function allPhotoYears(photos: PhotoRecord[]) {
  return Array.from(new Set(photos.map((photo) => photo.date.slice(0, 4)))).sort().reverse()
}

export function allPhotoLocations(photos: PhotoRecord[]) {
  return Array.from(new Set(photos.map((photo) => photo.location))).sort()
}

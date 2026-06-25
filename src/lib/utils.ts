import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPrice(price: number | string | null | undefined): string {
  if (price === null || price === undefined) return '0 RSD'
  const num = typeof price === 'string' ? parseFloat(price) : price
  return new Intl.NumberFormat('sr-RS', {
    style: 'decimal',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(num) + ' RSD'
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[čć]/g, 'c')
    .replace(/[šš]/g, 's')
    .replace(/[žž]/g, 'z')
    .replace(/[đ]/g, 'd')
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function generateOrderNumber(): string {
  const date = new Date()
  const year = date.getFullYear().toString().slice(2)
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0')
  return `MS${year}${month}${day}-${random}`
}

export const ORDER_STATUS_LABELS: Record<string, string> = {
  ORDERED: 'Naručeno',
  CONFIRMED: 'Potvrđeno',
  PURCHASED: 'Kupljeno',
  IN_TRANSIT: 'U tranzitu',
  ARRIVED: 'Stiglo',
  DELIVERED: 'Predato',
}

export const ORDER_STATUS_COLORS: Record<string, string> = {
  ORDERED: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  CONFIRMED: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  PURCHASED: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  IN_TRANSIT: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  ARRIVED: 'bg-green-500/20 text-green-400 border-green-500/30',
  DELIVERED: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
}

export const STOCK_STATUS_LABELS: Record<string, string> = {
  IN_STOCK: 'Na stanju',
  OUT_OF_STOCK: 'Nema na stanju',
  LOW_STOCK: 'Malo na stanju',
  PREORDER: 'Prednarudžbina',
}

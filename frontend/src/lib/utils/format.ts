const money = new Intl.NumberFormat('en-BD', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

/** "1590.00" -> "৳1,590.00" */
export function formatMoney(value: string | number | null | undefined): string {
  const amount = Number(value ?? 0)
  return `৳${money.format(Number.isFinite(amount) ? amount : 0)}`
}

export function formatDate(iso: string | null | undefined): string {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}

export function useCurrency() {
  function fmt(n: number | null | undefined): string {
    if (n == null) return '₱0'
    return '₱' + n.toLocaleString('en-PH', { minimumFractionDigits: 0, maximumFractionDigits: 0 })
  }
  return { fmt }
}

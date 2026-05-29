export default function formatDateToBangkok(date: Date): string {
  return (
    date.toLocaleString('en-US', { timeZone: 'Asia/Bangkok' }) +
    " GMT+0700('Asia/Bangkok')"
  )
}

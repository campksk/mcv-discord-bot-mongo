export default interface LoadMoreAssignmentsResponse {
  status: number
  data: {
    html: string
  }
  next: number
  loadmoremsg?: string
  all?: boolean
}

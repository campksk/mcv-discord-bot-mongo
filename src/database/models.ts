import mongoose, { Schema, Document } from 'mongoose'

// ── Course ────────────────────────────────────────────────────────────────────
export interface ICourse extends Document {
  mcvID: number
  courseID: string
  title: string
  year: number
  semester: number
}

const courseSchema = new Schema<ICourse>({
  mcvID: { type: Number, required: true, unique: true },
  courseID: { type: String, required: true },
  title: { type: String, required: true },
  year: { type: Number, required: true },
  semester: { type: Number, required: true },
})

export const CourseModel = mongoose.model<ICourse>('Course', courseSchema)

// ── Assignment ────────────────────────────────────────────────────────────────
export interface IAssignment extends Document {
  mcvCourseID: number
  assignmentName: string
  assignmentID: number
}

const assignmentSchema = new Schema<IAssignment>({
  mcvCourseID: { type: Number, required: true },
  assignmentName: { type: String, required: true },
  assignmentID: { type: Number, required: true },
})

// Composite unique index: same pair (mcvCourseID, assignmentID) cannot repeat
assignmentSchema.index({ mcvCourseID: 1, assignmentID: 1 }, { unique: true })

export const AssignmentModel = mongoose.model<IAssignment>(
  'Assignment',
  assignmentSchema
)

// ── NotificationChannel ───────────────────────────────────────────────────────
export interface INotificationChannel extends Document {
  guildID: string
  channelID: string
}

const notificationChannelSchema = new Schema<INotificationChannel>({
  guildID: { type: String, required: true, unique: true },
  channelID: { type: String, required: true },
})

export const NotificationChannelModel = mongoose.model<INotificationChannel>(
  'NotificationChannel',
  notificationChannelSchema
)

import mongoose from 'mongoose'
import env from '../env/env'

let isConnected = false

export async function connectDB(): Promise<void> {
  if (isConnected) return

  await mongoose.connect(env.MONGODB_URL, {
    serverSelectionTimeoutMS: 10000,
  })

  isConnected = true
  console.log('Connected to MongoDB')
}

export default mongoose

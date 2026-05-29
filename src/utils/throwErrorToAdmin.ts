import { adminDM, intervalId } from '../server'

export async function throwErrorToAdmin(msg: string): Promise<void> {
  await adminDM.send(msg)
  clearInterval(intervalId.value)
}

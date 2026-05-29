import { NotifyMessage } from '../config/config'
import env from '../env/env'
import { adminDM } from '../server'

export default async function errorFetchingNotify(
  notifyMessage: NotifyMessage
): Promise<void> {
  if (env.ERROR_FETCHING_NOTIFICATION) {
    await adminDM.send(notifyMessage)
  }
}

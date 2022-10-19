import admin from 'firebase-admin'

const leaseTime = 60 * 1000 // 60s

export default function (eventId: string) {
  const db = admin.firestore()
  const ref = db.collection('leases').doc(eventId)

  return {
    shouldRun: async () => {
      return db.runTransaction(async transaction => {
        const snap = await transaction.get(ref)
        const data = snap.data()

        if (data?.doneAt) {
          return false
        }

        const expiresAt =
          data && (data.expiresAt as admin.firestore.Timestamp)
        if (expiresAt && Date.now() < expiresAt.toMillis()) {
          return Promise.reject('Lease already taken, try later.')
        }

        transaction.set(ref, {
          expiresAt: new Date(Date.now() + leaseTime)
        })
        return true
      })
    },
    markDone: async () => {
      await ref.set({ doneAt: new Date() })
    }
  }
}

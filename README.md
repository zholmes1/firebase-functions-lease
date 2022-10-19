Leasing system to prevent Firebase Functions from ever executing more than once.

Example Usage:

```
export const someFunction = functions.firestore
  .document('someCollection/{id}')
  .onCreate(async (snap, context) => {
    const lease = await createLease(context.eventId)
    if (await lease.shouldRun()) {
      // do some stuff
      await lease.markDone()
    }
  })
```

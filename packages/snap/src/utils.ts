export async function getPrivateKey() {
  return await snap.request({
    method: 'snap_getEntropy',

    // The salt must remain the same for the same entropy to be derived.
    params: { version: 1 },
  });
}

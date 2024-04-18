/**
 * @description function to get the private key of the wallet
 * @returns Promise<`0x${string}`>
 */
export async function getPrivateKey() {
  return await snap.request({
    method: 'snap_getEntropy',

    // The salt must remain the same for the same entropy to be derived.
    params: { version: 1 },
  });
}

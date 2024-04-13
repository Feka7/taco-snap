import { panel, heading, button, form, input } from '@metamask/snaps-sdk';

export async function createMenuInterface(): Promise<string> {
  return await snap.request({
    method: 'snap_createInterface',
    params: {
      ui: panel([
        heading('Taco snap'),
        button({ value: 'store', name: 'store-seed' }),
        button({ value: 'verify', name: 'verify' }),
      ]),
    },
  });
}

export async function createStoreInterface(id: string) {
  await snap.request({
    method: 'snap_updateInterface',
    params: {
      id,
      ui: form({
        name: 'Store your seed',
        children: [
          input({
            name: 'Successor Address',
            placeholder: '0x5ad3dA888e9B2eB509bcE5E109112ec26d559B6b',
          }),
          input({
            name: 'Message',
            placeholder: 'my seed',
          }),
          button({
            value: 'Submit',
            buttonType: 'submit',
          }),
        ],
      }),
    },
  });
}

export async function createVerifyInterface(id: string) {
  return await snap.request({
    method: 'snap_updateInterface',
    params: {
      id,
      ui: form({
        name: 're-store your message',
        children: [
          input({
            name: 'Restore key',
            placeholder: 'my seed',
          }),
          button({
            value: 'Verify',
            buttonType: 'submit',
          }),
        ],
      }),
    },
  });
}

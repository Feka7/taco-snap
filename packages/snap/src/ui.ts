import {
  panel,
  heading,
  button,
  form,
  input,
  text,
  copyable,
} from '@metamask/snaps-sdk';

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
        name: 'store-form',
        children: [
          input({
            name: 'successor-address',
            placeholder: '0x5ad3dA888e9B2eB509bcE5E109112ec26d559B6b',
          }),
          input({
            name: 'message',
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
        name: 're-store',
        children: [
          input({
            name: 'restore-key',
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

export async function showVefiryResult(id: string, value: string) {
  await snap.request({
    method: 'snap_updateInterface',
    params: {
      id,
      ui: panel([
        heading('Interactive UI Example Snap'),
        text('The submitted value is:'),
        copyable(value),
      ]),
    },
  });
}

export async function showStoreResult(id: string, value: string) {
  await snap.request({
    method: 'snap_updateInterface',
    params: {
      id,
      ui: panel([
        heading('Stored key to share'),
        text('This is the store key to share with your successor:'),
        copyable(value),
      ]),
    },
  });
}

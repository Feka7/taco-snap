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
        heading('🌮 Welcolme in Taco snap! 🌮 '),
        text(
          'Taco snap, is your secret manager. It allow you to store a message and share the key, or to import a message with a key. You can find more informations on [Taco Docs](https://docs.threshold.network/applications/threshold-access-control).',
        ),
        button({ value: 'Store Message', name: 'store-message' }),
        button({ value: 'Import Message', name: 'import-message' }),
        //button({ value: 'Error Message', name: 'error-message' }),
      ]),
    },
  });
}

export async function createStoreInterface(id: string) {
  await snap.request({
    method: 'snap_updateInterface',
    params: {
      id,
      ui: panel([
        heading('🔒 Store a secret message 🔒'),
        text(
          'Store a private massage that you what to share only with someone else identify by the following address.\n You can share also your seed!',
        ),
        form({
          name: 'store-form',
          children: [
            input({
              label: 'Address',
              name: 'successor-address',
              placeholder: 'Address 0x5ad11...',
            }),
            input({
              label: 'Label',
              name: 'label',
              placeholder: 'Seed X Mario',
            }),
            input({
              label: 'Message',
              name: 'message',
              placeholder: 'My funny seed',
            }),
            button({
              value: 'Submit & Store',
              buttonType: 'submit',
            }),
          ],
        }),
      ]),
    },
  });
}

export async function createVerifyInterface(id: string) {
  return await snap.request({
    method: 'snap_updateInterface',
    params: {
      id,
      ui: panel([
        heading('🔓 Restore a message 🔓'),
        text(
          'Get a secret massage by using the message key you got. If the condition of the creator is satisfied you will get the message.',
        ),
        form({
          name: 're-store',
          children: [
            input({
              label: 'Message Key',
              name: 'restore-key',
              placeholder: 'eqhrqee1whsjans....',
            }),
            button({
              value: 'Verify',
              buttonType: 'submit',
            }),
          ],
        }),
      ]),
    },
  });
}

export async function showVefiryResult(id: string, value: string) {
  await snap.request({
    method: 'snap_updateInterface',
    params: {
      id,
      ui: panel([
        heading('🔒 Success Import! 🌮'),
        text('This is the secret message that was stored. Enjoy!'),
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
        heading('🔒 Success Store! 🌮'),
        text(
          'Your massage was save correclty. This is the store key to share with your successor:',
        ),
        copyable(value),
      ]),
    },
  });
}

export async function showErrorResult(id: string, errorMessage: string) {
  await snap.request({
    method: 'snap_updateInterface',
    params: {
      id,
      ui: panel([
        heading('❌ Oops, Something went wrong! ❌'),
        text('An error happened. The error message log is:'),
        copyable(errorMessage),
      ]),
    },
  });
}

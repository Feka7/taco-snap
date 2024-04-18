import {
  panel,
  heading,
  button,
  form,
  input,
  text,
  copyable,
} from '@metamask/snaps-sdk';

/**
 * @description createMenuInterface return the first manu interface
 * @returns Promise<string>
 */
export async function createMenuInterface(): Promise<string> {
  return await snap.request({
    method: 'snap_createInterface',
    params: {
      ui: panel([
        heading('🌮 Welcolme in TACo Snap! 🌮 '),
        text(
          'TACo Snap, is your secret manager. It allow you to store a message and share the key, or to import a message with a key. You can find more informations on [TACo Docs](https://docs.threshold.network/applications/threshold-access-control).',
        ),
        button({ value: 'Store Message', name: 'store-message' }),
        button({ value: 'Decrypt Message', name: 'import-message' }),
        button({ value: 'Show Messages', name: 'show-messages' }),
        // button({ value: 'Error Message', name: 'error-message' }),
      ]),
    },
  });
}

/**
 * @description generate the UI interface to store the message
 * @param id - the interface ID
 */
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

/**
 * @description generate the UI interface to verify the message
 * @param id - the interface ID
 */
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

/**
 * @description generate UI interface to show the stored message resolved
 * @param id - the interface ID
 * @param value - the decrypted result
 */
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

/**
 * @description generate UI interface to show the stored message access key result
 * @param id - the interface ID
 * @param value - the encrypted result key
 */
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

/**
 * @description generate UI interface to show an error status
 * @param id - the interface ID
 * @param errorMessage - the error message to display
 */
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

/**
 *
 * @param id
 */
export async function showMessagesResult(id: string) {
  const persistedData = await snap.request({
    method: 'snap_manageState',
    params: { operation: 'get' },
  });
  // Prepare the data for display

  const tmp_arr: any = [];
  Object.keys(persistedData ?? {}).map((key) => {
    tmp_arr.push(text(key));
    tmp_arr.push(copyable(persistedData ? persistedData[key]?.toString() : ''));
  });
  tmp_arr.push(button({ value: 'Clean', name: 'clean-messages' }));
  await snap.request({
    method: 'snap_updateInterface',
    params: {
      id,
      ui: panel(tmp_arr),
    },
  });
}

/**
 *
 * @param id
 */
export async function cleanMessages(id: string) {
  await snap.request({
    method: 'snap_manageState',
    params: {
      operation: 'clear',
    },
  });
}

import type {
  OnHomePageHandler,
  OnUserInputHandler,
} from '@metamask/snaps-sdk';
import { UserInputEventType } from '@metamask/snaps-sdk';
import detectEthereumProvider from '@metamask/detect-provider';

import {
  createMenuInterface,
  createStoreInterface,
  createVerifyInterface,
  showStoreResult,
  showVefiryResult,
} from './ui';

import {
  conditions,
  decrypt,
  domains,
  encrypt,
  getPorterUri,
  initialize,
  ThresholdMessageKit,
} from '@nucypher/taco';

export const onHomePage: OnHomePageHandler = async () => {
  const interfaceId = await createMenuInterface();
  return { id: interfaceId };
};

export const onUserInput: OnUserInputHandler = async ({ id, event }) => {
  if (event.type === UserInputEventType.ButtonClickEvent) {
    switch (event.name) {
      case 'store-seed':
        await createStoreInterface(id);

        break;

      case 'verify':
        await createVerifyInterface(id);
        break;

      // case 'go-back':
      //   await snap.request({
      //     method: 'snap_updateInterface',
      //     params: {
      //       id,
      //       ui: await getInsightContent(),
      //     },
      //   });
      //   break;

      default:
        break;
    }
  }
  /** Handle Store */
  if (
    event.type === UserInputEventType.FormSubmitEvent &&
    event.name === 'store-form'
  ) {
    const successorInputValue = event.value['successor-address'];
    const messageInputValue = event.value['message'];
    const result = successorInputValue?.concat(messageInputValue ?? '');

    // This resolves to the value of window.ethereum or null.
    const provider = await detectEthereumProvider();
   

    if (provider && provider.isMetaMask) {
      console.log('MetaMask Flask successfully detected!');
      // Now you can use Snaps!
      await showStoreResult(id, "meta");
    } else {
      console.error('Please install MetaMask Flask!');
      await showStoreResult(id, "flask");
    }
    const rpcCondition = new conditions.base.rpc.RpcCondition({
      chain: 80002,
      method: 'eth_getBalance',
      parameters: [':userAddress'],
      returnValueTest: {
        comparator: '<',
        value: 1,
      },
    });
  }
  /** Handle restore */
  if (
    event.type === UserInputEventType.FormSubmitEvent &&
    event.name === 're-store'
  ) {
    const inputValue = event.value['restore-key'];
    await showVefiryResult(id, inputValue ?? '');
  }
};

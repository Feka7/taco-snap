import type {
  OnHomePageHandler,
  OnUserInputHandler,
  SnapsEthereumProvider,
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
import { ethers } from 'ethers';

export const onHomePage: OnHomePageHandler = async () => {
  // await initialize(
  //   new URL(
  //     'https://github.com/Feka7/taco-snap/blob/main/wasm/nucypher_core_wasm_bg.wasm',
  //   ),
  // );
  await initialize();
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
    const maybeProvider: SnapsEthereumProvider = ethereum;

    const web3Provider = new ethers.providers.Web3Provider(ethereum);
    //const blockId = web3Provider.blockNumber;

    if (!web3Provider) {
      await showStoreResult(id, result ?? '');
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

    const message = 'my secret message';

    const messageKit = await encrypt(
      web3Provider,
      '80002',
      message,
      rpcCondition,
      0,
      web3Provider.getSigner(),
    );
    const encodedCiphertext = Buffer.from(messageKit.toBytes()).toString(
      'base64',
    );

    // Now you can use Snaps!
    await showStoreResult(id, encodedCiphertext);
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

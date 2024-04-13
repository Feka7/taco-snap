import type {
  OnHomePageHandler,
  OnRpcRequestHandler,
  OnSignatureHandler,
  OnUserInputHandler,
  SnapsEthereumProvider,
} from '@metamask/snaps-sdk';
import {
  MethodNotFoundError,
  panel,
  text,
  heading,
  copyable,
  UserInputEventType,
  UserRejectedRequestError,
  row,
  SeverityLevel,
} from '@metamask/snaps-sdk';

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

import type { SignMessageParams } from './types';

import { getPrivateKey } from './utils';

import { ethers, Wallet } from 'ethers';

export const onHomePage: OnHomePageHandler = async () => {
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

    const web3Provider = new ethers.providers.Web3Provider(ethereum);

    if (!web3Provider) {
      await showStoreResult(id, 'error');
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
    const privateKey = await getPrivateKey();
    const wallet = new Wallet(privateKey);

    const messageKit = await encrypt(
      web3Provider,
      'tapir',
      message,
      rpcCondition,
      0,
      wallet,
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
    console.log(
      '🚀 ~ constonUserInput:OnUserInputHandler= ~ inputValue:',
      inputValue,
    );
    const web3Provider = new ethers.providers.Web3Provider(ethereum);
    console.log(
      '🚀 ~ constonUserInput:OnUserInputHandler= ~ web3Provider:',
      web3Provider,
    );

    if (!web3Provider) {
      console.log(
        '🚀 ~ constonUserInput:OnUserInputHandler= ~ web3Provider:',
        web3Provider,
      );
      await showStoreResult(id, 'error');
    }
    const decodedCiphertext = Buffer.from(inputValue ?? '', 'base64');

    const mk = ThresholdMessageKit.fromBytes(decodedCiphertext);

    const decryptedMessage = await decrypt(
      web3Provider,
      'tapir',
      mk,
      getPorterUri('tapir'),
      web3Provider.getSigner(),
    );
    console.log(
      '🚀 ~ constonUserInput:OnUserInputHandler= ~ web3Provider:',
      decryptedMessage,
    );
    const decodedMessage = new TextDecoder().decode(decryptedMessage);
    await showVefiryResult(id, decodedMessage);
  }
};

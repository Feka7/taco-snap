import type {
  OnHomePageHandler,
  OnUserInputHandler,
} from '@metamask/snaps-sdk';
import { UserInputEventType } from '@metamask/snaps-sdk';
import {
  conditions,
  decrypt,
  encrypt,
  getPorterUri,
  initialize,
  ThresholdMessageKit,
} from '@nucypher/taco';
import { ethers, Wallet } from 'ethers';

import {
  cleanMessages,
  createMenuInterface,
  createStoreInterface,
  createVerifyInterface,
  showErrorResult,
  showMessagesResult,
  showStoreResult,
  showVefiryResult,
} from './ui';
import { getPrivateKey } from './utils';

export const onHomePage: OnHomePageHandler = async () => {
  await initialize();
  const interfaceId = await createMenuInterface();
  return { id: interfaceId };
};

export const onUserInput: OnUserInputHandler = async ({ id, event }) => {
  if (event.type === UserInputEventType.ButtonClickEvent) {
    switch (event.name) {
      case 'store-message':
        await createStoreInterface(id);
        break;

      case 'import-message':
        await createVerifyInterface(id);
        break;

      case 'show-messages':
        await showMessagesResult(id);
        break;

      case 'clean-messages':
        await cleanMessages(id);
        await showMessagesResult(id);
        break;

      case 'error-message':
        await showErrorResult(id, 'ops');

      /** Uncomment: To test error interface */
      // case 'error-message':
      //   await showErrorResult(id, 'ops');

      default:
        break;
    }
  }
  /** Handle Store */
  if (
    event.type === UserInputEventType.FormSubmitEvent &&
    event.name === 'store-form'
  ) {
    try {
      const successorInputValue = event.value['successor-address'];
      const messageInputValue = event.value.message;
      const labelInputValue = event.value.label;

      const web3Provider = new ethers.providers.Web3Provider(ethereum);

      if (!web3Provider) {
        throw new Error('C03 - failed to define web3Provider');
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

      const privateKey = await getPrivateKey();
      const wallet = new Wallet(privateKey);

      // const customParameters: Record<
      //   string,
      //   conditions.context.CustomContextParam
      // > = {
      //   ':userAddress': successorInputValue ?? '',
      // };

      // new conditions.context.ConditionContext(
      //   web3Provider,
      //   new Condition(),
      //   customParameters,
      //   wallet,
      // );

      // const equalityCondition =
      //   conditions.ConditionFactory.conditionFromProps(customParameters);

      const messageKit = await encrypt(
        web3Provider,
        'tapir',
        messageInputValue ?? '',
        rpcCondition,
        0,
        wallet,
      );
      const encodedCiphertext = Buffer.from(messageKit.toBytes()).toString(
        'base64',
      );

      const persistedData = await snap.request({
        method: 'snap_manageState',
        params: { operation: 'get' },
      });

      await snap.request({
        method: 'snap_manageState',
        params: {
          operation: 'update',
          newState: {
            ...persistedData,
            [labelInputValue ?? '']: encodedCiphertext,
          },
        },
      });

      console.log(persistedData);

      await showStoreResult(id, encodedCiphertext);
    } catch (error: any) {
      console.error(error);
      await showErrorResult(id, `C02-${error?.message}`);
    }
  }

  /** Handle restore */
  if (
    event.type === UserInputEventType.FormSubmitEvent &&
    event.name === 're-store'
  ) {
    try {
      // const balance = await ethereum.request({
      //   method: 'eth_getBalance',
      // });
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
        throw new Error('C03 - failed to define web3Provider');
      }
      const decodedCiphertext = Buffer.from(inputValue ?? '', 'base64');
      console.log(inputValue);
      const mk = ThresholdMessageKit.fromBytes(decodedCiphertext);
      const privateKey = await getPrivateKey();
      const wallet = new Wallet(privateKey);

      const decryptedMessage = await decrypt(
        web3Provider,
        'tapir',
        mk,
        getPorterUri('tapir'),
        wallet,
      );
      console.log(
        '🚀 ~ constonUserInput:OnUserInputHandler= ~ web3Provider:',
        decryptedMessage,
      );
      const decodedMessage = new TextDecoder().decode(decryptedMessage);
      await showVefiryResult(id, decodedMessage);
    } catch (error: any) {
      console.error(error);
      await showErrorResult(id, `C02-${error?.message}`);
    }
  }
};

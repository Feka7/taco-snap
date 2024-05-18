import type {
  OnHomePageHandler,
  OnRpcRequestHandler,
  OnSignatureHandler,
  OnUserInputHandler,
} from '@metamask/snaps-sdk';
import {
  panel,
  text,
  UserInputEventType,
  heading,
  UserRejectedRequestError,
  copyable,
  SeverityLevel,
  row,
  MethodNotFoundError,
} from '@metamask/snaps-sdk';
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
import { SignMessageParams } from './types';

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
      const hasEqualAddress = new conditions.base.contract.ContractCondition({
        method: 'areAddressesEqual',
        parameters: [successorInputValue, ':userAddress'],
        functionAbi: {
          inputs: [
            {
              internalType: 'address',
              name: 'address1',
              type: 'address',
            },
            {
              internalType: 'address',
              name: 'address2',
              type: 'address',
            },
          ],
          name: 'areAddressesEqual',
          outputs: [
            {
              internalType: 'bool',
              name: '',
              type: 'bool',
            },
          ],
          stateMutability: 'pure',
          type: 'function',
        },
        contractAddress: '0xa4387d7f664B79A60AE38676E636Ed913593cBdF',
        chain: 80002,
        returnValueTest: {
          comparator: '==',
          value: true,
        },
      });

      const privateKey = await getPrivateKey();
      const wallet = new Wallet(privateKey);

      const messageKit = await encrypt(
        web3Provider,
        'tapir',
        messageInputValue ?? '',
        hasEqualAddress,
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
      const decodedMessage = new TextDecoder().decode(decryptedMessage);
      await showVefiryResult(id, decodedMessage);
      //await web3Provider.send('eth_requestAccounts', []);
    } catch (error: any) {
      console.error(error);
      await showErrorResult(id, `C02-${error?.message}`);
    }
  }
};

export const onRpcRequest: OnRpcRequestHandler = async ({ request }) => {
  console.log(
    '🚀 ~ constonRpcRequest:OnRpcRequestHandler= ~ request:',
    request,
  );
  switch (request.method) {
    case 'getAddress': {
      const privateKey = await getPrivateKey();
      const wallet = new Wallet(privateKey);

      return await wallet.getAddress();
    }

    case 'signMessage': {
      const params = request.params as SignMessageParams;
      const privateKey = await getPrivateKey();
      const wallet = new Wallet(privateKey);
      const result = await snap.request({
        method: 'snap_dialog',
        params: {
          type: 'confirmation',
          content: panel([
            heading('Signature request'),
            text('Do you want to sign this message?'),
            copyable(params.message),
          ]),
        },
      });
      if (!result) {
        throw new UserRejectedRequestError();
      }
      return wallet.signMessage(params.message);
    }

    default:
      throw new MethodNotFoundError({ method: request.method });
  }
};

export const onSignature: OnSignatureHandler = async ({ signature }) => {
  const { signatureMethod, from, data } = signature;
  let domain;
  if (
    signatureMethod === 'eth_signTypedData_v3' ||
    signatureMethod === 'eth_signTypedData_v4'
  ) {
    domain = data.domain;
  }

  // const getSignedTypedDataRows = (typeData: Record<string, any>[]) => {
  //   const typeCount = typeData.reduce(
  //     (acc: Record<string, number>, currVal: Record<string, string>) => {
  //       if (acc[currVal.type]) {
  //         acc[currVal.type] += 1;
  //       } else {
  //         acc[currVal.type] = 1;
  //       }
  //       return acc;
  //     },
  //     {},
  //   );
  //   return Object.entries(typeCount).map(([type, count]) =>
  //     row(type, text(`${count}`)),
  //   );
  // };

  switch (signatureMethod) {
    case 'eth_sign':
      return {
        content: panel([
          heading("'About 'eth_sign'"),
          text(
            "eth_sign is one of the oldest signing methods that MetaMask still supports. Back in the early days of MetaMask when it was originally designed, web3 was quite different from the present day. There were fewer standards for signatures, so eth_sign was developed with a fairly simple, open-ended structure.\nThe main thing to note about eth_sign is that it allows the website you're on to request that you sign an arbitrary hash. In this mathematical context, 'arbitrary' means unspecified; your signature could be applied by the requesting dapp to pretty much anything. eth_sign is therefore unsuitable to use with sources that you don't trust.\nAdditionally, the way eth_sign is designed means that the contents of the message you're signing are not human-readable. It's impossible to check up on what you're actually signing, making it particularly dangerous.",
          ),
        ]),
        severity: SeverityLevel.Critical,
      };

    case 'personal_sign':
      return {
        content: panel([row('From:', text(from)), row('Data:', text(data))]),
        severity: SeverityLevel.Critical,
      };

    // case 'eth_signTypedData':
    //   // Show a count of the different types.
    //   return {
    //     content: panel([
    //       heading('Message type count'),
    //       ...getSignedTypedDataRows(data),
    //     ]),
    //     severity: SeverityLevel.Critical,
    //   };

    case 'eth_signTypedData_v3':
      return {
        content: panel([
          heading('Danger!'),
          text(
            `${domain.verifyingContract} has been identified as a malicious verifying contract.`,
          ),
        ]),
        severity: SeverityLevel.Critical,
      };

    case 'eth_signTypedData_v4':
      return {
        content: panel([
          heading('Danger!'),
          text(
            `${domain.verifyingContract} has been identified as a malicious verifying contract.`,
          ),
        ]),
        severity: SeverityLevel.Critical,
      };

    default:
      return null;
  }
};

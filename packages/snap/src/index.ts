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
    await showVefiryResult(id, inputValue ?? '');
  }
};

export const onRpcRequest: OnRpcRequestHandler = async ({ request }) => {
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

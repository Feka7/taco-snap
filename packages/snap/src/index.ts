import type { OnHomePageHandler, OnUserInputHandler } from "@metamask/snaps-sdk";
import { UserInputEventType } from "@metamask/snaps-sdk";
import { createMenuInterface, createStoreInterface, createVerifyInterface } from "./ui";
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

  // if (
  //   event.type === UserInputEventType.FormSubmitEvent &&
  //   event.name === 'example-form'
  // ) {
  //   const inputValue = event.value['example-input'];
  //   await showResult(id, inputValue);
  // }
};

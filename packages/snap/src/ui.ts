import { panel, heading, button } from "@metamask/snaps-sdk";

export async function createInterface(): Promise<string> {
    return await snap.request({
      method: 'snap_createInterface',
      params: {
        ui: panel([
          heading('Interactive UI Example Snap'),
          button({ value: 'Update UI', name: 'update' }),
        ]),
      },
    });
  }
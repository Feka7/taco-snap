import type { OnHomePageHandler } from "@metamask/snaps-sdk";
import { panel, text, heading, button, form, input } from "@metamask/snaps-sdk";
import { createInterface } from "./ui";

// export const onHomePage: OnHomePageHandler = async () => {
//   const interfaceId = await snap.request({
//     method: "snap_createInterface",
//     params: {
//         ui: form({
//             name: "form-to-fill",
//             children: [
//                 input({
//                     name: "user-name",
//                     placeholder: "Your name",
//                 }),
//                 button({
//                     value: "Submit",
//                     buttonType: "submit",
//                 }),
//             ],
//         }),
//     },
//   });
//   await snap.request({
//     method: "snap_dialog",
//     params: {
//         type: "Alert",
//         id: interfaceId,
//     },
// });

// }

export const onHomePage: OnHomePageHandler = async () => {
  const interfaceId = await createInterface();

  return { id: interfaceId };
};


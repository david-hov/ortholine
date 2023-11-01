// import { contextBridge } from "electron";
// const { ipcRenderer } = require('electron');

// Get versions
// @ts-ignore
window.addEventListener('DOMContentLoaded', () => {
  const app = document.getElementById('root');
  const { env } = process;
  const versions: Record<string, unknown> = {};

  // ERWT Package version
  versions['erwt'] = env['npm_package_version'];
  versions['license'] = env['npm_package_license'];

  // Process versions
  for (const type of ['chrome', 'node', 'electron']) {
    versions[type] = process.versions[type];
  }

  // NPM deps versions
  for (const type of ['react']) {
    const v = env['npm_package_dependencies_' + type];
    if (v) versions[type] = v.replace('^', '+');
  }

  // NPM @dev deps versions
  for (const type of ['webpack', 'typescript']) {
    const v = env['npm_package_devDependencies_' + type];
    if (v) versions[type] = v.replace('^', '+');
  }

  // Set versions to app data
  app?.setAttribute('data-versions', JSON.stringify(versions));
});

// const ipc = {
//   'render': {
//     // From render to main.
//     'send': [
//       'message:startingRound',
//     ],
//     // From main to render.
//     'receive': [
//       'message:getStartingRound',
//     ],
//     // From render to main and back again.
//     'sendReceive': []
//   }
// };

// contextBridge.exposeInMainWorld(
//   // Allowed 'ipcRenderer' methods.
//   'ipcRender', {
//   // From render to main.
//   send: (channel: any, args: any) => {
//     let validChannels = ipc.render.send;
//     if (validChannels.includes(channel)) {
//       ipcRenderer.send(channel, args);
//     }
//   },
//   // From main to render.
//   receive: (channel: any, listener: any) => {
//     let validChannels = ipc.render.receive;
//     // @ts-ignore
//     if (validChannels.includes(channel)) {
//       // Deliberately strip event as it includes `sender`.
//       ipcRenderer.on(channel, (event, ...args) => listener(...args));
//     }
//   },
//   // From render to main and back again.
//   invoke: (channel: any, args: any) => {
//     let validChannels = ipc.render.sendReceive;
//     // @ts-ignore
//     if (validChannels.includes(channel)) {
//       return ipcRenderer.invoke(channel, args);
//     }
//   }
// }
// );
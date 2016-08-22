# remote-ui-electron

An Electron client for [ofxRemoteUi](https://github.com/armadillu/ofxRemoteUI)

### Running
To install all required dependencies through NPM:
```
npm install
```
To launch the electron app:
```
npm start
```

### osc.js Fork
`remote-ui-electron` uses `osc.js` to send OSC messages to the RemoteUI server. However, this library has a small bug which means you can't send packets over UDP sockets with Electron. The maintainer (@colinbdclark) actively maintains `osc.js` and has a fix which isn't released on NPM yet. 

See this issue https://github.com/colinbdclark/osc.js/issues/65 for more information on the bug. Right now the Electron `package.json` points to this fork of `osc.js` https://github.com/Plastix/osc.js which has a "hacky" fix to make it work with Electron. However, the `osc.js` maintainer has a far better fix. Once the Electron fix is released, the `osc.js` depdenency can be moved back to the official version of the project (https://github.com/Plastix/remote-ui-electron/blob/master/package.json#L17).

### Dialogs
Electron doesn't support input dialogs with `prompt()`. Thus, `remote-ui-electron` is using this https://www.npmjs.com/package/dialogs third party library that provides input dialog support. For some reason the dialog CSS makes the dialogs look like iOS dialogs. This probably can be overwritten.

See https://github.com/electron/electron/issues/472 for more information.

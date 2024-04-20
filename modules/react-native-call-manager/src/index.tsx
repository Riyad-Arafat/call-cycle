import { NativeEventEmitter, NativeModules, Platform } from "react-native";
import BatchedBridge from "react-native/Libraries/BatchedBridge/BatchedBridge";

const LINKING_ERROR =
  `The package 'react-native-call-manager' doesn't seem to be linked. Make sure: \n\n` +
  Platform.select({ ios: "- You have run 'pod install'\n", default: "" }) +
  "- You rebuilt the app after installing the package\n" +
  "- You are not using Expo Go\n";

const CallManager = NativeModules.CallManager
  ? NativeModules.CallManager
  : new Proxy(
      {},
      {
        get() {
          throw new Error(LINKING_ERROR);
        },
      }
    );

type CallEvent = {
  event:
    | "Disconnected"
    | "Connected"
    | "Incoming"
    | "Dialing"
    | "Offhook"
    | "Missed";

  incomingNumber?: string;
};

var CallStateUpdateActionModule = {
  callback: undefined as
    | ((event: CallEvent["event"], number?: string) => void)
    | undefined,

  callStateUpdated(state: CallEvent, incomingNumber?: string) {
    this.callback && this.callback(state, incomingNumber);
  },
};

BatchedBridge.registerCallableModule(
  "CallStateUpdateActionModule",
  CallStateUpdateActionModule
);

// ... rest of your code
class CallManagerClass {
  private subscription: NativeEventEmitter | undefined;

  constructor() {
    this.becomeDefaultDialer();
  }

  public onStateChange(
    callback: (event: CallEvent["event"], number?: string) => void
  ) {
    CallManager.startListener();
    this.subscription = new NativeEventEmitter(CallManager);

    this.subscription.addListener("PhoneCallStateUpdate", (event: any) => {
      console.log(event); // "Incoming", "Offhook", "Disconnected", "Missed"
      // callback(event.event, event.incomingNumber);
    });

    CallStateUpdateActionModule.callback = callback;
  }

  public async becomeDefaultDialer() {
    try {
      const result = await CallManager.becomeDefaultDialer();
      console.log(result); // Handle success
    } catch (e) {
      console.error(e); // Handle error
    }
  }

  public makeCall(phoneNumber: string): Promise<void> {
    return CallManager.call(phoneNumber);
  }
  public answerCall(): Promise<void> {
    return CallManager.answerCall();
  }

  public rejectCall(): Promise<void> {
    return CallManager.rejectCall();
  }

  public dispose() {
    CallManager.stopListener();
    if (this.subscription) {
      this.subscription.removeAllListeners("PhoneCallStateUpdate");
      this.subscription = undefined;
    }
  }

  public async endCall(): Promise<void> {
    CallManager.endCall();
  }

  public async enableSpeaker(): Promise<void> {
    CallManager.enableSpeaker();
  }

  public async disableSpeaker(): Promise<void> {
    CallManager.disableSpeaker();
  }
}

export class ReplaceDialer {
  constructor() {
    //super();
  }

  checkNativeModule() {
    // Produce an error if we don't have the native module
    if (NativeModules.ReplaceDialerModule == null) {
      throw new Error(`react-native-replace-dialer: NativeModule.ReplaceDialerModule is null. To fix this issue try these steps:
              • Rebuild and re-run the app.
              • If you are using CocoaPods on iOS, run \`pod install\` in the \`ios\` directory and then rebuild and re-run the app. You may also need to re-open Xcode to get the new pods.
              • Check that the library was linked correctly when you used the link command by running through the manual installation instructions in the README.
              * If you are getting this error while unit testing you need to mock the native module. Follow the guide in the README.
              If none of these fix the issue, please open an issue on the Github repository: https://github.com/telefon-one/react-native-replace-dialer`);
    }
  }

  isDefaultDialer(cb?: (data: any) => void) {
    this.checkNativeModule();
    return NativeModules.ReplaceDialerModule.isDefaultDialer((data) => {
      console.log("isDefaultDialer()", data);
      cb(data);
      //if (successful) {
      // }
    });
  }

  setDefaultDialer(cb?: (data: any) => void) {
    this.checkNativeModule();
    //return NativeModules.ReplaceDialerModule.setDefault();
    return NativeModules.ReplaceDialerModule.setDefaultDialer((data) => {
      console.log("setDefaultDialer", data);
      cb(data);
      //if (successful) {
      //}
    });
  }
}

export default new CallManagerClass();

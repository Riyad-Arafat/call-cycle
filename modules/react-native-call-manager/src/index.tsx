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
}

export default new CallManagerClass();

import { NativeModules, Platform } from "react-native";

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
  event: "incomingCall" | "callAnswered" | "callRejected" | "callEnded";
  incomingNumber?: string;
};

type CallEventCallbacks = {
  onIncomingCall?: (incomingNumber?: string) => void;
  onCallAnswered?: () => void;
  onCallRejected?: () => void;
};

class CallManagerClass {
  private callEventCallbacks: CallEventCallbacks = {
    onIncomingCall: undefined,
    onCallAnswered: undefined,
    onCallRejected: undefined,
  };

  constructor() {
    console.log("CallManagerModule", CallManager);
  }

  public addListener(
    event: CallEvent["event"],
    callback: (...args: any[]) => void
  ) {
    switch (event) {
      case "incomingCall":
        this.callEventCallbacks.onIncomingCall = callback;
        break;
      case "callAnswered":
        this.callEventCallbacks.onCallAnswered = callback;
        break;
      case "callRejected":
        this.callEventCallbacks.onCallRejected = callback;
        break;
    }
  }

  public removeListener(event: CallEvent["event"]) {
    switch (event) {
      case "incomingCall":
        this.callEventCallbacks.onIncomingCall = undefined;
        break;
      case "callAnswered":
        this.callEventCallbacks.onCallAnswered = undefined;
        break;
      case "callRejected":
        this.callEventCallbacks.onCallRejected = undefined;
        break;
    }
  }

  public makeCall(phoneNumber: string): Promise<void> {
    console.log("Making call to", CallManager);
    return CallManager.call(phoneNumber);
  }
  public answerCall(): Promise<void> {
    return CallManager.answerCall();
  }

  public rejectCall(): Promise<void> {
    return CallManager.rejectCall();
  }
}

export default new CallManagerClass();

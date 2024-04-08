import {
  EmitterSubscription,
  NativeEventEmitter,
  NativeModules,
  Platform,
} from "react-native";

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
  private eventEmitter: NativeEventEmitter;
  private eventListener: EmitterSubscription;
  private callEventCallbacks: CallEventCallbacks = {
    onIncomingCall: undefined,
    onCallAnswered: undefined,
    onCallRejected: undefined,
  };

  constructor() {
    console.log("CallManagerModule", CallManager);
    this.eventEmitter = new NativeEventEmitter(CallManager);
    this.eventListener = this.eventEmitter.addListener(
      "callEvent",
      (event: CallEvent) => {
        switch (event.event) {
          case "incomingCall":
            this.callEventCallbacks.onIncomingCall?.(event.incomingNumber);
            break;
          case "callAnswered":
            this.callEventCallbacks.onCallAnswered?.();
            break;
          case "callRejected":
            this.callEventCallbacks.onCallRejected?.();
            break;
        }
      }
    );
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

    // if all callbacks are undefined, remove the event listener
    if (
      !this.callEventCallbacks.onIncomingCall &&
      !this.callEventCallbacks.onCallAnswered &&
      !this.callEventCallbacks.onCallRejected
    ) {
      this.eventEmitter.removeAllListeners("callEvent");
    }
  }

  public makeCall(phoneNumber: string): Promise<void> {
    console.log("Making call to", JSON.stringify(NativeModules));
    return CallManager.call(phoneNumber);
  }
  public answerCall(): Promise<void> {
    return CallManager.answerCall();
  }

  public rejectCall(): Promise<void> {
    return CallManager.rejectCall();
  }

  public dispose() {
    this.eventListener.remove();
  }
}

export default new CallManagerClass();

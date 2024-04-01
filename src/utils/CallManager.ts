import {
  NativeModules,
  NativeEventEmitter,
  EmitterSubscription,
} from "react-native";

type CallEvent = {
  event: "incomingCall" | "callAnswered" | "callRejected";
  incomingNumber?: string;
};

type CallEventCallbacks = {
  onIncomingCall?: (incomingNumber: string) => void;
  onCallAnswered?: () => void;
  onCallRejected?: () => void;
};

class CallManager {
  private eventEmitter: NativeEventEmitter;
  private eventListener: EmitterSubscription;
  private callEventCallbacks: CallEventCallbacks = {
    onIncomingCall: undefined,
    onCallAnswered: undefined,
    onCallRejected: undefined,
  };

  constructor() {
    this.eventEmitter = new NativeEventEmitter(NativeModules.CallManager);
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
    event: "incomingCall" | "callAnswered" | "callRejected",
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

  public removeListener(
    event: "incomingCall" | "callAnswered" | "callRejected"
  ) {
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
    return NativeModules.CallManager.call(phoneNumber);
  }

  public answerCall(): Promise<void> {
    return NativeModules.CallManager.answerCall();
  }

  public rejectCall(): Promise<void> {
    return NativeModules.CallManager.rejectCall();
  }

  public dispose() {
    this.eventListener.remove();
  }
}

export default CallManager;

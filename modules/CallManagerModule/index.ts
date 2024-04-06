import {
  requireNativeModule,
  EventEmitter,
  Subscription,
} from "expo-modules-core";

// and on native platforms to CallManagerModule.ts
import CallManagerModule from "./src/CallManagerModule";

type CallEvent = {
  event: "incomingCall" | "callAnswered" | "callRejected" | "callEnded";
  incomingNumber?: string;
};

type CallEventCallbacks = {
  onIncomingCall?: (incomingNumber: string) => void;
  onCallAnswered?: () => void;
  onCallRejected?: () => void;
};

class CallManager {
  private eventEmitter: EventEmitter;
  private eventListener: Subscription;
  private callEventCallbacks: CallEventCallbacks = {
    onIncomingCall: undefined,
    onCallAnswered: undefined,
    onCallRejected: undefined,
  };

  constructor() {
    console.log("CallManagerModule", CallManagerModule);
    this.eventEmitter = new EventEmitter(
      CallManagerModule ?? requireNativeModule("CallManagerModule")
    );
    this.eventListener = this.eventEmitter.addListener(
      "callEvent",
      (listener: CallEvent) => {
        const event = listener as CallEvent;
        switch (event.event) {
          case "incomingCall":
            this.callEventCallbacks.onIncomingCall?.(
              event?.incomingNumber || ""
            );
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
    return CallManagerModule.call(phoneNumber);
  }
  public answerCall(): Promise<void> {
    return CallManagerModule.answerCall();
  }

  public rejectCall(): Promise<void> {
    return CallManagerModule.rejectCall();
  }

  public dispose() {
    this.eventListener.remove();
  }
}

const callManager = new CallManager();
export default callManager;

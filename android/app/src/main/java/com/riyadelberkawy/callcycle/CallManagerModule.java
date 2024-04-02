package com.riyadelberkawy.callcycle;

import android.content.Context;
import android.content.Intent;
import android.net.Uri;
import android.telephony.PhoneStateListener;
import android.telephony.TelephonyManager;
import androidx.core.app.ActivityCompat;
import android.Manifest;
import android.content.pm.PackageManager;
import android.telecom.TelecomManager;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.Arguments;
import com.facebook.react.modules.core.DeviceEventManagerModule.RCTDeviceEventEmitter;
import android.telecom.Call;


public class CallManagerModule extends ReactContextBaseJavaModule {
    private TelephonyManager telephonyManager = null;
    private int lastState = TelephonyManager.CALL_STATE_IDLE;

    public CallManagerModule(ReactApplicationContext reactContext) {
        super(reactContext);
        telephonyManager = (TelephonyManager) reactContext.getSystemService(Context.TELEPHONY_SERVICE);
        telephonyManager.listen(callStateListener, PhoneStateListener.LISTEN_CALL_STATE);
    }

    private final PhoneStateListener callStateListener = new PhoneStateListener() {
        @Override
        public void onCallStateChanged(int state, String incomingNumber) {
            super.onCallStateChanged(state, incomingNumber);
            com.facebook.react.bridge.WritableMap params = Arguments.createMap();
            switch (state) {
                case TelephonyManager.CALL_STATE_RINGING:
                    params.putString("event", "incomingCall");
                    params.putString("incomingNumber", incomingNumber);
                    break;
                case TelephonyManager.CALL_STATE_OFFHOOK:
                    if (lastState == TelephonyManager.CALL_STATE_RINGING) {
                        params.putString("event", "callAnswered");
                    }
                    break;
                case TelephonyManager.CALL_STATE_IDLE:
                    if (lastState == TelephonyManager.CALL_STATE_RINGING) {
                        params.putString("event", "callRejected");
                    } else if (lastState == TelephonyManager.CALL_STATE_OFFHOOK) {
                        params.putString("event", "callEnded");
                    }
                    break;
            }
            if (params.hasKey("event")) {
                getReactApplicationContext().getJSModule(RCTDeviceEventEmitter.class).emit("callEvent", params);
            }
            lastState = state;
        }
    };
    @Override
    public String getName() {
        return "CallManager";
    }

    @ReactMethod
    public void call(String phoneNumber, Promise promise) {
        try {
            Intent intent = new Intent(Intent.ACTION_CALL);
            intent.setData(Uri.parse("tel:" + phoneNumber));
            intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            if (ActivityCompat.checkSelfPermission(getReactApplicationContext(), Manifest.permission.CALL_PHONE) == PackageManager.PERMISSION_GRANTED) {
                getReactApplicationContext().startActivity(intent);
                Call currentCall = MyInCallService.getCurrentCall();
                promise.resolve(currentCall);
            } else {
                promise.reject("ERROR", "Call permission not granted.");
            }
        } catch (Exception e) {
            promise.reject("ERROR", "Call initiation failed: " + e.getMessage());
        }
    }

    @ReactMethod
    public void setMuteOn(Promise promise) {
        try {
            TelecomManager telecomManager = (TelecomManager) getReactApplicationContext().getSystemService(Context.TELECOM_SERVICE);
            if (telecomManager != null) {
                telecomManager.setMuted(true);
                promise.resolve("Mute set to ON.");
            } else {
                promise.reject("ERROR", "Unable to get TelecomManager.");
            }
        } catch (Exception e) {
            promise.reject("ERROR", "Failed to set mute on: " + e.getMessage());
        }
    }

    @ReactMethod
    public void setMuteOff(Promise promise) {
        try {
            TelecomManager telecomManager = (TelecomManager) getReactApplicationContext().getSystemService(Context.TELECOM_SERVICE);
            if (telecomManager != null) {
                telecomManager.setMuted(false);
                promise.resolve("Mute set to OFF.");
            } else {
                promise.reject("ERROR", "Unable to get TelecomManager.");
            }
        } catch (Exception e) {
            promise.reject("ERROR", "Failed to set mute off: " + e.getMessage());
        }
    }


    @ReactMethod
    public void answerCall(Promise promise) {
        try {
            TelecomManager telecomManager = (TelecomManager) getReactApplicationContext().getSystemService(Context.TELECOM_SERVICE);
            if (telecomManager != null) {
                telecomManager.acceptRingingCall();
                Call currentCall = MyInCallService.getCurrentCall();
                if (currentCall != null) {
                    promise.resolve(currentCall);
                } else {
                    promise.reject("ERROR", "No active call.");
                }
            } else {
                promise.reject("ERROR", "Unable to get TelecomManager.");
            }
        } catch (Exception e) {
            promise.reject("ERROR", "Failed to answer the call: " + e.getMessage());
        }
    }

    @ReactMethod
    public void rejectCall(Promise promise) {
        try {
            TelecomManager telecomManager = (TelecomManager) getReactApplicationContext().getSystemService(Context.TELECOM_SERVICE);
            if (telecomManager != null) {
                telecomManager.endCall();
                promise.resolve("Call rejected successfully.");
            } else {
                promise.reject("ERROR", "Unable to get TelecomManager.");
            }
        } catch (Exception e) {
            promise.reject("ERROR", "Failed to reject the call: " + e.getMessage());
        }
    }
}



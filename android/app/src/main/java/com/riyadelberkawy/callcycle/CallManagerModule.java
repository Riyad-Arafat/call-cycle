package com.riyadelberkawy.callcycle;

import android.content.Context;
import android.content.Intent;
import android.net.Uri;
import android.os.Bundle;
import android.telecom.TelecomManager;
import android.telephony.PhoneStateListener;
import android.telephony.TelephonyManager;

import androidx.annotation.NonNull;
import androidx.core.app.ActivityCompat;
import android.Manifest;
import android.content.pm.PackageManager;
import android.media.AudioManager;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.bridge.Arguments;
import com.facebook.react.modules.core.DeviceEventManagerModule.RCTDeviceEventEmitter;
import android.telecom.Call;
import android.telecom.VideoProfile;

public class CallManagerModule extends ReactContextBaseJavaModule {
    private final TelephonyManager telephonyManager;
    private final PhoneStateListener callStateListener;
    private int lastState = TelephonyManager.CALL_STATE_IDLE;

    public CallManagerModule(ReactApplicationContext reactContext) {
        super(reactContext);
        telephonyManager = (TelephonyManager) reactContext.getSystemService(Context.TELEPHONY_SERVICE);
        callStateListener = new PhoneStateListener() {
            @Override
            public void onCallStateChanged(int state, String incomingNumber) {
                super.onCallStateChanged(state, incomingNumber);
                WritableMap params = Arguments.createMap();
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
        telephonyManager.listen(callStateListener, PhoneStateListener.LISTEN_CALL_STATE);
    }

    @NonNull
    @Override
    public String getName() {
        return "CallManager";
    }

    @ReactMethod
    public void call(String phoneNumber, Promise promise) {
        TelecomManager telecomManager = (TelecomManager) getReactApplicationContext().getSystemService(Context.TELECOM_SERVICE);

        if (telecomManager != null && ActivityCompat.checkSelfPermission(getReactApplicationContext(), Manifest.permission.CALL_PHONE) == PackageManager.PERMISSION_GRANTED) {
            Uri uri = Uri.fromParts("tel", phoneNumber, null);
            Bundle extras = new Bundle();
            extras.putBoolean(TelecomManager.EXTRA_START_CALL_WITH_SPEAKERPHONE, true);
            telecomManager.placeCall(uri, extras);
            Call currentCall = MyInCallService.getCurrentCall();
            if (currentCall != null) {
                promise.resolve(currentCall);
            } else {
                promise.reject("ERROR", "No current call available.");
            }
        } else {
            promise.reject("ERROR", "Permission not granted or TelecomManager not available.");
        }
    }
    
    @ReactMethod
    public void setMuteOn(Promise promise) {
        AudioManager audioManager = (AudioManager) getReactApplicationContext().getSystemService(Context.AUDIO_SERVICE);
        if (audioManager != null) {
            audioManager.setMicrophoneMute(true);
            promise.resolve("Mute set to ON.");
        } else {
            promise.reject("ERROR", "Audio manager not available.");
        }
    }

    @ReactMethod
    public void setMuteOff(Promise promise) {
        AudioManager audioManager = (AudioManager) getReactApplicationContext().getSystemService(Context.AUDIO_SERVICE);
        if (audioManager != null) {
            audioManager.setMicrophoneMute(false);
            promise.resolve("Mute set to OFF.");
        } else {
            promise.reject("ERROR", "Audio manager not available.");
        }
    }

    @ReactMethod
    public void answerCall(Promise promise) {
        Call currentCall = MyInCallService.getCurrentCall();
        if (currentCall != null && currentCall.getState() == Call.STATE_RINGING) {
            currentCall.answer(VideoProfile.STATE_AUDIO_ONLY);
            promise.resolve("Call answered successfully.");
        } else {
            promise.reject("ERROR", "No ringing call available.");
        }
    }

    @ReactMethod
    public void rejectCall(Promise promise) {
        Call currentCall = MyInCallService.getCurrentCall();
        if (currentCall != null) {
            currentCall.disconnect();
            promise.resolve("Call rejected successfully.");
        } else {
            promise.reject("ERROR", "No active call to reject.");
        }
    }

    @Override
    protected void finalize() throws Throwable {
        try {
            telephonyManager.listen(callStateListener, PhoneStateListener.LISTEN_NONE);
        } finally {
            super.finalize();
        }
    }
}

package com.riyadelberkawy.callcycle;

import android.Manifest;
import android.content.Context;
import android.content.pm.PackageManager;
import android.media.AudioManager;
import android.net.Uri;
import android.os.Bundle;
import android.os.Looper;
import android.telecom.Call;
import android.telecom.TelecomManager;
import android.telecom.VideoProfile;
import android.telephony.PhoneStateListener;
import android.telephony.TelephonyManager;

import androidx.annotation.NonNull;
import androidx.core.app.ActivityCompat;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.modules.core.DeviceEventManagerModule.RCTDeviceEventEmitter;

public class CallManagerModule extends ReactContextBaseJavaModule {
    private final TelephonyManager telephonyManager;
    private final PhoneStateListener callStateListener;
    private int lastState = TelephonyManager.CALL_STATE_IDLE;

    public CallManagerModule(ReactApplicationContext reactContext) {
        super(reactContext);
        Looper.prepare();
        telephonyManager = (TelephonyManager) reactContext.getSystemService(Context.TELEPHONY_SERVICE);
        callStateListener = createPhoneStateListener();
        telephonyManager.listen(callStateListener, PhoneStateListener.LISTEN_CALL_STATE);
        Looper.loop();
    }

    private PhoneStateListener createPhoneStateListener() {
        return new PhoneStateListener() {
            @Override
            public void onCallStateChanged(int state, String incomingNumber) {
                handleCallStateChanged(state, incomingNumber);
            }
        };
    }

    private void handleCallStateChanged(int state, String incomingNumber) {
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
            ReactApplicationContext context = getValidContext();
            if (context != null) {
                context.getJSModule(RCTDeviceEventEmitter.class).emit("callEvent", params);
            }
        }
        lastState = state;
    }


    @NonNull
    @Override
    public String getName() {
        return "CallManager";
    }

    private ReactApplicationContext getValidContext() {
        // Handle the case where the context is not available
        // You can throw an exception or log an error
        return getReactApplicationContext();
    }


    @ReactMethod
    public void call(String phoneNumber, Promise promise) {
        ReactApplicationContext context = getValidContext();
        if (context == null) {
            promise.reject("ERROR", "Context is not available");
            return;
        }

        TelecomManager telecomManager = (TelecomManager) context.getSystemService(Context.TELECOM_SERVICE);

        if (telecomManager != null && ActivityCompat.checkSelfPermission(context, Manifest.permission.CALL_PHONE) == PackageManager.PERMISSION_GRANTED) {
            Uri uri = Uri.fromParts("tel", phoneNumber, null);
            Bundle extras = new Bundle();
            extras.putBoolean(TelecomManager.EXTRA_START_CALL_WITH_SPEAKERPHONE, true);
            try {
                telecomManager.placeCall(uri, extras);
                Call currentCall = MyInCallService.getCurrentCall();
                if (currentCall != null) {
                    promise.resolve("Call placed successfully");
                } else {
                    promise.reject("ERROR", "Call placed but no current call information available.");
                }
            } catch (Exception e) {
                promise.reject("ERROR", "Failed to place call: " + e.getMessage());
            }
        } else {
            promise.reject("ERROR", "Permission not granted or TelecomManager not available.");
        }
    }

    @ReactMethod
    public void setMuteOn(Promise promise) {
        ReactApplicationContext context = getValidContext();
        if (context == null) {
            promise.reject("ERROR", "Context is not available");
            return;
        }

        AudioManager audioManager = (AudioManager) context.getSystemService(Context.AUDIO_SERVICE);
        if (audioManager != null) {
            audioManager.setMicrophoneMute(true);
            promise.resolve("Mute set to ON.");
        } else {
            promise.reject("ERROR", "Audio manager not available.");
        }
    }

    @ReactMethod
    public void setMuteOff(Promise promise) {
        ReactApplicationContext context = getValidContext();
        if (context == null) {
            promise.reject("ERROR", "Context is not available");
            return;
        }

        AudioManager audioManager = (AudioManager) context.getSystemService(Context.AUDIO_SERVICE);
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

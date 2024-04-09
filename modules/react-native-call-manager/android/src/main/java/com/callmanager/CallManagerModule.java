package com.callmanager;

import androidx.annotation.NonNull;

import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.module.annotations.ReactModule;

import android.Manifest;
import android.content.Context;
import android.content.pm.PackageManager;
import android.media.AudioManager;
import android.net.Uri;
import android.os.Bundle;
import android.telecom.Call;
import android.telecom.TelecomManager;
import android.telecom.VideoProfile;
import android.telephony.TelephonyManager;
import android.content.Intent;
import android.provider.Settings;
import android.telecom.PhoneAccountHandle;
import android.telecom.PhoneAccount;
import android.content.ComponentName;
import androidx.core.app.ActivityCompat;
import android.util.Log;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.modules.core.DeviceEventManagerModule.RCTDeviceEventEmitter;


@ReactModule(name = CallManagerModule.NAME)
public class CallManagerModule extends ReactContextBaseJavaModule {
  public static final String NAME = "CallManager";
  public static CallManagerModule instance = null;
  private ReactApplicationContext reactContext;
   private static final String TAG = "CallManagerModule";


    private final TelephonyManager telephonyManager;
    private int lastState = TelephonyManager.CALL_STATE_IDLE;

    public CallManagerModule(ReactApplicationContext reactContext) {
        super(reactContext);
        this.reactContext = reactContext;
        telephonyManager = (TelephonyManager) reactContext.getSystemService(Context.TELEPHONY_SERVICE);

        // Consider moving this to a separate method to control when it's executed
        // and to handle permissions and user consent properly
        ComponentName componentName = new ComponentName(reactContext, CallManagerConnectionService.class);
        String id = "com.callmanager.callService";
        PhoneAccountHandle phoneAccountHandle = new PhoneAccountHandle(componentName, id);

        PhoneAccount phoneAccount = PhoneAccount.builder(phoneAccountHandle, "CallManager")
            .setCapabilities(PhoneAccount.CAPABILITY_CALL_PROVIDER)
            .build();

        TelecomManager telecomManager = (TelecomManager) reactContext.getSystemService(Context.TELECOM_SERVICE);
        if (ActivityCompat.checkSelfPermission(reactContext, Manifest.permission.MANAGE_OWN_CALLS) == PackageManager.PERMISSION_GRANTED) {
            telecomManager.registerPhoneAccount(phoneAccount);
        } else {
            Log.d(TAG, "CallManagerModule: No permission to register phone account");
        }
    }
  @Override
  @NonNull
  public String getName() {
    return NAME;
  }

   @ReactMethod
    public void call(String phoneNumber, Promise promise) {
        ReactApplicationContext context = getContext();
        if (context == null) {
            promise.reject("ERROR", "Context is not available");
            return;
        }

        TelecomManager telecomManager = (TelecomManager) context.getSystemService(Context.TELECOM_SERVICE);
        if (telecomManager == null) {
            promise.reject("ERROR", "TelecomManager not available.");
            return;
        }

        if (!context.getPackageName().equals(TelecomManager.getDefaultDialerPackage(context))) {
            promise.reject("ERROR", "Not default dialer");
            return;
        }

        if (ActivityCompat.checkSelfPermission(context, Manifest.permission.CALL_PHONE) != PackageManager.PERMISSION_GRANTED) {
            promise.reject("ERROR", "Permission for CALL_PHONE not granted.");
            return;
        }

        Uri uri = Uri.fromParts("tel", phoneNumber, null);
        Bundle extras = new Bundle();
        extras.putBoolean(TelecomManager.EXTRA_START_CALL_WITH_SPEAKERPHONE, true);
        try {
            telecomManager.placeCall(uri, extras);
            promise.resolve("Call placed successfully");
        } catch (Exception e) {
            promise.reject("ERROR", "Failed to place call: " + e.getMessage());
        }
    }

    @ReactMethod
    public void becomeDefaultDialer(Promise promise) {
        ReactApplicationContext context = getContext();
        if (context == null) {
            promise.reject("ERROR", "Context is not available");
            return;
        }

        Intent intent = new Intent(TelecomManager.ACTION_CHANGE_DEFAULT_DIALER);
        intent.putExtra(TelecomManager.EXTRA_CHANGE_DEFAULT_DIALER_PACKAGE_NAME, context.getPackageName());

        if (intent.resolveActivity(context.getPackageManager()) != null) {
            context.startActivity(intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK));
            promise.resolve("Requested default dialer change.");
        } else {
            promise.reject("ERROR", "Unable to request default dialer change.");
        }
    }

    @ReactMethod
    public void setMuteOn(Promise promise) {
        ReactApplicationContext context = getContext();
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
        ReactApplicationContext context = getContext();
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


    public ReactApplicationContext getContext() {
        return this.reactContext;
    }
}

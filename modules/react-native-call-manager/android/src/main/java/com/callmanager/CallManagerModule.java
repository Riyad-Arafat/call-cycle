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
import android.app.Activity;
import android.app.Application;
import android.telephony.PhoneStateListener;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.modules.core.DeviceEventManagerModule.RCTDeviceEventEmitter;

import java.util.HashMap;
import java.util.Map;


@ReactModule(name = CallManagerModule.NAME)
public class CallManagerModule extends ReactContextBaseJavaModule   implements Application.ActivityLifecycleCallbacks,
        CallDetectionPhoneStateListener.PhoneCallStateUpdate {


  public static final String NAME = "CallManager";
  public static CallManagerModule instance = null;
  private ReactApplicationContext reactContext;
   private static final String TAG = "CallManagerModule";


    private TelephonyManager telephonyManager;
    private int lastState = TelephonyManager.CALL_STATE_IDLE;


     private boolean wasAppInOffHook = false;
    private boolean wasAppInRinging = false;
    private CallStateUpdateActionModule jsModule = null;
    private CallDetectionPhoneStateListener callDetectionPhoneStateListener;
    private Activity activity = null;

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

    @ReactMethod
    public void startListener() {
        if (activity == null) {
            activity = getCurrentActivity();
            activity.getApplication().registerActivityLifecycleCallbacks(this);
        }

        telephonyManager = (TelephonyManager) this.reactContext.getSystemService(
                Context.TELEPHONY_SERVICE);
        callDetectionPhoneStateListener = new CallDetectionPhoneStateListener(this);
        telephonyManager.listen(callDetectionPhoneStateListener,
                PhoneStateListener.LISTEN_CALL_STATE);

    }

    @ReactMethod
    public void stopListener() {
        telephonyManager.listen(callDetectionPhoneStateListener,
                PhoneStateListener.LISTEN_NONE);
        telephonyManager = null;
        callDetectionPhoneStateListener = null;
    }

    /**
     * @return a map of constants this module exports to JS. Supports JSON types.
     */
    public
    Map<String, Object> getConstants() {
        Map<String, Object> map = new HashMap<String, Object>();
        map.put("Incoming", "Incoming");
        map.put("Offhook", "Offhook");
        map.put("Disconnected", "Disconnected");
        map.put("Missed", "Missed");
        return map;
    }

    // Activity Lifecycle Methods
    @Override
    public void onActivityCreated(Activity activity, Bundle savedInstanceType) {

    }

    @Override
    public void onActivityStarted(Activity activity) {

    }

    @Override
    public void onActivityResumed(Activity activity) {

    }

    @Override
    public void onActivityPaused(Activity activity) {

    }

    @Override
    public void onActivityStopped(Activity activity) {

    }

    @Override
    public void onActivitySaveInstanceState(Activity activity, Bundle outState) {

    }

    @Override
    public void onActivityDestroyed(Activity activity) {

    }

    @Override
    public void phoneCallStateUpdated(int state, String phoneNumber) {
        jsModule = this.reactContext.getJSModule(CallStateUpdateActionModule.class);

        switch (state) {
            //Hangup
            case TelephonyManager.CALL_STATE_IDLE:
                if(wasAppInOffHook == true) { // if there was an ongoing call and the call state switches to idle, the call must have gotten disconnected
                    jsModule.callStateUpdated("Disconnected", phoneNumber);
                } else if(wasAppInRinging == true) { // if the phone was ringing but there was no actual ongoing call, it must have gotten missed
                    jsModule.callStateUpdated("Missed", phoneNumber);
                }

                //reset device state
                wasAppInRinging = false;
                wasAppInOffHook = false;
                break;
            //Outgoing
            case TelephonyManager.CALL_STATE_OFFHOOK:
                //Device call state: Off-hook. At least one call exists that is dialing, active, or on hold, and no calls are ringing or waiting.
                wasAppInOffHook = true;
                jsModule.callStateUpdated("Offhook", phoneNumber);
                break;
            //Incoming
            case TelephonyManager.CALL_STATE_RINGING:
                // Device call state: Ringing. A new call arrived and is ringing or waiting. In the latter case, another call is already active.
                wasAppInRinging = true;
                jsModule.callStateUpdated("Incoming", phoneNumber);
                break;
        }
    }
}

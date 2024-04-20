package com.callmanager;

import androidx.annotation.NonNull;
import androidx.core.app.ActivityCompat;
import androidx.core.app.NotificationCompat;

import android.Manifest;
import android.app.Activity;
import android.app.Application;
import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.app.role.RoleManager;
import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.media.AudioManager;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.telecom.Call;
import android.telecom.PhoneAccount;
import android.telecom.PhoneAccountHandle;
import android.telecom.TelecomManager;
import android.telecom.VideoProfile;
import android.telecom.ConnectionRequest;
import android.telephony.PhoneStateListener;
import android.telephony.TelephonyManager;
import android.util.Log;


import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.module.annotations.ReactModule;
import android.app.KeyguardManager;
import android.os.PowerManager;
import android.view.WindowManager;


import static android.content.Context.POWER_SERVICE;

import java.util.HashMap;
import java.util.Map;



@ReactModule(name = CallManagerModule.NAME)
public class CallManagerModule extends ReactContextBaseJavaModule   implements Application.ActivityLifecycleCallbacks,
        CallDetectionPhoneStateListener.PhoneCallStateUpdate {
    public static final String NAME = "CallManager";
    private static final String TAG = "CallManagerModule";

    private TelephonyManager telephonyManager;
    private TelecomManager telecomManager;
    private PhoneAccountHandle phoneAccountHandle;
    private PhoneAccount phoneAccount;
    private int lastState = TelephonyManager.CALL_STATE_IDLE;

    private boolean wasAppInOffHook = false;
    private boolean wasAppInRinging = false;
    private CallStateUpdateActionModule jsModule = null;
    private CallDetectionPhoneStateListener callDetectionPhoneStateListener;
    private Activity activity = null;

    private static final String CHANNEL_ID = "sim_settings_channel";
    private static final int NOTIFICATION_ID = 1;

    private final ReactApplicationContext reactContext;

    public CallManagerModule(ReactApplicationContext reactContext) {
        super(reactContext);
        this.reactContext = reactContext;
        this.telephonyManager = (TelephonyManager) reactContext.getSystemService(Context.TELEPHONY_SERVICE);
        this.telecomManager = (TelecomManager) reactContext.getSystemService(Context.TELECOM_SERVICE);
        ComponentName componentName = new ComponentName(reactContext, CallManagerConnectionService.class);
        this.phoneAccountHandle = new PhoneAccountHandle(componentName, "com.callmanager.callService");
        this.phoneAccount = PhoneAccount.builder(phoneAccountHandle, "CallManager")
            .setCapabilities(PhoneAccount.CAPABILITY_SELF_MANAGED)
            .build();
        registerPhoneAccount();
    }
    
    
    private void registerPhoneAccount() {
        if (ActivityCompat.checkSelfPermission(reactContext, Manifest.permission.MANAGE_OWN_CALLS) == PackageManager.PERMISSION_GRANTED) {
            telecomManager.registerPhoneAccount(phoneAccount);
        } else {
            Log.e(TAG, "Permission MANAGE_OWN_CALLS not granted. Cannot register phone account.");
        }
    }

    @Override
    @NonNull
    public String getName() {
        return NAME;
    }

    @ReactMethod
    public void call(String phoneNumber, Promise promise) {
        if (ActivityCompat.checkSelfPermission(getReactApplicationContext(), Manifest.permission.CALL_PHONE) != PackageManager.PERMISSION_GRANTED) {
            promise.reject("ERROR", "Permission for CALL_PHONE not granted.");
            return;
        }

        PhoneAccountHandle phoneAccountHandle = new PhoneAccountHandle(new ComponentName(reactContext, CallManagerConnectionService.class), "com.callmanager.callService");
        Uri uri = Uri.fromParts("tel", phoneNumber, null);
        Bundle extras = new Bundle();
        extras.putBoolean(TelecomManager.EXTRA_START_CALL_WITH_SPEAKERPHONE, false);
        ConnectionRequest request = new ConnectionRequest(phoneAccountHandle, uri, extras);
        try {
            telecomManager.placeCall(uri, extras);
            if (telecomManager.getDefaultDialerPackage().equals(reactContext.getPackageName())) { // Use getDefaultDialerPackage
                promise.resolve("Call placed successfully.");
            } else {
                promise.reject("ERROR", "Not set as default dialer.");
            }
        } catch (Exception e) {
            promise.reject("ERROR", "Failed to place call: " + e.getMessage());
        }
    }


    @ReactMethod
    public void becomeDefaultDialer(Promise promise) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            RoleManager roleManager = (RoleManager) reactContext.getSystemService(Context.ROLE_SERVICE);
            if (roleManager.isRoleAvailable(RoleManager.ROLE_DIALER) && !roleManager.isRoleHeld(RoleManager.ROLE_DIALER)) {
                Intent intent = roleManager.createRequestRoleIntent(RoleManager.ROLE_DIALER);
                intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                getReactApplicationContext().startActivity(intent);
                promise.resolve("Requested default dialer change.");
            } else {
                promise.reject("ERROR", "Role not available or already held.");
            }
        } else {
            Intent intent = new Intent(TelecomManager.ACTION_CHANGE_DEFAULT_DIALER)
                .putExtra(TelecomManager.EXTRA_CHANGE_DEFAULT_DIALER_PACKAGE_NAME, reactContext.getPackageName());
            if (intent.resolveActivity(reactContext.getPackageManager()) != null) {
                reactContext.startActivity(intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK));
                promise.resolve("Requested default dialer change.");
            } else {
                promise.reject("ERROR", "Unable to request default dialer change.");
            }
        }
    }

    @ReactMethod
    public void setMuteOn(Promise promise) {
        AudioManager audioManager = (AudioManager) reactContext.getSystemService(Context.AUDIO_SERVICE);
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
        try {
            Call currentCall = MyInCallService.getCurrentCall();
            if (currentCall != null && currentCall.getState() == Call.STATE_RINGING) {
                currentCall.reject(false, null);
                promise.resolve("Call rejected successfully.");
            } else {
                promise.reject("ERROR", "No ringing call available.");
            }
        } catch (Exception e) {
            promise.reject("ERROR", "Failed to reject call: " + e.getMessage());
        }
   
    }

    @ReactMethod
    public void endCall(Promise promise) {
        try {
            CallManagerConnectionService.disconnectActiveConnection();
            promise.resolve("Call ended successfully.");
        } catch (Exception e) {
            promise.reject("ERROR", "Failed to end call: " + e.getMessage());
        }

    }

    @ReactMethod
    public void bringAppToForeground() {
        PackageManager pm = getReactApplicationContext().getPackageManager();
        Intent intent = pm.getLaunchIntentForPackage(getReactApplicationContext().getPackageName());
    
        if (intent != null) {
            intent.addFlags(Intent.FLAG_ACTIVITY_SINGLE_TOP | Intent.FLAG_ACTIVITY_CLEAR_TOP | Intent.FLAG_ACTIVITY_NEW_TASK);
            getReactApplicationContext().startActivity(intent);
        }
    }
    @ReactMethod
    public void bringAppToForeground_V2(String PackageName) {
        PowerManager.WakeLock screenLock = ((PowerManager) getReactApplicationContext().getSystemService(POWER_SERVICE)).newWakeLock(
                PowerManager.SCREEN_BRIGHT_WAKE_LOCK | PowerManager.ACQUIRE_CAUSES_WAKEUP, "TAG");
        screenLock.acquire();

        screenLock.release();
        KeyguardManager km = (KeyguardManager) getReactApplicationContext().getSystemService(Context.KEYGUARD_SERVICE);
        final KeyguardManager.KeyguardLock kl = km.newKeyguardLock("MyKeyguardLock");
        kl.disableKeyguard();

    //  Intent dialogIntent = new Intent(getReactApplicationContext(), MainActivity.class);
        Intent dialogIntent = getReactApplicationContext().getPackageManager().getLaunchIntentForPackage(PackageName);

        dialogIntent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
        dialogIntent.addFlags(WindowManager.LayoutParams.FLAG_SHOW_WHEN_LOCKED +
                WindowManager.LayoutParams.FLAG_DISMISS_KEYGUARD +
                //      WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON +
                WindowManager.LayoutParams.FLAG_TURN_SCREEN_ON);
        getReactApplicationContext().startActivity(dialogIntent);
    }



    @ReactMethod
    public void enableSpeaker(Promise promise) {
        AudioManager audioManager = (AudioManager) reactContext.getSystemService(Context.AUDIO_SERVICE);
        if (audioManager != null) {
            audioManager.setSpeakerphoneOn(true);
            promise.resolve("Speaker enabled.");
        } else {
            promise.reject("ERROR", "Audio manager not available.");
        }
    }

    @ReactMethod
    public void disableSpeaker(Promise promise) {
        AudioManager audioManager = (AudioManager) reactContext.getSystemService(Context.AUDIO_SERVICE);
        if (audioManager != null) {
            audioManager.setSpeakerphoneOn(false);
            promise.resolve("Speaker disabled.");
        } else {
            promise.reject("ERROR", "Audio manager not available.");
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
        if (telephonyManager != null && callDetectionPhoneStateListener != null) {
            telephonyManager.listen(callDetectionPhoneStateListener, PhoneStateListener.LISTEN_NONE);
        }
        if (activity != null) {
            activity.getApplication().unregisterActivityLifecycleCallbacks(this);
            activity = null;
        }
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

    // Other methods as previously defined but refined for better readability and error handling

    @Override
    public void onActivityCreated(Activity activity, Bundle savedInstanceState) {
        // Implement as necessary
    }

    @Override
    public void onActivityStarted(Activity activity) {
        // Implement as necessary
    }

    @Override
    public void onActivityResumed(Activity activity) {
        // Implement as necessary
    }

    @Override
    public void onActivityPaused(Activity activity) {
        // Implement as necessary
    }

    @Override
    public void onActivityStopped(Activity activity) {
        // Implement as necessary
    }

    @Override
    public void onActivitySaveInstanceState(Activity activity, Bundle outState) {
        // Implement as necessary
    }

    @Override
    public void onActivityDestroyed(Activity activity) {
        // Implement as necessary
    }
}

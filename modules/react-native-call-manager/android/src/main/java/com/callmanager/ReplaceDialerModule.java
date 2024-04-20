package com.callmanager;

import android.app.Activity;

import android.view.Window;
import android.view.WindowManager;
import android.os.Bundle;

import android.content.Context;
import android.content.Intent;
import android.util.Log;

import com.facebook.react.bridge.*;
import com.facebook.react.ReactActivity;

import com.facebook.react.ReactPackage;
import com.facebook.react.bridge.NativeModule;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.uimanager.ViewManager;
import com.facebook.react.bridge.Callback;


import android.telecom.TelecomManager;

public class ReplaceDialerModule extends ReactContextBaseJavaModule implements ActivityEventListener {
    ReactApplicationContext mContext;
    private Callback myCallback;
    private boolean callbackInvoked = false;

    private static String LOG = "com.callmanager.ReplaceDialerModule";

    // for default dialer
    private TelecomManager telecomManager;
    private static final int RC_DEFAULT_PHONE = 3289;
    private static final int RC_PERMISSION = 3810;

    private static final int REQUEST_CODE_SET_DEFAULT_DIALER = 123;

    public ReplaceDialerModule(ReactApplicationContext context) {
        super(context);
        this.mContext = context;
        this.mContext.addActivityEventListener(this);
    }

    @Override
    public String getName() {
        return "ReplaceDialerModule";
    }

    @ReactMethod
    public void isDefaultDialer(Callback myCallback) {
        Log.w(LOG, "isDefaultDialer()");

        if (android.os.Build.VERSION.SDK_INT < android.os.Build.VERSION_CODES.M)
        {
            myCallback.invoke(true);
            return;
        }

        TelecomManager telecomManager = (TelecomManager) this.mContext.getSystemService(Context.TELECOM_SERVICE);

        if (telecomManager.getDefaultDialerPackage().equals(this.mContext.getPackageName())) 
        {
            Log.w(LOG, "invoke(true)");
            myCallback.invoke(true);
        }
        else
        {
            Log.w(LOG, "invoke(false)");
            myCallback.invoke(false);
        }
    }

    @Override
    public void onActivityResult(Activity activity, int requestCode, int resultCode, Intent intent) {
        if (!callbackInvoked) {
            if (requestCode == RC_DEFAULT_PHONE) {
                if (resultCode == Activity.RESULT_OK) {
                    callbackInvoked = true;
                    myCallback.invoke(true); // Success
                } else {
                    callbackInvoked = true;
                    myCallback.invoke(false); // Failure or cancellation
                }
            }
        }
    }

    
    @ReactMethod
    public void setDefaultDialer(Callback callback) {
        Log.w(LOG, "setDefaultDialer() " + this.mContext.getPackageName());
        this.myCallback = callback;
        this.callbackInvoked = false;

        // Create the intent to prompt the user to select the default dialer
        Intent intent = new Intent(TelecomManager.ACTION_CHANGE_DEFAULT_DIALER);
        intent.putExtra(TelecomManager.EXTRA_CHANGE_DEFAULT_DIALER_PACKAGE_NAME, this.mContext.getPackageName());

        // Run on the UI thread
        mContext.getCurrentActivity().runOnUiThread(new Runnable() {
            @Override
            public void run() {
                // Start the activity and expect a result to be returned to onActivityResult
                if (mContext.getCurrentActivity() != null) {
                    mContext.getCurrentActivity().startActivityForResult(intent, RC_DEFAULT_PHONE, new Bundle());
                    myCallback.invoke(true);
                } else {
                    Log.e(LOG, "Unable to get current activity.");
                    myCallback.invoke(false); // Inform JavaScript that the operation failed
                }
            }
        });
    }


    @Override
    public void onNewIntent(Intent intent) {
        if (mContext.getCurrentActivity() != null) {
            mContext.getCurrentActivity().setIntent(intent);
        }
    }

}
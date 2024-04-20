package com.callmanager;

import android.app.Activity;

import android.view.Window;
import android.view.WindowManager;
import android.os.Bundle;

import android.content.Context;
import android.content.Intent;
import android.os.Build;
import android.util.Log;
import android.content.DialogInterface;
import android.app.AlertDialog;
import android.widget.Toast;
import android.app.role.RoleManager;

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
    private static final int REQUEST_ID = 1;

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

        if (android.os.Build.VERSION.SDK_INT < android.os.Build.VERSION_CODES.M) {
            myCallback.invoke(true);
            return;
        }

        TelecomManager telecomManager = (TelecomManager) this.mContext.getSystemService(Context.TELECOM_SERVICE);

        if (telecomManager.getDefaultDialerPackage().equals(this.mContext.getPackageName())) {
            Log.w(LOG, "invoke(true)");
            myCallback.invoke(true);
        } else {
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

        // Run on the UI thread
        mContext.getCurrentActivity().runOnUiThread(new Runnable() {
            @Override
            public void run() {
                // Create the intent to prompt the user to select the default dialer
                Intent intent = new Intent(TelecomManager.ACTION_CHANGE_DEFAULT_DIALER);
                intent.putExtra(TelecomManager.EXTRA_CHANGE_DEFAULT_DIALER_PACKAGE_NAME, mContext.getPackageName());

                // Check if the activity is running
                Activity currentActivity = mContext.getCurrentActivity();
                if (currentActivity == null || currentActivity.isFinishing()) {
                    Log.e(LOG, "Activity is not running. Cannot show dialog.");
                    myCallback.invoke(false); // Inform JavaScript that the operation failed
                    callbackInvoked = true; // Set callbackInvoked to true
                    return;
                }

                // Create the dialog
                new AlertDialog.Builder(currentActivity)
                        .setMessage("Do you want to make " + mContext.getPackageName() + " your default dialer?")
                        .setCancelable(false)
                        .setPositiveButton("Yes", new DialogInterface.OnClickListener() {
                            public void onClick(DialogInterface dialog, int id) {
                                // Start the activity and expect a result to be returned to onActivityResult
                                if (mContext.getCurrentActivity() != null) {
                                    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                                        RoleManager roleManager = (RoleManager) mContext
                                                .getSystemService(Context.ROLE_SERVICE);
                                        if (roleManager.isRoleAvailable(RoleManager.ROLE_DIALER)
                                                && !roleManager.isRoleHeld(RoleManager.ROLE_DIALER)) {
                                            Intent intent = roleManager
                                                    .createRequestRoleIntent(RoleManager.ROLE_DIALER);
                                            mContext.getCurrentActivity().startActivityForResult(intent, REQUEST_ID);
                                            mContext.getCurrentActivity().startActivityForResult(
                                                    roleManager.createRequestRoleIntent(RoleManager.ROLE_DIALER), 120);
                                            myCallback.invoke(true);
                                            callbackInvoked = true;
                                        } else {
                                            myCallback.invoke(false);
                                            callbackInvoked = true;
                                        }
                                    } else {
                                        Intent intent = new Intent(TelecomManager.ACTION_CHANGE_DEFAULT_DIALER)
                                                .putExtra(TelecomManager.EXTRA_CHANGE_DEFAULT_DIALER_PACKAGE_NAME,
                                                        mContext.getPackageName());
                                        if (intent.resolveActivity(mContext.getPackageManager()) != null) {
                                            mContext.getCurrentActivity().startActivityForResult(intent,
                                                    RC_DEFAULT_PHONE, new Bundle()); // Use startActivityForResult for
                                                                                     // Android versions less than Q
                                            myCallback.invoke(true); // Inform JavaScript that the operation was
                                                                     // successful
                                            callbackInvoked = true; // Set callbackInvoked to true
                                        } else {
                                            Log.e(LOG,
                                                    "Unable to resolve activity for ACTION_CHANGE_DEFAULT_DIALER intent.");
                                            myCallback.invoke(false); // Inform JavaScript that the operation failed
                                            callbackInvoked = true; // Set callbackInvoked to true
                                        }
                                    }
                                } else {
                                    Log.e(LOG, "Unable to get current activity.");
                                    myCallback.invoke(false); // Inform JavaScript that the operation failed
                                    callbackInvoked = true; // Set callbackInvoked to true
                                }
                            }
                        })
                        .setNegativeButton("No", new DialogInterface.OnClickListener() {
                            public void onClick(DialogInterface dialog, int id) {
                                dialog.cancel();
                                Toast.makeText(mContext, "Cancelled - No action was taken", Toast.LENGTH_SHORT).show();
                            }
                        })
                        .create()
                        .show();
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
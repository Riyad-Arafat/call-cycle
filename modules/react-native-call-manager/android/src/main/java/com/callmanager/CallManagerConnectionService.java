package com.callmanager;

import android.telecom.Connection;
import android.telecom.ConnectionRequest;
import android.telecom.ConnectionService;
import android.telecom.PhoneAccountHandle;
import android.telecom.TelecomManager;
import android.util.Log;

import com.facebook.react.bridge.ReactApplicationContext;

public class CallManagerConnectionService extends ConnectionService {
    private static final String TAG = "CallManagerService";
    private ReactApplicationContext reactContext;

    public CallManagerConnectionService(ReactApplicationContext reactContext) {
        this.reactContext = reactContext;
    }

    @Override
    public Connection onCreateOutgoingConnection(PhoneAccountHandle connectionManagerPhoneAccount, ConnectionRequest request) {
        try {
            CallManagerConnection connection = new CallManagerConnection(reactContext);
            connection.setAddress(request.getAddress(), TelecomManager.PRESENTATION_ALLOWED);
            connection.setDialing();
            return connection;
        } catch (Exception e) {
            Log.e(TAG, "Failed to create outgoing connection", e);
            return null;
        }
    }

    @Override
    public Connection onCreateIncomingConnection(PhoneAccountHandle connectionManagerPhoneAccount, ConnectionRequest request) {
        try {
            CallManagerConnection connection = new CallManagerConnection(reactContext);
            connection.setAddress(request.getAddress(), TelecomManager.PRESENTATION_ALLOWED);
            connection.setRinging();
            return connection;
        } catch (Exception e) {
            Log.e(TAG, "Failed to create incoming connection", e);
            return null;
        }
    }
}
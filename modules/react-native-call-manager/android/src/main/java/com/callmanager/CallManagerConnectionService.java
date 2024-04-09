package com.callmanager;

import android.telecom.Connection;
import android.telecom.ConnectionRequest;
import android.telecom.ConnectionService;
import android.telecom.PhoneAccountHandle;
import android.telecom.TelecomManager;
import android.util.Log;
import android.content.ContentResolver;
import android.database.Cursor;
import android.net.Uri;
import android.provider.ContactsContract;
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
            String callerName = getCallerNameFromContacts(request.getAddress());
            connection.setCallerDisplayName(callerName, TelecomManager.PRESENTATION_ALLOWED);
            connection.setConnectionProperties(Connection.PROPERTY_SELF_MANAGED);
            connection.setConnectionCapabilities(Connection.CAPABILITY_HOLD | Connection.CAPABILITY_SUPPORT_HOLD);
            connection.setDialing();
            return connection;
        } catch (Exception e) {
            Log.e(TAG, "Failed to create outgoing connection", e);
            return null;
        }
    }

    @Override
    public void onCreateOutgoingConnectionFailed(PhoneAccountHandle connectionManagerPhoneAccount, ConnectionRequest request) {
        Log.e(TAG, "Failed to create outgoing connection");
    }

    @Override
    public Connection onCreateIncomingConnection(PhoneAccountHandle connectionManagerPhoneAccount, ConnectionRequest request) {
        try {
            CallManagerConnection connection = new CallManagerConnection(reactContext);
            connection.setAddress(request.getAddress(), TelecomManager.PRESENTATION_ALLOWED);
            String callerName = getCallerNameFromContacts(request.getAddress());
            connection.setCallerDisplayName(callerName, TelecomManager.PRESENTATION_ALLOWED);
            connection.setConnectionProperties(Connection.PROPERTY_SELF_MANAGED);
            connection.setConnectionCapabilities(Connection.CAPABILITY_HOLD | Connection.CAPABILITY_SUPPORT_HOLD);
            connection.setRinging();
            return connection;
        } catch (Exception e) {
            Log.e(TAG, "Failed to create incoming connection", e);
            return null;
        }
    }

    private String getCallerNameFromContacts(Uri phoneNumber) {
        ContentResolver contentResolver = reactContext.getContentResolver();
        String callerName = phoneNumber.toString();

        try (Cursor cursor = contentResolver.query(
                ContactsContract.PhoneLookup.CONTENT_FILTER_URI,
                new String[]{ContactsContract.PhoneLookup.DISPLAY_NAME},
                null,
                new String[]{phoneNumber.toString()},
                null)) {

            if (cursor != null && cursor.moveToFirst()) {
                callerName = cursor.getString(cursor.getColumnIndex(ContactsContract.PhoneLookup.DISPLAY_NAME));
            }
        } catch (Exception e) {
            Log.e(TAG, "Failed to lookup contact name", e);
        }

        return callerName;
    }
}
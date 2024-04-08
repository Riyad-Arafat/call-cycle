package com.callmanager;

import android.telecom.Connection;
import android.telecom.ConnectionRequest;
import android.telecom.ConnectionService;
import android.telecom.PhoneAccountHandle;
import android.telecom.TelecomManager;

public class CallManagerConnectionService extends ConnectionService {

    @Override
    public Connection onCreateOutgoingConnection(PhoneAccountHandle connectionManagerPhoneAccount, ConnectionRequest request) {
        CallManagerConnection connection = new CallManagerConnection();
        connection.setAddress(request.getAddress(), TelecomManager.PRESENTATION_ALLOWED);
        connection.setDialing();
        // You can set more properties on the connection here
        // For example, connection.setCallerDisplayName("Caller Name", TelecomManager.PRESENTATION_ALLOWED)
        return connection;
    }

    @Override
    public Connection onCreateIncomingConnection(PhoneAccountHandle connectionManagerPhoneAccount, ConnectionRequest request) {
        CallManagerConnection connection = new CallManagerConnection();
        connection.setAddress(request.getAddress(), TelecomManager.PRESENTATION_ALLOWED);
        connection.setRinging();
        // Implement your logic for incoming calls
        // For example, show your own UI or handle the call in some way
        return connection;
    }
}

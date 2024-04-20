package com.callmanager;

import android.telecom.Connection;
import android.telecom.ConnectionRequest;
import android.telecom.ConnectionService;
import android.telecom.PhoneAccountHandle;
import android.telecom.TelecomManager; // Add this import
import android.telecom.DisconnectCause;
import android.net.Uri;

public class CallManagerConnectionService extends ConnectionService {
    private static Connection activeConnection; 

    @Override
    public Connection onCreateOutgoingConnection(PhoneAccountHandle connectionManagerPhoneAccount, ConnectionRequest request) {
        Uri address = request.getAddress();
        Connection connection = new Connection() {
            @Override
            public void onShowIncomingCallUi() {
                super.onShowIncomingCallUi();
                // Show your own UI here if needed.
            }

            @Override
            public void onDisconnect() {
                super.onDisconnect();
                // Call setDisconnected when the call is disconnected
                this.setDisconnected(new DisconnectCause(DisconnectCause.LOCAL));
                // Call destroy to clean up the call
                this.destroy();
            }

        };
        
        connection.setAddress(address, TelecomManager.PRESENTATION_ALLOWED);
        connection.setCallerDisplayName("Call Manager", TelecomManager.PRESENTATION_ALLOWED);
        connection.setDialing();
        
        // Set up the connection properties or capabilities, such as local video.
        connection.setConnectionCapabilities(Connection.CAPABILITY_MUTE | Connection.CAPABILITY_SUPPORT_HOLD);
        connection.setVideoProvider(null); // Set this if you're supporting video calls.

        // This is where you handle the actual connection.
        // You may initiate an outgoing call here with a media session or similar.
        activeConnection = connection;
        return connection;
    }

    @Override
    public void onCreateIncomingConnectionFailed(PhoneAccountHandle phoneAccountHandle, ConnectionRequest request) {
        super.onCreateIncomingConnectionFailed(phoneAccountHandle, request);
        // Handle failure of incoming connection creation.
    }

    @Override
    public void onCreateOutgoingConnectionFailed(PhoneAccountHandle phoneAccountHandle, ConnectionRequest request) {
        super.onCreateOutgoingConnectionFailed(phoneAccountHandle, request);
        // Handle failure of outgoing connection creation.
    }


    public Connection getActiveConnection() {
        return activeConnection;
    }


    public static void disconnectActiveConnection() {
        if (activeConnection != null) {
            activeConnection.onDisconnect();
        }
    }

    
}
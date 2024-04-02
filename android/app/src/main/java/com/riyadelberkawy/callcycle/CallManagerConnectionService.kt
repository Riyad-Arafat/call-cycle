
package com.riyadelberkawy.callcycle

import android.telecom.Connection
import android.telecom.ConnectionRequest
import android.telecom.ConnectionService
import android.telecom.DisconnectCause
import android.telecom.PhoneAccountHandle
import android.telecom.TelecomManager

class CallManagerConnectionService : ConnectionService() {
    override fun onCreateOutgoingConnection(
        connectionManagerPhoneAccount: PhoneAccountHandle,
        request: ConnectionRequest
    ): Connection {
        val connection = CallManagerConnection()
        connection.setAddress(request.address, TelecomManager.PRESENTATION_ALLOWED)
        connection.setDialing()
        // You can set more properties on the connection here
        // For example, connection.setCallerDisplayName("Caller Name", TelecomManager.PRESENTATION_ALLOWED)
        return connection
    }

    override fun onCreateIncomingConnection(
        connectionManagerPhoneAccount: PhoneAccountHandle,
        request: ConnectionRequest
    ): Connection {
        val connection = CallManagerConnection()
        connection.setAddress(request.address, TelecomManager.PRESENTATION_ALLOWED)
        connection.setRinging()
        // Implement your logic for incoming calls
        // For example, show your own UI or handle the call in some way
        return connection
    }
}



package com.riyadelberkawy.callcycle

import android.telecom.Connection
import android.telecom.DisconnectCause

class CallManagerConnection : Connection() {
    override fun onShowIncomingCallUi() {
        // Don't call super.onShowIncomingCallUi() to prevent the native UI from showing
        // Handle showing incoming call UI here
        // For example, you can show a custom UI using your own logic
    }

    override fun onAnswer() {
        super.onAnswer()
        // Handle the answer action
        setActive() // Set the call to active state
    }

    override fun onReject() {
        super.onReject()
        // Handle the reject action
        setDisconnected(DisconnectCause(DisconnectCause.REJECTED))
        destroy()
    }

    // Implement other call actions like onHold, onUnhold, onDisconnect, etc.
    override fun onHold() {
        super.onHold()
        // Handle the hold action
        setOnHold()
    }

    override fun onUnhold() {
        super.onUnhold()
        // Handle the unhold action
        setActive()
    }

    override fun onDisconnect() {
        super.onDisconnect()
        // Handle the disconnect action
        setDisconnected(DisconnectCause(DisconnectCause.LOCAL))
        destroy()
    }
}


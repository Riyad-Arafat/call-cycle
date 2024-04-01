package com.riyadelberkawy.callcycle;


import android.telecom.Connection;
import android.telecom.DisconnectCause;

public class CallManagerConnection extends Connection {
    @Override
    public void onShowIncomingCallUi() {
        // Don't call super.onShowIncomingCallUi() to prevent the native UI from showing
        // Handle showing incoming call UI here
        // For example, you can show a custom UI using your own logic
    }

    @Override
    public void onAnswer() {
        super.onAnswer();
        // Handle the answer action
        setActive();  // Set the call to active state
    }

    @Override
    public void onReject() {
        super.onReject();
        // Handle the reject action
        setDisconnected(new DisconnectCause(DisconnectCause.REJECTED));
        destroy();
    }

    // Implement other call actions like onHold, onUnhold, onDisconnect, etc.
    @Override
    public void onHold() {
        super.onHold();
        // Handle the hold action
        setOnHold();
    }

    @Override
    public void onUnhold() {
        super.onUnhold();
        // Handle the unhold action
        setActive();
    }

    @Override
    public void onDisconnect() {
        super.onDisconnect();
        // Handle the disconnect action
        setDisconnected(new DisconnectCause(DisconnectCause.LOCAL));
        destroy();
    }
}



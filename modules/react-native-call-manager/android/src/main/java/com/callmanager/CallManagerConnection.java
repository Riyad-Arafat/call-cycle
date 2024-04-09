package com.callmanager;

import android.telecom.Connection;
import android.telecom.DisconnectCause;
import android.telecom.CallAudioState;
import android.media.AudioManager;
import android.content.Context;
import com.facebook.react.bridge.ReactApplicationContext;
import android.util.Log;

public class CallManagerConnection extends Connection {
    private static final String TAG = "CallManagerConnection";
    private AudioManager audioManager;
    ReactApplicationContext reactContext = null;
    CallManagerConnection connection = new CallManagerConnection(reactContext);

    public CallManagerConnection(ReactApplicationContext reactContext) {
        this.reactContext = reactContext;
    }

    @Override
    public void onShowIncomingCallUi() {
    Log.d(TAG, "onShowIncomingCallUi");
        // Show your incoming call UI here
    }

    @Override
    public void onCallAudioStateChanged(CallAudioState state) {
        Log.d(TAG, "onCallAudioStateChanged");
        // Handle audio state changes here
    }

    @Override
    public void onHold() {
        super.onHold();
        // Put the call on hold here
    }

    @Override
    public void onUnhold() {
        super.onUnhold();
        // Resume the call here
    }

    @Override
    public void onAnswer() {
        super.onAnswer();
        setActive(); // Set the call to active state

        if(reactContext == null) {
            Log.e(TAG, "ReactContext is null");
            return;
        }

        audioManager = (AudioManager) reactContext.getSystemService(Context.AUDIO_SERVICE);
        audioManager.setMode(AudioManager.MODE_IN_CALL);
        audioManager.requestAudioFocus(null, AudioManager.STREAM_VOICE_CALL, AudioManager.AUDIOFOCUS_GAIN);
    }

    @Override
    public void onReject() {
        super.onReject();
        setDisconnected(new DisconnectCause(DisconnectCause.REJECTED));
        destroy(); // Clean up the call
    }

    @Override
    public void onDisconnect() {
        super.onDisconnect();
        setDisconnected(new DisconnectCause(DisconnectCause.LOCAL));

        if (audioManager != null) {
            audioManager.abandonAudioFocus(null);
            audioManager.setMode(AudioManager.MODE_NORMAL);
        }
        destroy(); // Clean up the call
    }
}
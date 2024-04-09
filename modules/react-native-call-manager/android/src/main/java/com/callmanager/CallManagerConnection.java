package com.callmanager;

import android.telecom.Connection;
import android.telecom.DisconnectCause;
import android.media.AudioManager;

public class CallManagerConnection extends Connection {
    private AudioManager audioManager;

    @Override
    public void onAnswer() {
        super.onAnswer();
        setActive(); // Set the call to active state

        audioManager = (AudioManager) getContext().getSystemService(Context.AUDIO_SERVICE);
        audioManager.setMode(AudioManager.MODE_IN_CALL);
        audioManager.requestAudioFocus(null, AudioManager.STREAM_VOICE_CALL, AudioManager.AUDIOFOCUS_GAIN);
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
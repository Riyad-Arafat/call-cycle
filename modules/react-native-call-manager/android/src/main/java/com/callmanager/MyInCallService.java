package com.callmanager;

import android.telecom.Call;
import android.telecom.InCallService;
import android.content.Intent;
import android.util.Log;

public class MyInCallService extends InCallService {
    private static Call currentCall = null;
    private static InCallService sInstance;

    @Override
    public void onCallAdded(Call call) {
        super.onCallAdded(call);
        currentCall = call;
        sInstance = this;
        Intent intent = new Intent(this, MyReactActivity.class);
        intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
        startActivity(intent);
        Log.d("MyInCallService", "FROM CallManager: onCallAdded");

    }

    @Override
    public void onCallRemoved(Call call) {
        super.onCallRemoved(call);
        if (currentCall == call) {
            currentCall = null;
        }
    }

    public static Call getCurrentCall() {
        return currentCall;
    }

    public static InCallService getInstance() {
        return sInstance;
    }

}
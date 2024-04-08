package com.callmanager;

import android.telecom.Call;
import android.telecom.InCallService;

public class MyInCallService extends InCallService {
    private static Call currentCall = null;

    @Override
    public void onCallAdded(Call call) {
        super.onCallAdded(call);
        currentCall = call;
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
}

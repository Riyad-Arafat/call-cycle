package com.riyadelberkawy.callcycle;

import android.telecom.Call;
import android.telecom.InCallService;

public class MyInCallService extends InCallService {
    private static Call currentCall;

    @Override
    public void onCallAdded(Call call) {
        super.onCallAdded(call);
        MyInCallService.currentCall = call;
    }

    @Override
    public void onCallRemoved(Call call) {
        super.onCallRemoved(call);
        MyInCallService.currentCall = null;
    }

    public static Call getCurrentCall() {
        return currentCall;
    }
}
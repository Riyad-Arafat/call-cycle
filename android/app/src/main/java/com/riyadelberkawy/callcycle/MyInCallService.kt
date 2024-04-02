
package com.riyadelberkawy.callcycle

import android.telecom.Call
import android.telecom.InCallService

class MyInCallService : InCallService() {
    companion object {
        private var currentCall: Call? = null
    }

    override fun onCallAdded(call: Call) {
        super.onCallAdded(call)
        currentCall = call
    }

    override fun onCallRemoved(call: Call) {
        super.onCallRemoved(call)
        if (currentCall == call) {
            currentCall = null
        }
    }

    fun getCurrentCall(): Call? {
        return currentCall  
    }
}


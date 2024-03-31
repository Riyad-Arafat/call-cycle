package com.riyadelberkawy.callcycle

import android.content.Context
import android.telecom.TelecomManager
import android.content.Intent
import android.net.Uri
import android.telephony.PhoneStateListener
import android.telephony.TelephonyManager
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.modules.core.DeviceEventManagerModule

class CallManagerModule(private val reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {
   
    private var telephonyManager: TelephonyManager? = null
    private var callStateListener: CallStateListener? = null

    init {
        telephonyManager = reactContext.getSystemService(Context.TELEPHONY_SERVICE) as TelephonyManager
    }

    override fun getName(): String {
        return "CallManager"
    }

    @ReactMethod
    fun startCallStateListener() {
        callStateListener = CallStateListener(reactContext)
        telephonyManager?.listen(callStateListener, PhoneStateListener.LISTEN_CALL_STATE)
    }

    @ReactMethod
    fun stopCallStateListener() {
        telephonyManager?.listen(callStateListener, PhoneStateListener.LISTEN_NONE)
    }

    private class CallStateListener(val reactContext: ReactApplicationContext) : PhoneStateListener() {
        private var lastState = TelephonyManager.CALL_STATE_IDLE

        override fun onCallStateChanged(state: Int, incomingNumber: String?) {
            super.onCallStateChanged(state, incomingNumber)

            if (lastState == TelephonyManager.CALL_STATE_RINGING && state == TelephonyManager.CALL_STATE_OFFHOOK) {
                // Call was answered
                val params = Arguments.createMap()
                params.putString("event", "callAnswered")
                reactContext
                    .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
                    .emit("callEvent", params)
            } else if (state == TelephonyManager.CALL_STATE_IDLE && lastState != TelephonyManager.CALL_STATE_IDLE) {
                // Call ended
                val params = Arguments.createMap()
                params.putString("event", "callEnded")
                reactContext
                    .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
                    .emit("callEvent", params)
            }

            lastState = state
        }
    }

    @ReactMethod
    fun makeCall(phoneNumber: String, promise: Promise) {
        try {
            val telecomManager = reactContext.getSystemService(Context.TELECOM_SERVICE) as TelecomManager?
            if (telecomManager != null) {
                val intent = Intent(Intent.ACTION_CALL)
                intent.data = Uri.parse("tel:$phoneNumber")
                intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
                reactContext.startActivity(intent)
                promise.resolve("Call initiated successfully.")
            } else {
                promise.reject("ERROR", "Unable to get TelecomManager.")
            }
        } catch (e: Exception) {
            promise.reject("ERROR", "Call initiation failed: ${e.message}")
        }
    }

    @ReactMethod
    fun answerCall(promise: Promise) {
        try {
            try {
                val telecomManager = reactContext.getSystemService(Context.TELECOM_SERVICE) as TelecomManager?
                if (telecomManager != null) {
                    telecomManager.acceptRingingCall()
                    promise.resolve("Call answered successfully.")
                } else {
                    promise.reject("ERROR", "Unable to get TelecomManager.")
                }
            } catch (e: Exception) {
                promise.reject("ERROR", "Failed to answer the call: ${e.message}")
            }
            promise.resolve("Call answered successfully.")
        } catch (e: Exception) {
            promise.reject("ERROR", "Failed to answer the call: ${e.message}")
        }
    }

    @ReactMethod
    fun rejectCall(promise: Promise) {
        try {
            val telecomManager = reactContext.getSystemService(Context.TELECOM_SERVICE) as TelecomManager?
            if (telecomManager != null) {
                telecomManager.endCall()
                promise.resolve("Call rejected successfully.")
            } else {
                promise.reject("ERROR", "Unable to get TelecomManager.")
            }
            promise.resolve("Call rejected successfully.")
        } catch (e: Exception) {
            promise.reject("ERROR", "Failed to reject the call: ${e.message}")
        }
    }
}


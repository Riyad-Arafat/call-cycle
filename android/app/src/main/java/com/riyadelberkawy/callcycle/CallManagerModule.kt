
package com.riyadelberkawy.callcycle

import android.content.Context
import android.content.Intent
import android.net.Uri
import android.telephony.PhoneStateListener
import android.telephony.TelephonyManager
import androidx.core.app.ActivityCompat
import android.Manifest
import android.content.pm.PackageManager
import android.telecom.TelecomManager
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.Arguments
import com.facebook.react.modules.core.DeviceEventManagerModule.RCTDeviceEventEmitter
import android.telecom.Call
import android.telecom.VideoProfile
import android.media.AudioManager

class CallManagerModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {
    private var telephonyManager: TelephonyManager? = null
    private var lastState = TelephonyManager.CALL_STATE_IDLE

    init {
        telephonyManager = reactContext.getSystemService(Context.TELEPHONY_SERVICE) as TelephonyManager
        telephonyManager?.listen(callStateListener, PhoneStateListener.LISTEN_CALL_STATE)
    }

    private val callStateListener = object : PhoneStateListener() {
        override fun onCallStateChanged(state: Int, incomingNumber: String) {
            super.onCallStateChanged(state, incomingNumber)
            val params = Arguments.createMap()
            when (state) {
                TelephonyManager.CALL_STATE_RINGING -> {
                    params.putString("event", "incomingCall")
                    params.putString("incomingNumber", incomingNumber)
                }
                TelephonyManager.CALL_STATE_OFFHOOK -> {
                    if (lastState == TelephonyManager.CALL_STATE_RINGING) {
                        params.putString("event", "callAnswered")
                    }
                }
                TelephonyManager.CALL_STATE_IDLE -> {
                    if (lastState == TelephonyManager.CALL_STATE_RINGING) {
                        params.putString("event", "callRejected")
                    } else if (lastState == TelephonyManager.CALL_STATE_OFFHOOK) {
                        params.putString("event", "callEnded")
                    }
                }
            }
            if (params.hasKey("event")) {
                reactApplicationContext.getJSModule(RCTDeviceEventEmitter::class.java).emit("callEvent", params)
            }
            lastState = state
        }
    }

    override fun getName(): String {
        return "CallManager"
    }

    @ReactMethod
    fun call(phoneNumber: String, promise: Promise) {
        try {
            val intent = Intent(Intent.ACTION_CALL)
            intent.data = Uri.parse("tel:$phoneNumber")
            intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            if (ActivityCompat.checkSelfPermission(reactApplicationContext, Manifest.permission.CALL_PHONE) == PackageManager.PERMISSION_GRANTED) {
                reactApplicationContext.startActivity(intent)
                val currentCall = MyInCallService.getCurrentCall()
                promise.resolve(currentCall)
            } else {
                promise.reject("ERROR", "Call permission not granted.")
            }
        } catch (e: Exception) {
            promise.reject("ERROR", "Call initiation failed: ${e.message}")
        }
    }

    @ReactMethod
    fun setMuteOn(promise: Promise) {
        try {
            val audioManager = reactApplicationContext.getSystemService(Context.AUDIO_SERVICE) as AudioManager
            audioManager.isMicrophoneMute = true
            promise.resolve("Mute set to ON.")
        } catch (e: Exception) {
            promise.reject("ERROR", "Failed to set mute on: ${e.message}")
        }
    }

    @ReactMethod
    fun setMuteOff(promise: Promise) {
        try {
            val audioManager = reactApplicationContext.getSystemService(Context.AUDIO_SERVICE) as AudioManager
            audioManager.isMicrophoneMute = false
            promise.resolve("Mute set to OFF.")
        } catch (e: Exception) {
            promise.reject("ERROR", "Failed to set mute off: ${e.message}")
        }
    }

    @ReactMethod
    fun answerCall(promise: Promise) {
        try {
            val currentCall = MyInCallService.getCurrentCall()
            val currentCallState = currentCall?.details?.state
            if (currentCall != null && currentCallState == Call.STATE_RINGING) {
                currentCall.answer(VideoProfile.STATE_AUDIO_ONLY)
                promise.resolve("Call answered successfully.")
            } else {
                promise.reject("ERROR", "No ringing call.")
            }
        } catch (e: Exception) {
            promise.reject("ERROR", "Failed to answer the call: ${e.message}")
        }
    }

    @ReactMethod
    fun rejectCall(promise: Promise) {
        try {
            val currentCall = MyInCallService.getCurrentCall()
            if (currentCall != null) {
                currentCall.disconnect()
                promise.resolve("Call rejected successfully.")
            } else {
                promise.reject("ERROR", "No active call.")
            }
        } catch (e: Exception) {
            promise.reject("ERROR", "Failed to reject the call: ${e.message}")
        }
    }
}


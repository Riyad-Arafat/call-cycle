package expo.modules.callmanagermodule

import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import android.Manifest
import android.content.Context
import android.media.AudioManager
import android.net.Uri
import android.os.Bundle
import android.telecom.Call
import android.telecom.TelecomManager
import android.telecom.VideoProfile
import android.telephony.PhoneStateListener
import android.telephony.TelephonyManager
import android.util.Log
import androidx.core.app.ActivityCompat
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.modules.core.DeviceEventManagerModule.RCTDeviceEventEmitter


class CallManagerModule : Module() {
  // Each module class must implement the definition function. The definition consists of components
  // that describes the module's functionality and behavior.
  // See https://docs.expo.dev/modules/module-api for more details about available components.
  override fun definition() = ModuleDefinition {
    // Sets the name of the module that JavaScript code will use to refer to the module. Takes a string as an argument.
    // Can be inferred from module's class name, but it's recommended to set it explicitly for clarity.
    // The module will be accessible from `requireNativeModule('CallManagerModule')` in JavaScript.
    Name("CallManagerModule")

    AsyncFunction("call") { phoneNumber: String ->
      call(phoneNumber)
  }

  AsyncFunction("setMuteOn") {
      setMuteOn()
  }

  AsyncFunction("setMuteOff") {
      setMuteOff()
  }

  AsyncFunction("answerCall") {
      answerCall()
  }

  AsyncFunction("rejectCall") {
      rejectCall()
  }
    
  }
  private val telephonyManager: TelephonyManager = reactContext.getSystemService(Context.TELEPHONY_SERVICE) as TelephonyManager
  private val callStateListener: PhoneStateListener = createPhoneStateListener()
  private var lastState = TelephonyManager.CALL_STATE_IDLE

  init {
      telephonyManager.listen(callStateListener, PhoneStateListener.LISTEN_CALL_STATE)
  }

  private fun createPhoneStateListener(): PhoneStateListener {
      return object : PhoneStateListener() {
          override fun onCallStateChanged(state: Int, incomingNumber: String) {
              handleCallStateChanged(state, incomingNumber)
          }
      }
  }

  private fun handleCallStateChanged(state: Int, incomingNumber: String) {
      val params = Arguments.createMap()
      when (state) {
          TelephonyManager.CALL_STATE_RINGING -> {
              params.putString("event", "incomingCall")
              params.putString("incomingNumber", incomingNumber)
          }
          TelephonyManager.CALL_STATE_OFFHOOK -> if (lastState == TelephonyManager.CALL_STATE_RINGING) {
              params.putString("event", "callAnswered")
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
          reactContext.getJSModule(RCTDeviceEventEmitter::class.java).emit("callEvent", params)
      }
      lastState = state
  }

  override fun getName(): String {
      return "CallManagerModule"
  }

  @ReactMethod
  fun call(phoneNumber: String, promise: Promise) {
      val telecomManager = reactContext.getSystemService(Context.TELECOM_SERVICE) as TelecomManager?

      if (telecomManager != null && ActivityCompat.checkSelfPermission(reactContext, Manifest.permission.CALL_PHONE) == PackageManager.PERMISSION_GRANTED) {
          val uri = Uri.fromParts("tel", phoneNumber, null)
          val extras = Bundle()
          extras.putBoolean(TelecomManager.EXTRA_START_CALL_WITH_SPEAKERPHONE, true)
          try {
              telecomManager.placeCall(uri, extras)
              val currentCall = MyInCallService.getCurrentCall()
              if (currentCall != null) {
                  promise.resolve("Call placed successfully")
              } else {
                  promise.reject("ERROR", "Call placed but no current call information available.")
              }
          } catch (e: Exception) {
              promise.reject("ERROR", "Failed to place call: ${e.message}")
          }
      } else {
          promise.reject("ERROR", "Permission not granted or TelecomManager not available.")
      }
  }

  @ReactMethod
  fun setMuteOn(promise: Promise) {
      val audioManager = reactContext.getSystemService(Context.AUDIO_SERVICE) as AudioManager?
      if (audioManager != null) {
          audioManager.microphoneMute = true
          promise.resolve("Mute set to ON.")
      } else {
          promise.reject("ERROR", "Audio manager not available.")
      }
  }

  @ReactMethod
  fun setMuteOff(promise: Promise) {
      val audioManager = reactContext.getSystemService(Context.AUDIO_SERVICE) as AudioManager?
      if (audioManager != null) {
          audioManager.microphoneMute = false
          promise.resolve("Mute set to OFF.")
      } else {
          promise.reject("ERROR", "Audio manager not available.")
      }
  }

  @ReactMethod
  fun answerCall(promise: Promise) {
      val currentCall = MyInCallService.getCurrentCall()
      if (currentCall != null && currentCall.state == Call.STATE_RINGING) {
          currentCall.answer(VideoProfile.STATE_AUDIO_ONLY)
          promise.resolve("Call answered successfully.")
      } else {
          promise.reject("ERROR", "No ringing call available.")
      }
  }

  @ReactMethod
  fun rejectCall(promise: Promise) {
      val currentCall = MyInCallService.getCurrentCall()
      if (currentCall != null) {
          currentCall.disconnect()
          promise.resolve("Call rejected successfully.")
      } else {
          promise.reject("ERROR", "No active call to reject.")
      }
  }

  override fun finalize() {
      try {
          telephonyManager.listen(callStateListener, PhoneStateListener.LISTEN_NONE)
      } finally {
          super.finalize()
      }
  }

  companion object {
      var instance: CallManagerModule? = null
          private set

      fun getInstance(reactContext: ReactApplicationContext, realContext: Boolean): CallManagerModule {
          if (instance == null) {
              Log.d(TAG, "[CallManagerModule] getInstance : ${if (reactContext == null) "null" else "ok"}")
              instance = CallManagerModule(reactContext)
          }
          if (realContext) {
              instance!!.setContext(reactContext)
          }
          return instance!!
      }
  }

  fun setContext(reactContext: ReactApplicationContext) {
      Log.d(TAG, "[CallManagerModule] updating react context")
      this.reactContext = reactContext
  }




}

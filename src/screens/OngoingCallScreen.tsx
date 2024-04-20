import React, { useState, useEffect, useCallback } from "react";
import { View, Text, StyleSheet, AppRegistry } from "react-native";
import { IconButton } from "react-native-paper";
import CallManager from "react-native-call-manager";
import BackgroundTimer from "react-native-background-timer";
import useGlobal from "@hooks/useGlobal";

import * as Notifications from "expo-notifications";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

const OngoingCallScreen = () => {
  const { callInfo } = useGlobal();
  const [calling, setCalling] = useState(false);
  const [callTime, setCallTime] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeaker, setIsSpeaker] = useState(false);

  // Increment call time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCallTime((prevTime) => prevTime + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Format the call time into a MM:SS format
  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  const sendNotification = async () => {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "Call Started",
        body: `You are in a call with ${callInfo.name}`,
        data: { data: "goes here" },
      },
      trigger: null,
    });
  };

  useEffect(() => {
    console.log("Call Info: ", callInfo);
    if (callInfo.name) {
      setCalling(true);
      setCallTime(0);
      sendNotification(); // Send a notification when a call starts
    }
  }, [callInfo]);

  useEffect(() => {
    const subscription = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        const { action } = response.notification.request.content.data;
        if (action === "goes here") console.log("User pressed the action");
      }
    );

    return () => subscription.remove();
  }, []);

  useEffect(() => {
    BackgroundTimer.start();
    CallManager.onStateChange((event, number) => {
      console.log("Event: ", event);
      console.log("Number: ", number);

      if (event === "Disconnected") {
        setCalling(false);
        // remove the notification when the call ends
        Notifications.dismissAllNotificationsAsync();
      }
    });

    return () => {
      CallManager.dispose();
      BackgroundTimer.stop();
    };
  }, []);

  const handleSpeaker = useCallback(async () => {
    const res = await CallManager.toggleSpeaker();
    console.log("Speaker: ", res);
    setIsSpeaker(res);
  }, [isSpeaker]);

  const handleClose = () => {
    CallManager.endCall();
    CallManager.rejectCall();
  };

  if (!calling) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.contactName}>{callInfo.name}</Text>
      <Text style={styles.callTime}>{formatTime(callTime)}</Text>
      <View style={styles.buttonContainer}>
        <IconButton
          icon={isMuted ? "microphone-off" : "microphone"}
          size={30}
          onPress={() => setIsMuted(!isMuted)}
          style={styles.iconButton}
          rippleColor={isMuted ? "red" : "green"}
        />
        <IconButton
          icon="phone-hangup"
          size={30}
          onPress={() => handleClose()}
          style={styles.iconButton}
          rippleColor={"red"}
          iconColor="red"
        />
        <IconButton
          icon={isSpeaker ? "volume-high" : "volume-mute"}
          size={30}
          onPress={() => handleSpeaker()}
          style={styles.iconButton}
          iconColor={isSpeaker ? "green" : "red"}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    zIndex: 111111,
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  contactName: {
    fontSize: 24,
    color: "black",
    marginBottom: 10,
  },
  callTime: {
    fontSize: 18,
    color: "black",
    marginBottom: 30,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    width: "80%",
  },
  iconButton: {
    margin: 20,
  },
});

export default OngoingCallScreen;

AppRegistry.registerComponent("myApp", () => OngoingCallScreen);

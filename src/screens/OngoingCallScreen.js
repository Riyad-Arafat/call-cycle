"use strict";
var __awaiter =
  (this && this.__awaiter) ||
  function (thisArg, _arguments, P, generator) {
    function adopt(value) {
      return value instanceof P
        ? value
        : new P(function (resolve) {
            resolve(value);
          });
    }
    return new (P || (P = Promise))(function (resolve, reject) {
      function fulfilled(value) {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      }
      function rejected(value) {
        try {
          step(generator["throw"](value));
        } catch (e) {
          reject(e);
        }
      }
      function step(result) {
        result.done
          ? resolve(result.value)
          : adopt(result.value).then(fulfilled, rejected);
      }
      step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
  };
var __generator =
  (this && this.__generator) ||
  function (thisArg, body) {
    var _ = {
        label: 0,
        sent: function () {
          if (t[0] & 1) throw t[1];
          return t[1];
        },
        trys: [],
        ops: [],
      },
      f,
      y,
      t,
      g;
    return (
      (g = { next: verb(0), throw: verb(1), return: verb(2) }),
      typeof Symbol === "function" &&
        (g[Symbol.iterator] = function () {
          return this;
        }),
      g
    );
    function verb(n) {
      return function (v) {
        return step([n, v]);
      };
    }
    function step(op) {
      if (f) throw new TypeError("Generator is already executing.");
      while ((g && ((g = 0), op[0] && (_ = 0)), _))
        try {
          if (
            ((f = 1),
            y &&
              (t =
                op[0] & 2
                  ? y["return"]
                  : op[0]
                  ? y["throw"] || ((t = y["return"]) && t.call(y), 0)
                  : y.next) &&
              !(t = t.call(y, op[1])).done)
          )
            return t;
          if (((y = 0), t)) op = [op[0] & 2, t.value];
          switch (op[0]) {
            case 0:
            case 1:
              t = op;
              break;
            case 4:
              _.label++;
              return { value: op[1], done: false };
            case 5:
              _.label++;
              y = op[1];
              op = [0];
              continue;
            case 7:
              op = _.ops.pop();
              _.trys.pop();
              continue;
            default:
              if (
                !((t = _.trys), (t = t.length > 0 && t[t.length - 1])) &&
                (op[0] === 6 || op[0] === 2)
              ) {
                _ = 0;
                continue;
              }
              if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) {
                _.label = op[1];
                break;
              }
              if (op[0] === 6 && _.label < t[1]) {
                _.label = t[1];
                t = op;
                break;
              }
              if (t && _.label < t[2]) {
                _.label = t[2];
                _.ops.push(op);
                break;
              }
              if (t[2]) _.ops.pop();
              _.trys.pop();
              continue;
          }
          op = body.call(thisArg, _);
        } catch (e) {
          op = [6, e];
          y = 0;
        } finally {
          f = t = 0;
        }
      if (op[0] & 5) throw op[1];
      return { value: op[0] ? op[1] : void 0, done: true };
    }
  };
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var react_native_paper_1 = require("react-native-paper");
var react_native_call_manager_1 = require("react-native-call-manager");
var react_native_background_timer_1 = require("react-native-background-timer");
var useGlobal_1 = require("@hooks/useGlobal");
var Notifications = require("expo-notifications");
Notifications.setNotificationHandler({
  handleNotification: function () {
    return __awaiter(void 0, void 0, void 0, function () {
      return __generator(this, function (_a) {
        return [
          2 /*return*/,
          {
            shouldShowAlert: true,
            shouldPlaySound: false,
            shouldSetBadge: false,
          },
        ];
      });
    });
  },
});
var OngoingCallScreen = function () {
  var callInfo = (0, useGlobal_1.default)().callInfo;
  var _a = (0, react_1.useState)(false),
    calling = _a[0],
    setCalling = _a[1];
  var _b = (0, react_1.useState)(0),
    callTime = _b[0],
    setCallTime = _b[1];
  var _c = (0, react_1.useState)(false),
    isMuted = _c[0],
    setIsMuted = _c[1];
  var _d = (0, react_1.useState)(false),
    isSpeaker = _d[0],
    setIsSpeaker = _d[1];
  // Increment call time every second
  (0, react_1.useEffect)(function () {
    var timer = setInterval(function () {
      setCallTime(function (prevTime) {
        return prevTime + 1;
      });
    }, 1000);
    return function () {
      return clearInterval(timer);
    };
  }, []);
  // Format the call time into a MM:SS format
  var formatTime = function (time) {
    var minutes = Math.floor(time / 60);
    var seconds = time % 60;
    return ""
      .concat(minutes, ":")
      .concat(seconds < 10 ? "0" : "")
      .concat(seconds);
  };
  var sendNotification = function () {
    return __awaiter(void 0, void 0, void 0, function () {
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            return [
              4 /*yield*/,
              Notifications.scheduleNotificationAsync({
                content: {
                  title: "Call Started",
                  body: "You are in a call with ".concat(callInfo.name),
                  data: { data: "goes here" },
                },
                trigger: null,
              }),
            ];
          case 1:
            _a.sent();
            return [2 /*return*/];
        }
      });
    });
  };
  (0, react_1.useEffect)(
    function () {
      console.log("Call Info: ", callInfo);
      if (callInfo.name) {
        setCalling(true);
        setCallTime(0);
        sendNotification(); // Send a notification when a call starts
      }
    },
    [callInfo]
  );
  (0, react_1.useEffect)(function () {
    var subscription = Notifications.addNotificationResponseReceivedListener(
      function (response) {
        var action = response.notification.request.content.data.action;
        if (action === "goes here") console.log("User pressed the action");
      }
    );
    return function () {
      return subscription.remove();
    };
  }, []);
  (0, react_1.useEffect)(function () {
    react_native_background_timer_1.default.start();
    react_native_call_manager_1.default.onStateChange(function (event, number) {
      console.log("Event: ", event);
      console.log("Number: ", number);
      if (event === "Disconnected") {
        setCalling(false);
        // remove the notification when the call ends
        Notifications.dismissAllNotificationsAsync();
      }
    });
    return function () {
      react_native_call_manager_1.default.dispose();
      react_native_background_timer_1.default.stop();
    };
  }, []);
  var handleSpeaker = (0, react_1.useCallback)(
    function () {
      return __awaiter(void 0, void 0, void 0, function () {
        var res;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              return [
                4 /*yield*/,
                react_native_call_manager_1.default.toggleSpeaker(),
              ];
            case 1:
              res = _a.sent();
              console.log("Speaker: ", res);
              setIsSpeaker(res);
              return [2 /*return*/];
          }
        });
      });
    },
    [isSpeaker]
  );
  var handleClose = function () {
    react_native_call_manager_1.default.endCall();
    react_native_call_manager_1.default.rejectCall();
  };
  if (!calling) return null;
  return (
    <react_native_1.View style={styles.container}>
      <react_native_1.Text style={styles.contactName}>
        {callInfo.name}
      </react_native_1.Text>
      <react_native_1.Text style={styles.callTime}>
        {formatTime(callTime)}
      </react_native_1.Text>
      <react_native_1.View style={styles.buttonContainer}>
        <react_native_paper_1.IconButton
          icon={isMuted ? "microphone-off" : "microphone"}
          size={30}
          onPress={function () {
            return setIsMuted(!isMuted);
          }}
          style={styles.iconButton}
          rippleColor={isMuted ? "red" : "green"}
        />
        <react_native_paper_1.IconButton
          icon="phone-hangup"
          size={30}
          onPress={function () {
            return handleClose();
          }}
          style={styles.iconButton}
          rippleColor={"red"}
          iconColor="red"
        />
        <react_native_paper_1.IconButton
          icon={isSpeaker ? "volume-high" : "volume-mute"}
          size={30}
          onPress={function () {
            return handleSpeaker();
          }}
          style={styles.iconButton}
          iconColor={isSpeaker ? "green" : "red"}
        />
      </react_native_1.View>
    </react_native_1.View>
  );
};
var styles = react_native_1.StyleSheet.create({
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
exports.default = OngoingCallScreen;

import React, { useState, useEffect, useMemo } from "react";
import {
  Modal,
  Text,
  View,
  TouchableOpacity,
  Animated,
  Easing,
} from "react-native";

import { getAvailablePlans } from "@apis/index";
import { IPlan } from "@typings/types";
import { useSession } from "@context/Session";
import { useTranslation } from "@hooks/useTranslation";
import Loading from "@components/Loading";

const PlanSubscriptionModal = ({ isVisible, onClose }) => {
  const { t } = useTranslation();
  const [plans, setPlans] = useState<IPlan[]>([]);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0)); // For modal fade-in animation
  const scaleAnim = new Animated.Value(1); // For plan selection animation
  const { user } = useSession();
  const currentUserPlan = useMemo(() => {
    const userPlan = { ...user?.plan };
    if (!userPlan) {
      return {
        name: "FREE_PLAN",
        description: "FREE_PLAN_DESCRIPTION",
      };
    }

    const plan = { ...userPlan };
    console.log("Plan:", plan);
    plan.name = `${plan.name}_PLAN`.toUpperCase() as any;
    plan.description = `${plan.name}_DESCRIPTION`.toUpperCase();
    return plan;
  }, [user?.plan]);

  useEffect(() => {
    if (isVisible) {
      setLoading(true);
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        easing: Easing.out(Easing.poly(4)),
        useNativeDriver: true,
      }).start();

      getAvailablePlans()
        .then((data) => {
          setPlans(data as IPlan[]);
          setLoading(false);
        })
        .catch((error) => {
          console.error(error);
          setLoading(false);
        });
    }
  }, [isVisible, fadeAnim]);

  const handleSubscribe = () => {
    if (selectedPlan && !loading) {
      setLoading(true);
      console.log("Subscription process started for:", selectedPlan);
      setTimeout(() => {
        console.log("Subscription successful!");
        setLoading(false);
        onClose();
      }, 2000);
    }
  };

  const handlePlanSelect = (plan) => {
    setSelectedPlan(plan);
    Animated.spring(scaleAnim, {
      toValue: 1.1,
      friction: 5,
      useNativeDriver: true,
    }).start(() => {
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 5,
        useNativeDriver: true,
      }).start();
    });
  };

  const handleOnClose = () => {
    setSelectedPlan(null);
    onClose();
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 500,
      easing: Easing.out(Easing.poly(4)),
      useNativeDriver: true,
    }).start();
  };

  return (
    <Animated.View style={{ opacity: fadeAnim }}>
      <Modal visible={isVisible} onRequestClose={onClose}>
        {loading ? (
          <View
            style={{
              flex: 1,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Loading />
          </View>
        ) : (
          <View style={{ padding: 20 }}>
            <View
              style={{
                backgroundColor: "#f1f1f1",
                padding: 10,
                marginBottom: 20,
                borderRadius: 5,
                borderColor: "#ccc",
                borderWidth: 1,
              }}
            >
              <Text
                style={{
                  fontSize: 16,
                  marginBottom: 10,
                  color: "#333", // Ensure the text color contrasts well with the background
                }}
              >
                {t("Your current plan")}:{t(`${currentUserPlan.name}` as any)}
              </Text>
              <Text
                style={{
                  fontSize: 16,
                  marginBottom: 10,
                  color: "#333", // Ensure the text color contrasts well with the background
                }}
              >
                {t(`${currentUserPlan.description}` as any)}
              </Text>
            </View>

            <Text
              style={{ fontSize: 18, fontWeight: "bold", marginBottom: 10 }}
            >
              {t("Choose Your Plan")}
            </Text>
            {plans.map((plan) => (
              <TouchableOpacity
                key={plan.id}
                style={{
                  padding: 15,
                  backgroundColor:
                    selectedPlan?.id === plan.id ? "#e0f7fa" : "#ffffff",
                  marginBottom: 10,
                  borderRadius: 5,
                  transform: [
                    { scale: selectedPlan?.id === plan.id ? scaleAnim : 1 },
                  ],
                }}
                onPress={() => handlePlanSelect(plan)}
              >
                <Text style={{ fontSize: 16, fontWeight: "bold" }}>
                  {t(`${plan.name}_PLAN`.toUpperCase() as any)}
                </Text>

                <Text>
                  {t(`${plan.name}_PLAN_DESCRIPTION`.toUpperCase() as any)}
                </Text>

                <Text>
                  <Text
                    style={{
                      fontSize: 16,
                      fontWeight: "bold",
                      marginHorizontal: 5,
                      color: "green",
                    }}
                  >
                    ${plan.price}/
                  </Text>
                  {t("per month")}
                </Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={{
                backgroundColor: !selectedPlan ? "#ccc" : "#4caf50",
                padding: 10,
                borderRadius: 5,
                marginTop: 20,
              }}
              onPress={handleSubscribe}
              disabled={!selectedPlan || loading}
            >
              <Text style={{ color: "white", textAlign: "center" }}>
                {t("Subscribe Now")}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={{
                backgroundColor: "#f44336",
                padding: 10,
                borderRadius: 5,
                marginTop: 10,
              }}
              onPress={handleOnClose}
            >
              <Text style={{ color: "white", textAlign: "center" }}>
                {t("Cancel")}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </Modal>
    </Animated.View>
  );
};

export default PlanSubscriptionModal;

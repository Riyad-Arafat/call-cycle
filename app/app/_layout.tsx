import React from "react";
import Loading from "@components/Loading";
import { useSession } from "@context/Session";
import { Redirect, Stack } from "expo-router";
import GlobalProvider from "@context/Global";

export default function AppLayout() {
  const { user, isLoading } = useSession();

  // You can keep the splash screen open, or render a loading screen like we do here.
  if (isLoading) {
    return <Loading />;
  }

  // Only require authentication within the (app) group's layout as users
  // need to be able to access the (auth) group and sign in again.
  if (!user) {
    // On web, static rendering will stop here as the user is not authenticated
    // in the headless Node process that the pages are rendered in.
    return <Redirect href="/login" />;
  }

  // This layout can be deferred because it's not the root layout.
  return (
    <GlobalProvider>
      <Stack />
      <Stack.Screen options={{ headerShown: false }} />
    </GlobalProvider>
  );
}

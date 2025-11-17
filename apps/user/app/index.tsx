import { Redirect } from 'expo-router';
import React from 'react';

// This page serves as the entry point and should redirect based on authentication status.
// Since we don't have a live auth state, we redirect to the sign-in page to start the flow.

export default function Index() {
  // In a real app, you would check auth state here:
  // if (isAuthenticated) {
  //   return <Redirect href="/(app)/(tabs)/home" />;
  // }

  // return <Redirect href="/(auth)/sign-in" />;
  return <Redirect href="/(app)/(tabs)/home" />;
}

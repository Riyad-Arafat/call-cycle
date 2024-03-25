/**
 * Learn more about using TypeScript with React Navigation:
 * https://reactnavigation.org/docs/typescript/
 */

import { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import {
  CompositeScreenProps,
  NavigatorScreenParams,
} from "@react-navigation/native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import * as Contacts from "expo-contacts";

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}

export type RootStackParamList = {
  Root: NavigatorScreenParams<RootTabParamList> | undefined;
  Modal: undefined;
  NotFound: undefined;
};

export type RootStackScreenProps<Screen extends keyof RootStackParamList> =
  NativeStackScreenProps<RootStackParamList, Screen>;

// Screens Keys
export type RootTabParamList = {
  HomeScreen: undefined;
  Groups: undefined;
};

export type RootTabScreenProps<Screen extends keyof RootTabParamList> =
  CompositeScreenProps<
    BottomTabScreenProps<RootTabParamList, Screen>,
    NativeStackScreenProps<RootStackParamList>
  >;

// ////
export type Contact = Contacts.Contact & {
  disabled?: boolean;
};

export enum PlanName {
  Free = "Free",
  Basic = "Basic",
  Pro = "Pro",
  Ultra = "Ultra",
}

export interface userPlan {
  plan_id: string;
  user_id: string;
  start_date: Date;
  end_date: Date;
  name: PlanName;
  description: string;
  price: number;
}

export interface IUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  password: string;
  plan: userPlan | null;
}

export const plans = {
  Free: {
    name: PlanName.Free,
    max_groups: 1,
    max_contacts_per_group: 5,
  },
  Basic: {
    name: PlanName.Basic,
    max_groups: 5,
    max_contacts_per_group: 15,
  },
  Pro: {
    name: PlanName.Pro,
    max_groups: 10,
    max_contacts_per_group: 50,
  },
  Ultra: {
    name: PlanName.Ultra,
    max_groups: null,
    max_contacts_per_group: null,
  },
} as const;

export interface IPlan {
  id: string;
  name: PlanName;
  description: string;
  price: number;
}

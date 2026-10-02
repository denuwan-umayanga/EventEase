import {
  Slot,
} from "expo-router";

import RoleGuard from "../../src/components/RoleGuard";

export default function BookingsLayout() {
  return (
    <RoleGuard allow="user">
      <Slot />
    </RoleGuard>
  );
}
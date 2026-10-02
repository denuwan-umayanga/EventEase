import {
  Slot,
} from "expo-router";

import RoleGuard from "../../../src/components/RoleGuard";

export default function EventEditLayout() {
  return (
    <RoleGuard allow="admin">
      <Slot />
    </RoleGuard>
  );
}
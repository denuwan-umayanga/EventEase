import { EventItem } from "./Event";

export type BookingItem = {
  _id: string;
  userId:
    | string
    | {
        _id: string;
        name: string;
        email: string;
      };

  eventId: EventItem;

  numberOfSeats: number;

  status: "Confirmed" | "Cancelled";

  createdAt?: string;
  updatedAt?: string;
};

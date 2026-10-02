export type EventUser = {
  _id?: string;
  name: string;
  email: string;
};

export type EventItem = {
  _id: string;
  title: string;
  description: string;
  location: string;
  eventDate: string;
  capacity: number;
  availableSeats: number;
  image?: string;
  createdBy: EventUser | string;
  createdAt?: string;
  updatedAt?: string;
};

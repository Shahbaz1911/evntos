export interface Event {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  mapLink: string;
  slug: string;
  registrationOpen: boolean;
  createdAt: string; // ISO date string
}

export interface Registration {
  id: string;
  eventId: string;
  name: string;
  email: string;
  registeredAt: string; // ISO date string
}

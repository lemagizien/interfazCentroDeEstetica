import type { Service } from "./Service";
import type { Professional } from "./Professional";
import type { BookingDay } from "./BookingDay";

export interface Business {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  address: string;
  services: Service[];
  professionals: Professional[];
  booking: BookingDay[];
}
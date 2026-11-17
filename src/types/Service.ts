import { IconName } from "@/components/Icon";

export interface Service {
  id: number;
  name: string;
  detail: string;
  duration: string;
  price: string;
  icon: IconName;
}
import type { IconName } from "../utils/icons";

export const services = [
  { id: 1, name: "Limpieza facial", detail: "Renovación profunda", time: "60 min", price: "$28.000", icon: "sparkle" as IconName },
  { id: 2, name: "Masajes", detail: "Relajante descontracturante", time: "45 min", price: "$24.000", icon: "services" as IconName },
  { id: 3, name: "Manicuría", detail: "Esmaltado semipermanente", time: "50 min", price: "$18.500", icon: "sparkle" as IconName },
  { id: 4, name: "Corte & brushing", detail: "Diseño personalizado", time: "60 min", price: "$22.000", icon: "scissors" as IconName },
];

export const professionals = [
  { id: 1, name: "Sofía Méndez", role: "Cosmetóloga", initials: "SM" },
  { id: 2, name: "Valentina Paz", role: "Esteticista", initials: "VP" },
  { id: 3, name: "Lucía Ramos", role: "Dermocosmiatra", initials: "LR" },
];

export const dates = [
  { day: "HOY", number: "18", label: "Jue" },
  { day: "VIE", number: "19", label: "Vie" },
  { day: "SÁB", number: "20", label: "Sáb" },
  { day: "LUN", number: "22", label: "Lun" },
  { day: "MAR", number: "23", label: "Mar" },
];

export const slots = ["09:00", "10:30", "12:00", "15:30", "17:00", "18:30"];

export const appointments = [
  { time: "09:00", client: "Camila Torres", service: "Limpieza facial", pro: "Sofía Méndez", status: "Confirmado", initials: "CT" },
  { time: "10:30", client: "Julieta Ríos", service: "Manicuría", pro: "Valentina Paz", status: "Confirmado", initials: "JR" },
  { time: "12:00", client: "Marina López", service: "Masajes", pro: "Lucía Ramos", status: "Pendiente", initials: "ML" },
  { time: "15:30", client: "Agustina Silva", service: "Corte & brushing", pro: "Sofía Méndez", status: "Confirmado", initials: "AS" },
];

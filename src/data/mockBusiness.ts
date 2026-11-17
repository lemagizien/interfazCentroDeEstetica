import { IconName } from "@/components/Icon";
import { Business } from "@/types/Business";


export const MOCK_ALMAESTETICA: Business[] = [
  {
    id: "biz_01",
    slug: "alma-estetica",
    name: "Alma Estética",
    tagline: "Cuidado facial y corporal",
    address: "Av. Corrientes 1847, CABA",
    services: [
      { id: 1, name: "Limpieza facial", detail: "Renovación profunda", duration: "60 min", price: "$28.000", icon: "sparkle" as IconName },
      { id: 2, name: "Masajes", detail: "Relajante descontracturante", duration: "45 min", price: "$24.000", icon: "services" as IconName },
      { id: 3, name: "Manicuría", detail: "Esmaltado semipermanente", duration: "50 min", price: "$18.500", icon: "sparkle" as IconName },
      { id: 4, name: "Corte & brushing", detail: "Diseño personalizado", duration: "60 min", price: "$22.000", icon: "scissors" as IconName },
    ],
    professionals: [
      { id: 1, name: "Sofía Méndez", role: "Cosmetóloga", initials: "SM" },
      { id: 2, name: "Valentina Paz", role: "Esteticista", initials: "VP" },
      { id: 3, name: "Lucía Ramos", role: "Dermocosmiatra", initials: "LR" },
    ],
    booking: [
      { day: "HOY", number: "18", label: "Jue" },
      { day: "VIE", number: "19", label: "Vie" },
      { day: "SÁB", number: "20", label: "Sáb" },
      { day: "LUN", number: "22", label: "Lun" },
      { day: "MAR", number: "23", label: "Mar" },
    ],
  },
];
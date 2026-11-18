import { Icon } from "./Icon"; // ajustá la ruta según tu carpeta

interface TenantBrandProps {
  name: string;
  logoUrl?: string;
}

export const TenantBrand = ({ name, logoUrl }: TenantBrandProps) => {
  return (
    <div className="tenant-brand">
      {logoUrl ? (
        <img src={logoUrl} alt={name} className="tenant-logo" />
      ) : (
        <span className="tenant-mark" aria-hidden="true">
          <Icon name="sparkle" size={16} />
        </span>
      )}
      <span className="tenant-name">{name}</span>
    </div>
  );
};
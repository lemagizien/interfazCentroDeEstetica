import { Icon } from "./Icon";

export const Brand = () => {
  return (
    <div className="brand">
      <span className="brand-mark"><Icon name="sparkle" size={18} /></span>
      <span className="brand-name">MiCentro</span>
      {/* <span className="brand-sub">ESTÉTICA</span> */}
    </div>
  );
}
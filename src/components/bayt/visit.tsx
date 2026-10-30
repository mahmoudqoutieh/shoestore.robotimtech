import { Clock, MapPin, MessageCircle, Phone } from "lucide-react";

export function Visit({ settings }: { settings: Record<string, string> }) {
  const digits = (settings.whatsapp ?? "").replace(/\D/g, "");
  const phone = (settings.phone ?? "").trim();
  const address = (settings.address ?? "").trim();
  const hours = (settings.hours ?? "").trim();
  const rows = [
    address ? { icon: MapPin, label: "العنوان", value: address } : null,
    hours ? { icon: Clock, label: "ساعات العمل", value: hours } : null,
    phone ? { icon: Phone, label: "الهاتف", value: phone, href: `tel:${phone.replace(/[^\d+]/g, "")}` } : null,
  ].filter((row): row is NonNullable<typeof row> => row !== null);

  return (
    <section className="bh-section bh-visit-section" id="visit">
      <div className="bh-visit-card">
        <h2 className="bh-h2">زورونا في بيت الرياضة</h2>
        <p className="bh-visit-card__lead">جرّب الأحذية بنفسك واختر المقاس الأنسب مع فريقنا.</p>
        {rows.length ? (
          <ul className="bh-visit-card__rows">
            {rows.map(({ icon: Icon, label, value, href }) => (
              <li key={label}>
                <Icon aria-hidden="true" size={20} strokeWidth={2} />
                <span>{label}</span>
                {href ? <a href={href}>{value}</a> : <b>{value}</b>}
              </li>
            ))}
          </ul>
        ) : null}
        {digits ? (
          <a className="bh-order bh-order--big" href={`https://wa.me/${digits}`} rel="noopener" target="_blank">
            <MessageCircle aria-hidden="true" size={20} strokeWidth={2.4} />
            <span>تواصل عبر واتساب</span>
          </a>
        ) : null}
      </div>
    </section>
  );
}

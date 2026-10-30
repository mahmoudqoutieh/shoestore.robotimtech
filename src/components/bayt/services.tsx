import { Footprints, Ruler, ShieldCheck } from "lucide-react";

const ITEMS = [
  { icon: Footprints, title: "رياضي ورسمي معاً", text: "تشكيلة تغطي الملعب والعمل والمناسبات تحت سقف واحد." },
  { icon: Ruler, title: "مساعدة في المقاس", text: "جرّب الحذاء واسأل فريق المحل ليساعدك في اختيار القياس المناسب." },
  { icon: ShieldCheck, title: "اختيار موثوق", text: "نختار كل موديل بعناية ليدوم معك ويستحق ما تدفعه." },
];

export function Services() {
  return (
    <section className="bh-section bh-services">
      <h2 className="bh-h2">لماذا بيت الرياضة</h2>
      <ul className="bh-services__rail">
        {ITEMS.map(({ icon: Icon, title, text }) => (
          <li key={title}>
            <Icon aria-hidden="true" size={30} strokeWidth={1.8} />
            <h3>{title}</h3>
            <p>{text}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}

import { LogoMark } from "./logo-mark";

export function SiteFooter() {
  return (
    <footer className="bh-footer">
      <div className="bh-footer__brand">
        <LogoMark size={28} />
        <span>بيت الرياضة</span>
      </div>
      <p>© 2026 بيت الرياضة. جميع الحقوق محفوظة.</p>
      <a href="/admin">لوحة التحكم</a>
    </footer>
  );
}

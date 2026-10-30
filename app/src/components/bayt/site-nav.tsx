import { LogoMark } from "./logo-mark";

export function SiteNav() {
  return (
    <header className="bh-nav">
      <a aria-label="بيت الرياضة" className="bh-nav__brand" href="#top">
        <LogoMark size={34} />
        <span>بيت الرياضة</span>
      </a>
      <nav aria-label="التنقل الرئيسي" className="bh-nav__links">
        <a href="#worlds">عالمان</a>
        <a href="#collection">المنتجات</a>
        <a href="#visit">زيارتنا</a>
      </nav>
      <a className="bh-nav__cta" href="#collection">
        <span>تسوق الآن</span>
      </a>
    </header>
  );
}

import { ArrowLeft } from "lucide-react";

export function JourneyActions() {
  return (
    <>
      <a className="bh-run" href="#collection">
        <span>تسوق المجموعة</span>
        <span aria-hidden="true" className="bh-run__chip">
          <ArrowLeft size={18} strokeWidth={2.6} />
        </span>
      </a>
      <a className="bh-visit" href="#visit">
        زيارة المحل
      </a>
    </>
  );
}

import Link from "next/link";
import { getValidationSummary } from "@/lib/data/archive";

export default async function AboutPage() {
  const summary = await getValidationSummary();

  return (
    <main>
      <header className="global-nav">
        <div className="container nav-row">
          <Link href="/" className="brand">
            Social Robot Archive
          </Link>
          <nav className="nav-links">
            <Link href="/robots">로봇 탐색</Link>
            <Link href="/studies">연구 사례</Link>
            <Link href="/about">데이터 정보</Link>
          </nav>
        </div>
      </header>

      <section className="hero-tile">
        <div className="container">
          <h1 className="list-title">데이터 정보</h1>
          <p className="list-subtitle">
            Phase 0G 검증 기준으로 현재 데이터셋 커버리지와 수동 검토 큐를 제공합니다.
          </p>
        </div>
      </section>

      <section className="list-tile">
        <div className="container about-grid">
          <article className="detail-card">
            <h2>Dataset Snapshot</h2>
            <ul className="about-list">
              <li>Robots: {summary.snapshot.robots}</li>
              <li>Prices: {summary.snapshot.prices}</li>
              <li>Studies: {summary.snapshot.studies}</li>
              <li>Sources: {summary.snapshot.sources}</li>
            </ul>
          </article>

          <article className="detail-card">
            <h2>Coverage</h2>
            <ul className="about-list">
              <li>가격 데이터: {summary.coverage.priceCoverage}</li>
              <li>연구 데이터: {summary.coverage.studyCoverage}</li>
            </ul>
          </article>

          <article className="detail-card">
            <h2>Robot Status 분포</h2>
            <ul className="about-list">
              {Object.entries(summary.robotStatus).map(([key, value]) => (
                <li key={key}>
                  {key}: {value}
                </li>
              ))}
            </ul>
          </article>

          <article className="detail-card">
            <h2>배송 정보 분포</h2>
            <ul className="about-list">
              {Object.entries(summary.shipping).map(([key, value]) => (
                <li key={key}>
                  {key}: {value}
                </li>
              ))}
            </ul>
          </article>

          <article className="detail-card">
            <h2>수동 검토 큐</h2>
            <ul className="about-list">
              <li>status=정보확인필요: {summary.manualQueue.statusNeedsReview.join(", ")}</li>
              <li>연구 플래그 공란 로봇 수: {summary.manualQueue.missingStudyFlags}</li>
              <li>shipping_to_korea=UNKNOWN 건수: {summary.manualQueue.shippingUnknown}</li>
            </ul>
          </article>
        </div>
      </section>
    </main>
  );
}

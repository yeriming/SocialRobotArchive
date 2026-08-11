import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getNewsByRobotId,
  getPricesByRobotId,
  getRobotById,
  getSourcesByRobotId,
  getStudiesByRobotId
} from "@/lib/data/archive";

type RobotDetailProps = {
  params: Promise<{ robotId: string }>;
};

export default async function RobotDetailPage({ params }: RobotDetailProps) {
  const { robotId } = await params;
  const [robot, prices, studies, sources, relatedNews] = await Promise.all([
    getRobotById(robotId),
    getPricesByRobotId(robotId),
    getStudiesByRobotId(robotId),
    getSourcesByRobotId(robotId),
    getNewsByRobotId(robotId)
  ]);

  if (!robot) {
    notFound();
  }

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
            <Link href="/news">최신 동향</Link>
          </nav>
        </div>
      </header>

      <section className="hero-tile">
        <div className="container detail-head">
          <p className="detail-id">{robot.robot_id}</p>
          <h1>{robot.robot_name}</h1>
          <p>
            {robot.manufacturer || "제조사 확인 중"} ·{" "}
            {robot.manufacturer_country || "국가 확인 중"}
          </p>
        </div>
      </section>

      <section className="list-tile">
        <div className="container detail-grid">
          <article className="detail-card">
            <h2>기본 정보</h2>
            <dl>
              <dt>판매 상태</dt>
              <dd>{robot.status || "확인 중"}</dd>
              <dt>로봇 유형</dt>
              <dd>{robot.robot_type || "확인 중"}</dd>
              <dt>검증 상태</dt>
              <dd>{robot.verification_status || "확인 중"}</dd>
            </dl>
          </article>

          <article className="detail-card">
            <h2>연구 근거 플래그</h2>
            <dl>
              <dt>소아 연구</dt>
              <dd>{robot.pediatric_study_exists || "확인 중"}</dd>
              <dt>임상 연구</dt>
              <dd>{robot.clinical_study_exists || "확인 중"}</dd>
              <dt>일반 HRI 연구</dt>
              <dd>{robot.general_hri_study_exists || "확인 중"}</dd>
            </dl>
          </article>

          <article className="detail-card">
            <h2>공식 링크</h2>
            {robot.official_url ? (
              <a href={robot.official_url} target="_blank" rel="noreferrer" className="detail-link">
                공식 페이지 열기
              </a>
            ) : (
              <p>공식 링크 확인 중</p>
            )}
          </article>
        </div>

        <div className="container section-stack">
          <section className="detail-card">
            <h2>가격 및 도입 정보</h2>
            {prices.length === 0 ? (
              <p>가격 데이터가 아직 없습니다.</p>
            ) : (
              <div className="detail-list">
                {prices.map((price) => (
                  <article key={price.price_id} className="row-card">
                    <h3>{price.vendor || price.price_id}</h3>
                    <p>
                      {price.offer_type || "방식 확인 중"} ·{" "}
                      {price.price_original
                        ? `${price.price_original} ${price.currency || ""}`.trim()
                        : "가격문의"}
                    </p>
                    <p>
                      상태: {price.availability || "확인 중"} · 한국 배송:{" "}
                      {price.shipping_to_korea || "확인 중"}
                    </p>
                    {price.source_url && (
                      <a href={price.source_url} target="_blank" rel="noreferrer" className="detail-link">
                        출처 보기
                      </a>
                    )}
                  </article>
                ))}
              </div>
            )}
          </section>

          <section className="detail-card">
            <h2>연구 근거</h2>
            {studies.length === 0 ? (
              <p>연구 데이터가 아직 없습니다.</p>
            ) : (
              <div className="detail-list">
                {studies.map((study) => (
                  <article key={study.study_id} className="row-card">
                    <h3>{study.title}</h3>
                    <p>
                      {study.year || "연도 미상"} · {study.venue || "출처 미상"}
                    </p>
                    <p>
                      소아: {study.pediatric || "확인 중"} · 임상: {study.clinical || "확인 중"} ·
                      근거수준: {study.evidence_level || "확인 중"}
                    </p>
                    {study.result_summary_ko && <p>{study.result_summary_ko}</p>}
                    {study.url && (
                      <a href={study.url} target="_blank" rel="noreferrer" className="detail-link">
                        원문/레지스트리 보기
                      </a>
                    )}
                  </article>
                ))}
              </div>
            )}
          </section>

          <section className="detail-card">
            <h2>출처 로그</h2>
            {sources.length === 0 ? (
              <p>출처 데이터가 아직 없습니다.</p>
            ) : (
              <div className="detail-list">
                {sources.map((source) => (
                  <article key={source.source_id} className="row-card">
                    <h3>
                      {source.source_name || source.source_id} ({source.source_type || "other"})
                    </h3>
                    <p>
                      정보유형: {source.information_type || "other"} · 수집일:{" "}
                      {source.retrieved_date || "확인 중"}
                    </p>
                    {source.source_url && (
                      <a href={source.source_url} target="_blank" rel="noreferrer" className="detail-link">
                        출처 링크 열기
                      </a>
                    )}
                  </article>
                ))}
              </div>
            )}
          </section>

          <section className="detail-card">
            <h2>최근 관련 동향</h2>
            {relatedNews.length === 0 ? (
              <p>연결된 최신 동향 기사가 아직 없습니다.</p>
            ) : (
              <div className="detail-list">
                {relatedNews.slice(0, 8).map((news) => (
                  <article key={news.news_id} className="row-card">
                    <h3>{news.title}</h3>
                    <p>
                      {news.primary_category || "분류 확인 중"} · {news.published_at.slice(0, 10)} ·{" "}
                      {news.source_id === "IROBOTNEWS" ? "로봇신문" : "IEEE Spectrum"}
                    </p>
                    <p>{news.summary_ko || news.relevance_reason}</p>
                    <a href={news.source_url} target="_blank" rel="noreferrer" className="detail-link">
                      원문 보기
                    </a>
                  </article>
                ))}
              </div>
            )}
          </section>
        </div>
      </section>
    </main>
  );
}

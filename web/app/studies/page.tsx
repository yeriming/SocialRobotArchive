import Link from "next/link";
import { getRobots, getStudiesWithRobot } from "@/lib/data/archive";
import { getThumbnailProxyUrlFromCandidates } from "@/lib/data/thumbnail";
import {
  ROBOT_THUMBNAIL_OVERRIDES,
  ROBOT_THUMBNAIL_STRICT_IDS
} from "@/lib/data/robotThumbnailOverrides";

type StudiesPageProps = {
  searchParams?: Promise<{
    robot?: string;
    pediatric?: string;
    clinical?: string;
  }>;
};

function uniqSorted(values: string[]): string[] {
  return Array.from(new Set(values.filter(Boolean))).sort((a, b) => a.localeCompare(b, "ko"));
}

export default async function StudiesPage({ searchParams }: StudiesPageProps) {
  const params = (await searchParams) ?? {};
  const [studies, robots] = await Promise.all([getStudiesWithRobot(), getRobots()]);
  const robotsById = new Map(robots.map((robot) => [robot.robot_id, robot] as const));

  const robotIds = uniqSorted(studies.map((study) => study.robot_id));

  const filtered = studies.filter((study) => {
    if (params.robot && study.robot_id !== params.robot) return false;
    if (params.pediatric && study.pediatric !== params.pediatric) return false;
    if (params.clinical && study.clinical !== params.clinical) return false;
    return true;
  });

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
            <Link href="/about">데이터 정보</Link>
          </nav>
        </div>
      </header>

      <section className="hero-tile">
        <div className="container">
          <h1 className="list-title">연구 사례</h1>
          <p className="list-subtitle">
            로봇별 소아/임상 연구 근거를 탐색하고 원문 또는 레지스트리 출처로 바로 이동할 수
            있습니다.
            <br />
            조사 범위: 각 로봇별 논문 원문, 학술 출처(저널/학회), 임상·레지스트리 링크 및 검증 가능한 2차 출처
            <br />
            조사 목적: 소셜로봇의 연구 근거 수준과 적용 가능성을 비교·검토
            <br />
조사 대상: 소아/임상/HRI 관련 연구 사례(연도, venue, 요약, 근거수준, 원문/레지스트리 링크)
          </p>

          <form method="get" className="filter-row">
            <label>
              로봇 ID
              <select name="robot" defaultValue={params.robot ?? ""}>
                <option value="">전체</option>
                {robotIds.map((robotId) => (
                  <option key={robotId} value={robotId}>
                    {robotId}
                  </option>
                ))}
              </select>
            </label>

            <label>
              소아 여부
              <select name="pediatric" defaultValue={params.pediatric ?? ""}>
                <option value="">전체</option>
                <option value="TRUE">TRUE</option>
                <option value="FALSE">FALSE</option>
              </select>
            </label>

            <label>
              임상 여부
              <select name="clinical" defaultValue={params.clinical ?? ""}>
                <option value="">전체</option>
                <option value="TRUE">TRUE</option>
                <option value="FALSE">FALSE</option>
              </select>
            </label>

            <button type="submit" className="btn-primary">
              적용
            </button>
          </form>
        </div>
      </section>

      <section className="list-tile">
        <div className="container">
          <p className="result-count">총 {filtered.length}건</p>
          <div className="study-grid">
            {filtered.map((study) => {
              const robot = robotsById.get(study.robot_id);
              const manualOverrides = ROBOT_THUMBNAIL_OVERRIDES[study.robot_id] ?? [];
              const thumbnailUrl =
                ROBOT_THUMBNAIL_STRICT_IDS.has(study.robot_id) && manualOverrides.length === 0
                  ? null
                  : getThumbnailProxyUrlFromCandidates([
                      ...manualOverrides,
                      robot?.official_url ?? "",
                      robot?.spec_source_url ?? "",
                      robot?.source_database_url ?? ""
                    ]);

              return (
              <article key={study.study_id} className="study-card">
                <div className="card-thumb">
                  {thumbnailUrl ? (
                    <img src={thumbnailUrl} alt={`${study.robot_name} 연구 썸네일`} loading="lazy" />
                  ) : (
                    <span className="thumb-fallback">NO IMAGE</span>
                  )}
                </div>
                <h2 className="study-title">{study.title}</h2>
                <p className="study-meta">
                  {study.year || "연도 미상"} · {study.venue || "출처 미상"}
                </p>
                <p className="study-robot">
                  로봇:{" "}
                  <Link href={`/robots/${study.robot_id}`} className="inline-link">
                    {study.robot_name} ({study.robot_id})
                  </Link>
                </p>
                <div className="tag-row study-tags">
                  <span className="tag">소아 {study.pediatric || "확인 중"}</span>
                  <span className="tag">임상 {study.clinical || "확인 중"}</span>
                  <span className="tag">{study.evidence_level || "근거수준 확인 중"}</span>
                </div>
                <p className="study-summary">{study.result_summary_ko || "요약 정보 없음"}</p>
                {study.url && (
                  <a href={study.url} target="_blank" rel="noreferrer" className="detail-link study-link">
                    원문/레지스트리 보기
                  </a>
                )}
              </article>
              );
            })}
          </div>
        </div>
      </section>
    </main>
  );
}

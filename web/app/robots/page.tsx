import Link from "next/link";
import { getRobots } from "@/lib/data/archive";
import { getThumbnailProxyUrlFromCandidates } from "@/lib/data/thumbnail";
import {
  ROBOT_THUMBNAIL_OVERRIDES,
  ROBOT_THUMBNAIL_STRICT_IDS
} from "@/lib/data/robotThumbnailOverrides";

type RobotsPageProps = {
  searchParams?: Promise<{
    country?: string;
    status?: string;
    evidence?: string;
  }>;
};

function uniqSorted(values: string[]): string[] {
  return Array.from(new Set(values.filter(Boolean))).sort((a, b) => a.localeCompare(b, "ko"));
}

function shouldShowStatusTag(status?: string): boolean {
  if (!status) return false;
  return status.replace(/\s+/g, "") !== "정보확인필요";
}

export default async function RobotsPage({ searchParams }: RobotsPageProps) {
  const params = (await searchParams) ?? {};
  const robots = await getRobots();

  const countries = uniqSorted(robots.map((robot) => robot.manufacturer_country));
  const statuses = uniqSorted(robots.map((robot) => robot.status));

  const filtered = robots.filter((robot) => {
    const hasResearchEvidence =
      robot.pediatric_study_exists === "TRUE" ||
      robot.clinical_study_exists === "TRUE" ||
      robot.general_hri_study_exists === "TRUE";

    if (params.country && robot.manufacturer_country !== params.country) return false;
    if (params.status && robot.status !== params.status) return false;
    if (params.evidence === "HAS" && !hasResearchEvidence) return false;
    if (params.evidence === "NONE" && hasResearchEvidence) return false;
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
          <h1 className="list-title">로봇 탐색</h1>
          <p className="list-subtitle">
            국가, 제조사, 판매 상태로 필터링해 연구 가능한 로봇을 탐색하세요.
            <br />
            조사 범위: ui44, IEEE robotsguide(해외 소셜로봇 DB), 로봇 제조사 공식 홈페이지
            <br />
            조사 목적: 연구실 관점에서 활용 가능한 소셜로봇 후보를 체계적으로 파악
            <br />
            조사 대상: 소셜로봇의 기본 정보(제조사, 국가, 판매 상태, 공식 링크), 연구 근거 여부(소아/임상/HRI)
          </p>

          <form method="get" className="filter-row">
            <label>
              국가
              <select name="country" defaultValue={params.country ?? ""}>
                <option value="">전체</option>
                {countries.map((country) => (
                  <option key={country} value={country}>
                    {country}
                  </option>
                ))}
              </select>
            </label>

            <label>
              판매 상태
              <select name="status" defaultValue={params.status ?? ""}>
                <option value="">전체</option>
                {statuses.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </label>

            <label>
              연구 근거 여부
              <select name="evidence" defaultValue={params.evidence ?? ""}>
                <option value="">전체</option>
                <option value="HAS">있음</option>
                <option value="NONE">없음</option>
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
          <p className="result-count">총 {filtered.length}개</p>
          <div className="robot-grid">
            {filtered.map((robot) => {
              const manualOverrides = ROBOT_THUMBNAIL_OVERRIDES[robot.robot_id] ?? [];
              const thumbnailUrl =
                ROBOT_THUMBNAIL_STRICT_IDS.has(robot.robot_id) && manualOverrides.length === 0
                  ? null
                  : getThumbnailProxyUrlFromCandidates([
                      ...manualOverrides,
                      robot.official_url,
                      robot.spec_source_url,
                      robot.source_database_url
                    ]);
              return (
              <article key={robot.robot_id} className="robot-card">
                <div className="card-thumb">
                  {thumbnailUrl ? (
                    <img src={thumbnailUrl} alt={`${robot.robot_name} 썸네일`} loading="lazy" />
                  ) : (
                    <span className="thumb-fallback">NO IMAGE</span>
                  )}
                </div>
                <h2>
                  <Link href={`/robots/${robot.robot_id}`}>{robot.robot_name}</Link>
                </h2>
                <p>{robot.manufacturer || "제조사 확인 중"}</p>
                <p>{robot.manufacturer_country || "국가 확인 중"}</p>
                <div className="tag-row">
                  {shouldShowStatusTag(robot.status) && <span className="tag">{robot.status}</span>}
                  {robot.pediatric_study_exists === "TRUE" && <span className="tag">소아 연구</span>}
                  {robot.clinical_study_exists === "TRUE" && <span className="tag">임상 연구</span>}
                </div>
              </article>
              );
            })}
          </div>
        </div>
      </section>
    </main>
  );
}

import Link from "next/link";
import { getRobots } from "@/lib/data/archive";
import { getThumbnailProxyUrlFromCandidates } from "@/lib/data/thumbnail";
import {
  ROBOT_THUMBNAIL_OVERRIDES,
  ROBOT_THUMBNAIL_STRICT_IDS
} from "@/lib/data/robotThumbnailOverrides";

function shouldShowStatusTag(status?: string): boolean {
  if (!status) return false;
  return status.replace(/\s+/g, "") !== "정보확인필요";
}

export default async function HomePage() {
  const robots = await getRobots();
  const featuredRobotIds = ["ROBOT-0001", "ROBOT-0038", "ROBOT-0052"];
  const featuredRobots = featuredRobotIds
    .map((id) => robots.find((robot) => robot.robot_id === id))
    .filter((robot) => Boolean(robot));

  return (
    <main>
      <header className="global-nav">
        <div className="container nav-row">
          <span className="brand">Social Robot Archive</span>
          <nav className="nav-links">
            <Link href="/robots">로봇 탐색</Link>
            <Link href="/studies">연구 사례</Link>
            <Link href="/news">최신 동향</Link>
            <Link href="/about">데이터 정보</Link>
          </nav>
        </div>
      </header>

      <section className="hero-tile">
        <div className="container hero-content">
          <p className="hero-kicker">Dataset First</p>
          <h1>소셜로봇을 연구의 관점에서 탐색하세요.</h1>
          <p>
            제품 정보, 도입 가능성, 소아/임상 근거를 CSV 아카이브로
            구축하고 웹에서 검색할 수 있도록 지원합니다.
          </p>
          <div className="hero-actions">
            <Link href="/robots" className="btn-primary">
              로봇 탐색하기
            </Link>
            <Link href="/about" className="btn-secondary">
              데이터 정보
            </Link>
          </div>
        </div>
      </section>

      <section className="featured-tile">
        <div className="container">
          <h2>주요 로봇</h2>
          <div className="featured-grid">
            {featuredRobots.map((robot) => {
              const manualOverrides = robot ? (ROBOT_THUMBNAIL_OVERRIDES[robot.robot_id] ?? []) : [];
              const thumbnailUrl =
                robot && ROBOT_THUMBNAIL_STRICT_IDS.has(robot.robot_id) && manualOverrides.length === 0
                  ? null
                  : getThumbnailProxyUrlFromCandidates([
                      ...manualOverrides,
                      robot?.official_url ?? "",
                      robot?.spec_source_url ?? "",
                      robot?.source_database_url ?? ""
                    ]);

              return (
              <article key={robot?.robot_id} className="featured-card">
                <div className="featured-thumb">
                  {thumbnailUrl ? (
                    <img src={thumbnailUrl} alt={`${robot?.robot_name ?? "로봇"} 썸네일`} loading="lazy" />
                  ) : (
                    <span className="thumb-fallback">NO IMAGE</span>
                  )}
                </div>
                <h3>{robot?.robot_name}</h3>
                <p>
                  {robot?.manufacturer || "제조사 확인 중"} ·{" "}
                  {robot?.manufacturer_country || "국가 확인 중"}
                </p>
                <div className="tag-row">
                  {shouldShowStatusTag(robot?.status) && <span className="tag">{robot?.status}</span>}
                  {robot?.clinical_study_exists === "TRUE" && <span className="tag">임상 연구</span>}
                </div>
                <Link href={`/robots/${robot?.robot_id}`} className="detail-link">
                  자세히 보기
                </Link>
              </article>
              );
            })}
          </div>
        </div>
      </section>
    </main>
  );
}

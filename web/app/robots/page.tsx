import Link from "next/link";
import { getRobots } from "@/lib/data/archive";
import { getThumbnailProxyUrl } from "@/lib/data/thumbnail";

type RobotsPageProps = {
  searchParams?: Promise<{
    country?: string;
    manufacturer?: string;
    status?: string;
  }>;
};

function uniqSorted(values: string[]): string[] {
  return Array.from(new Set(values.filter(Boolean))).sort((a, b) => a.localeCompare(b, "ko"));
}

export default async function RobotsPage({ searchParams }: RobotsPageProps) {
  const params = (await searchParams) ?? {};
  const robots = await getRobots();

  const countries = uniqSorted(robots.map((robot) => robot.manufacturer_country));
  const manufacturers = uniqSorted(robots.map((robot) => robot.manufacturer));
  const statuses = uniqSorted(robots.map((robot) => robot.status));

  const filtered = robots.filter((robot) => {
    if (params.country && robot.manufacturer_country !== params.country) return false;
    if (params.manufacturer && robot.manufacturer !== params.manufacturer) return false;
    if (params.status && robot.status !== params.status) return false;
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
            <Link href="/about">데이터 정보</Link>
          </nav>
        </div>
      </header>

      <section className="hero-tile">
        <div className="container">
          <h1 className="list-title">로봇 탐색</h1>
          <p className="list-subtitle">
            국가, 제조사, 판매 상태로 필터링해 연구 가능한 로봇을 탐색하세요.
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
              제조사
              <select name="manufacturer" defaultValue={params.manufacturer ?? ""}>
                <option value="">전체</option>
                {manufacturers.map((manufacturer) => (
                  <option key={manufacturer} value={manufacturer}>
                    {manufacturer}
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
            {filtered.map((robot) => (
              <article key={robot.robot_id} className="robot-card">
                <div className="card-thumb">
                  {getThumbnailProxyUrl(robot.official_url) ? (
                    <img
                      src={getThumbnailProxyUrl(robot.official_url) ?? ""}
                      alt={`${robot.robot_name} 썸네일`}
                      loading="lazy"
                    />
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
                  <span className="tag">{robot.status || "상태 확인 중"}</span>
                  {robot.pediatric_study_exists === "TRUE" && <span className="tag">소아 연구</span>}
                  {robot.clinical_study_exists === "TRUE" && <span className="tag">임상 연구</span>}
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}

import Link from "next/link";
import { getStudiesWithRobot } from "@/lib/data/archive";
import { getThumbnailProxyUrl } from "@/lib/data/thumbnail";

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
  const studies = await getStudiesWithRobot();

  const robots = uniqSorted(studies.map((study) => study.robot_id));

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
          </p>

          <form method="get" className="filter-row">
            <label>
              로봇 ID
              <select name="robot" defaultValue={params.robot ?? ""}>
                <option value="">전체</option>
                {robots.map((robotId) => (
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
            {filtered.map((study) => (
              <article key={study.study_id} className="study-card">
                <div className="card-thumb">
                  {getThumbnailProxyUrl(study.url) ? (
                    <img
                      src={getThumbnailProxyUrl(study.url) ?? ""}
                      alt={`${study.robot_name} 연구 썸네일`}
                      loading="lazy"
                    />
                  ) : (
                    <span className="thumb-fallback">NO IMAGE</span>
                  )}
                </div>
                <h2>{study.title}</h2>
                <p>
                  {study.year || "연도 미상"} · {study.venue || "출처 미상"}
                </p>
                <p>
                  로봇:{" "}
                  <Link href={`/robots/${study.robot_id}`} className="inline-link">
                    {study.robot_name} ({study.robot_id})
                  </Link>
                </p>
                <div className="tag-row">
                  <span className="tag">소아 {study.pediatric || "확인 중"}</span>
                  <span className="tag">임상 {study.clinical || "확인 중"}</span>
                  <span className="tag">{study.evidence_level || "근거수준 확인 중"}</span>
                </div>
                {study.result_summary_ko && <p>{study.result_summary_ko}</p>}
                {study.url && (
                  <a href={study.url} target="_blank" rel="noreferrer" className="detail-link">
                    원문/레지스트리 보기
                  </a>
                )}
              </article>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}

import Link from "next/link";
import { getIncludedNews, getNewsTrendSummary, getRobots } from "@/lib/data/archive";
import { getThumbnailProxyUrl } from "@/lib/data/thumbnail";

type NewsPageProps = {
  searchParams?: Promise<{
    region?: string;
    category?: string;
    tag?: string;
  }>;
};

function uniqSorted(values: string[]): string[] {
  return Array.from(new Set(values.filter(Boolean))).sort((a, b) => a.localeCompare(b, "ko"));
}

function regionLabel(region: string): string {
  if (region === "KR") return "국내";
  if (region === "GLOBAL") return "해외";
  return "기타";
}

export default async function NewsPage({ searchParams }: NewsPageProps) {
  const params = (await searchParams) ?? {};
  const [news, robots, trendSummary] = await Promise.all([
    getIncludedNews(),
    getRobots(),
    getNewsTrendSummary()
  ]);

  const robotNameById = new Map(robots.map((robot) => [robot.robot_id, robot.robot_name]));

  const categories = uniqSorted(news.map((item) => item.primary_category));
  const regions = uniqSorted(news.map((item) => item.region));
  const tags = uniqSorted(news.flatMap((item) => item.tags));

  const filtered = news.filter((item) => {
    if (params.region && item.region !== params.region) return false;
    if (params.category && item.primary_category !== params.category) return false;
    if (params.tag && !item.tags.includes(params.tag)) return false;
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
          </nav>
        </div>
      </header>

      <section className="hero-tile">
        <div className="container">
          <h1 className="list-title">소셜로봇 최신 동향</h1>
          <p className="list-subtitle">
            2026년 여름, 국내외 소셜로봇의 새로운 제품, 기술, 연구와 활용 사례를 살펴보세요.
            <br />
           조사 범위: 로봇신문(국내), IEEE Spectrum(해외) <br />
           조사 목적: 소셜로봇 관련 최신 트렌드 파악 <br />
           조사 대상: 소셜로봇 관련 기사 <br />
          </p>

          <form method="get" className="filter-row">
            <label>
              지역
              <select name="region" defaultValue={params.region ?? ""}>
                <option value="">전체</option>
                {regions.map((region) => (
                  <option key={region} value={region}>
                    {regionLabel(region)}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Category
              <select name="category" defaultValue={params.category ?? ""}>
                <option value="">전체</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Tag
              <select name="tag" defaultValue={params.tag ?? ""}>
                <option value="">전체</option>
                {tags.map((tag) => (
                  <option key={tag} value={tag}>
                    {tag}
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
          <div className="study-grid">
            {filtered.map((item) => (
              <article key={item.news_id} className="study-card news-card">
                <div className="card-thumb">
                  {getThumbnailProxyUrl(item.source_url) ? (
                    <img src={getThumbnailProxyUrl(item.source_url) ?? ""} alt={`${item.title} 썸네일`} loading="lazy" />
                  ) : (
                    <span className="thumb-fallback">NO IMAGE</span>
                  )}
                </div>
                <p className="result-count news-kicker">
                  [{item.primary_category}] {regionLabel(item.region)}
                </p>
                <h2 className="news-title">{item.title}</h2>
                <p className="news-summary">{item.summary_ko || item.relevance_reason}</p>
                <p className="news-robots">
                  관련 로봇:{" "}
                  {item.robot_ids.length > 0
                    ? item.robot_ids.map((robotId) => robotNameById.get(robotId) ?? robotId).join(", ")
                    : "없음"}
                </p>
                <div className="tag-row news-tags">
                  {item.tags.map((tag) => (
                    <span key={`${item.news_id}-${tag}`} className="tag">
                      {tag}
                    </span>
                  ))}
                </div>
                <p className="news-source">
                  {item.source_id === "IROBOTNEWS" ? "로봇신문" : "IEEE Spectrum"} ·{" "}
                  {item.published_at.slice(0, 10)}
                </p>
                <a href={item.source_url} target="_blank" rel="noreferrer" className="detail-link news-link">
                  원문 보기
                </a>
              </article>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}

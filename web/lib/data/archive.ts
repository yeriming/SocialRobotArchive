import { readCsvAsObjects } from "@/lib/data/csv";

export type RobotRecord = {
  robot_id: string;
  robot_name: string;
  manufacturer: string;
  manufacturer_country: string;
  status: string;
  robot_type: string;
  official_url: string;
  pediatric_study_exists: string;
  clinical_study_exists: string;
  general_hri_study_exists: string;
  verification_status: string;
};

export type PriceRecord = {
  price_id: string;
  vendor: string;
  offer_type: string;
  price_original: string;
  currency: string;
  availability: string;
  shipping_to_korea: string;
  checked_date: string;
  source_url: string;
};

export type StudyRecord = {
  robot_id: string;
  study_id: string;
  title: string;
  year: string;
  venue: string;
  doi: string;
  url: string;
  pediatric: string;
  clinical: string;
  evidence_level: string;
  result_summary_ko: string;
};

export type StudyListRecord = StudyRecord & {
  robot_name: string;
};

export type SourceRecord = {
  source_id: string;
  related_entity_type: string;
  related_entity_id: string;
  source_type: string;
  source_name: string;
  source_url: string;
  information_type: string;
  retrieved_date: string;
};

export type ValidationSummary = {
  snapshot: {
    robots: number;
    prices: number;
    studies: number;
    sources: number;
  };
  coverage: {
    priceCoverage: string;
    studyCoverage: string;
  };
  robotStatus: Record<string, number>;
  shipping: Record<string, number>;
  manualQueue: {
    statusNeedsReview: string[];
    missingStudyFlags: number;
    shippingUnknown: number;
  };
};

export async function getRobots(): Promise<RobotRecord[]> {
  const rows = await readCsvAsObjects("02_robots.csv");
  return rows.map((row) => ({
    robot_id: row.robot_id ?? "",
    robot_name: row.robot_name ?? "",
    manufacturer: row.manufacturer ?? "",
    manufacturer_country: row.manufacturer_country ?? "",
    status: row.status ?? "",
    robot_type: row.robot_type ?? "",
    official_url: row.official_url ?? "",
    pediatric_study_exists: row.pediatric_study_exists ?? "",
    clinical_study_exists: row.clinical_study_exists ?? "",
    general_hri_study_exists: row.general_hri_study_exists ?? "",
    verification_status: row.verification_status ?? ""
  }));
}

export async function getRobotById(robotId: string): Promise<RobotRecord | undefined> {
  const robots = await getRobots();
  return robots.find((robot) => robot.robot_id === robotId);
}

export async function getHomeSnapshot() {
  const [robots, prices, studies] = await Promise.all([
    readCsvAsObjects("02_robots.csv"),
    readCsvAsObjects("03_prices.csv"),
    readCsvAsObjects("04_studies.csv")
  ]);

  const robotIds = new Set(robots.map((row) => row.robot_id).filter(Boolean));
  const priceRobotIds = new Set(prices.map((row) => row.robot_id).filter(Boolean));
  const studyRobotIds = new Set(studies.map((row) => row.robot_id).filter(Boolean));

  return {
    robotCount: robotIds.size,
    priceCoverage: `${priceRobotIds.size}/${robotIds.size}`,
    studyRowCount: studies.length,
    studyCoverage: `${studyRobotIds.size}/${robotIds.size}`
  };
}

export async function getPricesByRobotId(robotId: string): Promise<PriceRecord[]> {
  const rows = await readCsvAsObjects("03_prices.csv");
  return rows
    .filter((row) => row.robot_id === robotId)
    .map((row) => ({
      price_id: row.price_id ?? "",
      vendor: row.vendor ?? "",
      offer_type: row.offer_type ?? "",
      price_original: row.price_original ?? "",
      currency: row.currency ?? "",
      availability: row.availability ?? "",
      shipping_to_korea: row.shipping_to_korea ?? "",
      checked_date: row.checked_date ?? "",
      source_url: row.source_url ?? ""
    }));
}

export async function getStudiesByRobotId(robotId: string): Promise<StudyRecord[]> {
  const rows = await readCsvAsObjects("04_studies.csv");
  return rows
    .filter((row) => row.robot_id === robotId)
    .map((row) => ({
      robot_id: row.robot_id ?? "",
      study_id: row.study_id ?? "",
      title: row.title ?? "",
      year: row.year ?? "",
      venue: row.venue ?? "",
      doi: row.doi ?? "",
      url: row.url ?? "",
      pediatric: row.pediatric ?? "",
      clinical: row.clinical ?? "",
      evidence_level: row.evidence_level ?? "",
      result_summary_ko: row.result_summary_ko ?? ""
    }));
}

export async function getStudiesWithRobot(): Promise<StudyListRecord[]> {
  const [studies, robots] = await Promise.all([
    readCsvAsObjects("04_studies.csv"),
    readCsvAsObjects("02_robots.csv")
  ]);

  const robotNameById = new Map(robots.map((robot) => [robot.robot_id, robot.robot_name]));

  return studies.map((row) => ({
    robot_id: row.robot_id ?? "",
    robot_name: robotNameById.get(row.robot_id ?? "") ?? row.robot_id ?? "",
    study_id: row.study_id ?? "",
    title: row.title ?? "",
    year: row.year ?? "",
    venue: row.venue ?? "",
    doi: row.doi ?? "",
    url: row.url ?? "",
    pediatric: row.pediatric ?? "",
    clinical: row.clinical ?? "",
    evidence_level: row.evidence_level ?? "",
    result_summary_ko: row.result_summary_ko ?? ""
  }));
}

export async function getSourcesByRobotId(robotId: string): Promise<SourceRecord[]> {
  const rows = await readCsvAsObjects("05_sources.csv");
  return rows
    .filter((row) => row.robot_id === robotId)
    .map((row) => ({
      source_id: row.source_id ?? "",
      related_entity_type: row.related_entity_type ?? "",
      related_entity_id: row.related_entity_id ?? "",
      source_type: row.source_type ?? "",
      source_name: row.source_name ?? "",
      source_url: row.source_url ?? "",
      information_type: row.information_type ?? "",
      retrieved_date: row.retrieved_date ?? ""
    }));
}

export async function getValidationSummary(): Promise<ValidationSummary> {
  const [robots, prices, studies, sources] = await Promise.all([
    readCsvAsObjects("02_robots.csv"),
    readCsvAsObjects("03_prices.csv"),
    readCsvAsObjects("04_studies.csv"),
    readCsvAsObjects("05_sources.csv")
  ]);

  const robotStatus = robots.reduce<Record<string, number>>((acc, row) => {
    const key = row.status || "UNKNOWN";
    acc[key] = (acc[key] ?? 0) + 1;
    return acc;
  }, {});

  const shipping = prices.reduce<Record<string, number>>((acc, row) => {
    const key = row.shipping_to_korea || "UNKNOWN";
    acc[key] = (acc[key] ?? 0) + 1;
    return acc;
  }, {});

  const robotIds = new Set(robots.map((row) => row.robot_id).filter(Boolean));
  const priceRobotIds = new Set(prices.map((row) => row.robot_id).filter(Boolean));
  const studyRobotIds = new Set(studies.map((row) => row.robot_id).filter(Boolean));

  const statusNeedsReview = robots
    .filter((row) => row.status === "정보확인필요")
    .map((row) => row.robot_id)
    .filter(Boolean);

  const missingStudyFlags = robots.filter(
    (row) =>
      !row.pediatric_study_exists && !row.clinical_study_exists && !row.general_hri_study_exists
  ).length;

  const shippingUnknown = prices.filter((row) => row.shipping_to_korea === "UNKNOWN").length;

  return {
    snapshot: {
      robots: robots.length,
      prices: prices.length,
      studies: studies.length,
      sources: sources.length
    },
    coverage: {
      priceCoverage: `${priceRobotIds.size}/${robotIds.size}`,
      studyCoverage: `${studyRobotIds.size}/${robotIds.size}`
    },
    robotStatus,
    shipping,
    manualQueue: {
      statusNeedsReview,
      missingStudyFlags,
      shippingUnknown
    }
  };
}

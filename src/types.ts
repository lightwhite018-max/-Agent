export type FacilityType =
  | "drinking_water"
  | "charging"
  | "rest"
  | "indoor"
  | "toilet"
  | "microwave"
  | "first_aid"
  | "hot_water"
  | "umbrella";

export type FacilityStatus = "normal" | "fault" | "maintenance" | "unknown";
export type HarborStatus = "open" | "closed" | "temp_closed";
export type CrowdLevel = "quiet" | "moderate" | "crowded" | "unknown";
export type Intent = "query_facility" | "query_harbor" | "feedback" | "navigation" | "unclear" | "safety";

export interface Facility {
  id: string;
  harborId: string;
  type: FacilityType;
  name: string;
  available: boolean;
  status: FacilityStatus;
}

export interface Harbor {
  id: string;
  name: string;
  district: string;
  businessArea: string;
  address: string;
  longitude: number;
  latitude: number;
  walkingTimeMinutes: number;
  distanceMeters: number;
  status: HarborStatus;
  statusReason?: string;
  openingHours: string;
  crowdLevel: CrowdLevel;
  updatedAt: string;
  lastVerifiedAt: string;
  dataFreshnessStatus: "fresh" | "stale";
  facilities: Facility[];
}

export interface ParsedNeed {
  intent: Intent;
  rawText: string;
  facilityTypes: FacilityType[];
  weatherContext?: "hot" | "rain" | "cold";
  openNow: boolean;
  needsIndoor: boolean;
  needsLocation: boolean;
  followUp?: string;
  safetyNotice?: string;
}

export interface ManualLocation {
  id: string;
  label: string;
  district: string;
  businessArea: string;
}

export interface Recommendation {
  harbor: Harbor;
  score: number;
  reasons: string[];
  warnings: string[];
}

export interface RecommendationResult {
  items: Recommendation[];
  fallbackUsed: boolean;
  message?: string;
  noResultReason?: "no_open_harbor" | "no_facility_match";
}

export interface ReportTicket {
  reportId: string;
  workOrderId: string;
  harborId: string;
  category: string;
  description: string;
  status: "pending";
  createdAt: string;
}

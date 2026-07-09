export interface FieldContract {
  field: string;
  column: string;
  required: boolean;
  enumValues?: readonly string[];
}

export const harborStatusValues = ["open", "closed", "temp_closed"] as const;
export const crowdLevelValues = ["quiet", "moderate", "crowded", "unknown"] as const;
export const dataFreshnessValues = ["fresh", "stale"] as const;
export const facilityTypeValues = ["drinking_water", "charging", "rest", "indoor", "toilet", "microwave", "first_aid", "hot_water", "umbrella"] as const;
export const facilityStatusValues = ["normal", "fault", "maintenance", "unknown"] as const;
export const imageUploadStatusValues = ["not_provided", "uploaded", "failed"] as const;
export const reportStatusValues = ["pending", "processing", "resolved", "rejected"] as const;
export const workOrderStatusValues = ["pending", "processing", "resolved", "closed"] as const;

export const harborFieldContracts: FieldContract[] = [
  { field: "id", column: "id", required: true },
  { field: "name", column: "name", required: true },
  { field: "district", column: "district", required: true },
  { field: "businessArea", column: "business_area", required: true },
  { field: "address", column: "address", required: true },
  { field: "longitude", column: "longitude", required: true },
  { field: "latitude", column: "latitude", required: true },
  { field: "walkingTimeMinutes", column: "walking_time_minutes", required: false },
  { field: "distanceMeters", column: "distance_meters", required: false },
  { field: "status", column: "status", required: true, enumValues: harborStatusValues },
  { field: "statusReason", column: "status_reason", required: false },
  { field: "openingHours", column: "opening_hours", required: true },
  { field: "crowdLevel", column: "crowd_level", required: true, enumValues: crowdLevelValues },
  { field: "updatedAt", column: "updated_at", required: true },
  { field: "lastVerifiedAt", column: "last_verified_at", required: true },
  { field: "dataFreshnessStatus", column: "data_freshness_status", required: true, enumValues: dataFreshnessValues },
];

export const facilityFieldContracts: FieldContract[] = [
  { field: "id", column: "id", required: true },
  { field: "harborId", column: "harbor_id", required: true },
  { field: "type", column: "type", required: true, enumValues: facilityTypeValues },
  { field: "name", column: "name", required: true },
  { field: "available", column: "available", required: true },
  { field: "status", column: "status", required: true, enumValues: facilityStatusValues },
];

export const reportFieldContracts: FieldContract[] = [
  { field: "reportId", column: "id", required: true },
  { field: "harborId", column: "harbor_id", required: true },
  { field: "category", column: "category", required: true },
  { field: "description", column: "description", required: true },
  { field: "imageUrl", column: "image_url", required: false },
  { field: "imageUploadStatus", column: "image_upload_status", required: true, enumValues: imageUploadStatusValues },
  { field: "imageUploadNote", column: "image_upload_note", required: false },
  { field: "status", column: "status", required: true, enumValues: reportStatusValues },
  { field: "createdAt", column: "created_at", required: true },
];

export const workOrderFieldContracts: FieldContract[] = [
  { field: "workOrderId", column: "id", required: true },
  { field: "reportId", column: "report_id", required: true },
  { field: "harborId", column: "harbor_id", required: true },
  { field: "status", column: "status", required: true, enumValues: workOrderStatusValues },
  { field: "assignee", column: "assignee", required: false },
  { field: "resultNote", column: "result_note", required: false },
  { field: "createdAt", column: "created_at", required: true },
  { field: "updatedAt", column: "updated_at", required: true },
];

export function getContractColumns(contracts: FieldContract[]) {
  return contracts.map((contract) => contract.column);
}

import { harbors as seedHarbors } from "../data/harbors";
import { getRuntimeConfig } from "../config/runtimeConfig";
import { updateFacilityStatus, updateHarborStatus } from "../features/admin/harborAdmin";
import { parseNeed } from "../features/agent/parseNeed";
import { createReport } from "../features/feedback/createReport";
import { clearAppState, getBrowserStorage, loadAppState, saveAppState, type StorageLike } from "../features/persistence/appStorage";
import { recommendHarborsWithFallback } from "../features/recommendation/recommend";
import { getExternalServiceStatus, getNavigationPreview, getWeatherPreview } from "./externalServices";
import type {
  AppPersistedState,
  FacilityStatus,
  Harbor,
  HarborStatus,
  ManualLocation,
  ParsedNeed,
  RecommendationResult,
  ReportTicket,
} from "../types";

export interface RecommendationRequest {
  text: string;
  hasLocation: boolean;
  manualLocation?: ManualLocation;
  harbors: Harbor[];
}

export interface RecommendationResponse {
  parsedNeed: ParsedNeed;
  recommendationResult: RecommendationResult;
}

export interface ReportRequest {
  harborId: string;
  category: string;
  description: string;
}

export const prototypeApi = {
  loadState(storage: StorageLike | undefined = getBrowserStorage()): AppPersistedState {
    return loadAppState(storage, seedHarbors);
  },

  saveState(state: AppPersistedState, storage: StorageLike | undefined = getBrowserStorage()) {
    saveAppState(storage, state);
  },

  resetState(storage: StorageLike | undefined = getBrowserStorage()): AppPersistedState {
    clearAppState(storage);
    return {
      schemaVersion: 1,
      harbors: seedHarbors,
      tickets: [],
    };
  },

  getSeedHarbors(): Harbor[] {
    return seedHarbors;
  },

  getRecommendations(request: RecommendationRequest): RecommendationResponse {
    const parsedNeed = parseNeed(request.text, request.hasLocation);
    const recommendationResult = recommendHarborsWithFallback(parsedNeed, request.harbors, {
      preferredDistrict: request.hasLocation ? undefined : request.manualLocation?.district,
      preferredBusinessArea: request.hasLocation ? undefined : request.manualLocation?.businessArea,
    });

    return {
      parsedNeed,
      recommendationResult,
    };
  },

  createReport(request: ReportRequest): ReportTicket {
    return createReport(request.harborId, request.category, request.description);
  },

  updateFacilityStatus(harbors: Harbor[], harborId: string, facilityId: string, status: FacilityStatus): Harbor[] {
    return updateFacilityStatus(harbors, harborId, facilityId, status);
  },

  updateHarborStatus(harbors: Harbor[], harborId: string, status: HarborStatus): Harbor[] {
    return updateHarborStatus(harbors, harborId, status);
  },

  getRuntimeStatus() {
    return getExternalServiceStatus(getRuntimeConfig());
  },

  getNavigationPreview(harbor: Harbor) {
    return getNavigationPreview(getRuntimeConfig(), harbor);
  },

  getWeatherPreview() {
    return getWeatherPreview(getRuntimeConfig());
  },
};

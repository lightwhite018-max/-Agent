import type { Facility, Harbor, HarborRecord } from "../types";

export function composeHarbors(harborRecords: HarborRecord[], facilities: Facility[]): Harbor[] {
  return harborRecords.map((harbor) => ({
    ...harbor,
    facilities: facilities.filter((facility) => facility.harborId === harbor.id),
  }));
}

export function splitHarbors(harbors: Harbor[]): { harborRecords: HarborRecord[]; facilities: Facility[] } {
  return {
    harborRecords: harbors.map(({ facilities: _facilities, ...harbor }) => harbor),
    facilities: harbors.flatMap((harbor) => harbor.facilities),
  };
}

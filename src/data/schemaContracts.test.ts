import { describe, expect, it } from "vitest";
import sql from "../../docs/数据库草案.sql?raw";
import { facilitySeed, harborSeed } from "./seed";
import {
  facilityFieldContracts,
  facilityStatusValues,
  facilityTypeValues,
  getContractColumns,
  harborFieldContracts,
  harborStatusValues,
  imageUploadStatusValues,
  reportFieldContracts,
  workOrderFieldContracts,
} from "./schemaContracts";

describe("schemaContracts", () => {
  it("harbor seed 字段与字段契约保持一致", () => {
    const contractFields = harborFieldContracts.map((contract) => contract.field).sort();
    const seedFields = Object.keys(harborSeed[0]).sort();

    expect(seedFields).toEqual(contractFields.filter((field) => field !== "statusReason").sort());
  });

  it("facility seed 字段与字段契约保持一致", () => {
    const contractFields = facilityFieldContracts.map((contract) => contract.field).sort();
    const seedFields = Object.keys(facilitySeed[0]).sort();

    expect(seedFields).toEqual(contractFields);
  });

  it("SQL 草案包含核心表字段", () => {
    for (const column of getContractColumns(harborFieldContracts)) {
      expect(sql).toContain(column);
    }

    for (const column of getContractColumns(facilityFieldContracts)) {
      expect(sql).toContain(column);
    }

    for (const column of getContractColumns(reportFieldContracts)) {
      expect(sql).toContain(column);
    }

    for (const column of getContractColumns(workOrderFieldContracts)) {
      expect(sql).toContain(column);
    }
  });

  it("枚举值与 SQL CHECK 约束保持一致", () => {
    for (const value of harborStatusValues) {
      expect(sql).toContain(`'${value}'`);
    }

    for (const value of facilityTypeValues) {
      expect(sql).toContain(`'${value}'`);
    }

    for (const value of facilityStatusValues) {
      expect(sql).toContain(`'${value}'`);
    }

    for (const value of imageUploadStatusValues) {
      expect(sql).toContain(`'${value}'`);
    }
  });
});

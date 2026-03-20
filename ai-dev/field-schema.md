# Field Schema — KY Permitted Mine Boundaries

> Source: `kygisserver.ky.gov/.../Ky_Permitted_Mine_Boundaries_WGS84WM/MapServer/0`
> Total records: 22,455 (as of March 2025)
> Credit: Energy and Environment Cabinet — Division of Mine Permits
> Metadata Standard: FGDC-STD-001-1998

---

## Complete Field Inventory

| Field | Type | Length | Alias | Dashboard Use |
|-------|------|--------|-------|---------------|
| `OBJECTID` | OID | — | OBJECTID | Internal key |
| `PermitNo` | String | 12 | PermitNo | Search, display, table |
| `FeatCLS` | String | 5 | FeatCLS | Mine type axis (SF/UG) |
| `Source` | String | 20 | Source | — |
| `Contact` | String | 40 | Contact | — |
| `Type_Flag` | String | 5 | Type_Flag | Primary status axis |
| `Calc_Acres` | Double | — | Calc_Acres | KPI totals, table |
| `QUAD_DESC` | String | 100 | QUAD_DESC | USGS quad name |
| `MINE_STATU` | String | 3 | MINE_STATU | Drill-down status |
| `PER_NAME` | String | 50 | PER_NAME | Display field, search, table |
| `REGION_DES` | String | 40 | REGION_DES | DMP regional office |
| `PERM_ACT` | String | 60 | PERM_ACT | Permit activity history |
| `ACT_INAC` | String | 8 | ACT_INAC | Binary active/released flag |
| `DATE_ISS` | Date | 8 | DATE_ISS | Time-series chart |
| `ORIG_PERM` | String | 10 | ORIG_PERM | Original permit number |
| `National_I` | String | 15 | National_I | National ID |
| `Shape_Leng` | Double | — | Shape_Leng | — |
| `PER_TYPE` | String | 15 | PER_TYPE | Permit type |
| `Shape.area` | Double | — | Shape.area | — |
| `Shape.len` | Double | — | Shape.len | — |

---

## Domain Values

### `Type_Flag` — Primary Status

| Code | Label | Count | Include? | Notes |
|------|-------|-------|----------|-------|
| `ACT` | Active Mine | 1,685 | ✅ | Valid permit, may or may not be producing |
| `INACT` | Inactive Mine | 12,656 | ✅ | Reclaimed, forfeited, or abandoned |
| `RECNF` | Record Not Found | 4,346 | ✅ as "Historic (Pre-SMCRA)" | Pre-1977 records, mostly blank attributes |
| `TRNS` | Transferred | 3,768 | ❌ **ALWAYS EXCLUDE** | Duplicate geometries from ownership changes |

### `FeatCLS` — Mine Type

| Code | Label | Count |
|------|-------|-------|
| `SF` | Surface | 19,803 |
| `UG` | Underground (incl. Auger) | 2,652 |

### `MINE_STATU` — Detailed Permit Lifecycle

#### Group: Active
| Code | Description | Count | Type_Flag Context |
|------|-------------|-------|-------------------|
| `A1` | Active, currently being mined | 383 | ACT |
| `AP` | Actively producing coal | 98 | ACT |
| `A2` | Coal removal complete, reclamation only | 195 | ACT (187) + INACT (4) |
| `ND` | No disturbances | 95 | ACT |

#### Group: Temporarily Inactive
| Code | Description | Count | Type_Flag Context |
|------|-------------|-------|-------------------|
| `O2` | Active temporary cessations | 174 | ACT |
| `SP` | Suspended permit | 219 | ACT |
| `O1` | Active permits in forfeiture | 5 | ACT |
| `D3` | Reclamation deferred | 2 | ACT |

#### Group: Forfeiture / Enforcement
| Code | Description | Count | Type_Flag Context |
|------|-------------|-------|-------------------|
| `FF` | Final forfeiture | 2,026 | INACT (2,023) |
| `VF` | Voluntary forfeiture | 51 | INACT |
| `SF` | Surety failure | 46 | INACT (45) |
| `RV` | Revoked permit | 23 | ACT |

#### Group: Released
| Code | Description | Count | Type_Flag Context |
|------|-------------|-------|-------------------|
| `RC` | Permits completely released | 14,282 | INACT (10,526) + TRNS |
| `P1` | Phase 1 release | 248 | ACT |
| `P2` | Phase 2 release | 60 | ACT |
| `SR` | Surety released | 196 | ACT |

#### Group: Unknown / No Data
| Code | Description | Count | Type_Flag Context |
|------|-------------|-------|-------------------|
| `XX` | Mine status unknown | 7 | INACT |
| `''` | Blank (no data) | 4,345 | RECNF (all) |

### `ACT_INAC` — Binary Status

| Value | Count |
|-------|-------|
| `Released` | 16,412 |
| `Active` | 1,698 |
| `''` (blank) | 4,345 |

### `REGION_DES` — DMP Regional Office

| Value | Count |
|-------|-------|
| `PIKEVILLE` | 4,346 |
| `PRESTONSBURG` | 3,895 |
| `MIDDLESBORO` | 3,730 |
| `LONDON` | 3,543 |
| `MADISONVILLE` | 1,751 |
| `HAZARD` | 845 |
| `''` (blank) | 4,345 |

### `PER_TYPE` — Permit Type

| Value | Count |
|-------|-------|
| `PERMANENT` | 11,785 |
| `INTERIM` | 5,083 |
| `PRE LAW` | 1,242 |
| `''` (blank) | 4,345 |

---

## Cross-Tabulation: Type_Flag × MINE_STATU (Excluding TRNS)

### Type_Flag = ACT (1,685 records)
| MINE_STATU | Count |
|------------|-------|
| A1 | 379 |
| P1 | 248 |
| SP | 219 |
| SR | 196 |
| A2 | 187 |
| O2 | 174 |
| AP | 97 |
| ND | 95 |
| P2 | 60 |
| RV | 23 |
| O1 | 5 |
| D3 | 2 |

### Type_Flag = INACT (12,656 records)
| MINE_STATU | Count |
|------------|-------|
| RC | 10,526 |
| FF | 2,023 |
| VF | 51 |
| SF | 45 |
| XX | 7 |
| A2 | 4 |

### Type_Flag = RECNF (4,346 records)
| MINE_STATU | Count |
|------------|-------|
| `''` (blank) | 4,345 |
| AP | 1 |

---

## Data Quality Notes

1. **RECNF records** have almost universally blank MINE_STATU, ACT_INAC, REGION_DES, PER_TYPE, and DATE_ISS. The only populated fields are PermitNo, FeatCLS, Source, Contact, Type_Flag, Calc_Acres, National_I, and Shape_Leng.

2. **4 records** in Type_Flag=INACT have ACT_INAC=Active — these are data anomalies.

3. **1 record** in Type_Flag=RECNF has MINE_STATU=AP and REGION_DES=HAZARD — a data anomaly.

4. **`MINE_STATU = 'SF'`** (46 records, Surety failure) shares the same code as `FeatCLS = 'SF'` (Surface). Context disambiguates — MINE_STATU is always a status code, FeatCLS is always a mine type.

5. **QUAD_DESC** contains USGS 7.5-minute quadrangle names, NOT county names.

6. **DATE_ISS** is null for all RECNF records and potentially some others — handle null dates in time-series aggregation.

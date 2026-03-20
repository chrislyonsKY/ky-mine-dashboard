/** Mine boundary symbology configuration for unique value renderer */

export const MINE_RENDERER_JSON = {
  type: "unique-value",
  field: "FeatCLS",
  defaultSymbol: {
    type: "simple-fill",
    color: [150, 150, 150, 100],
    outline: { color: [100, 100, 100], width: 0.5 },
  },
  uniqueValueInfos: [
    {
      value: "SF",
      label: "Surface Mine",
      symbol: {
        type: "simple-fill",
        color: [41, 128, 185, 120],
        outline: { color: [41, 128, 185, 255], width: 1 },
      },
    },
    {
      value: "UG",
      label: "Underground Mine",
      symbol: {
        type: "simple-fill",
        color: [192, 57, 43, 120],
        outline: { color: [192, 57, 43, 255], width: 1 },
      },
    },
  ],
};

/** Popup template for mine boundary features */
export const MINE_POPUP_TEMPLATE = {
  title: "Permit: {PermitNo}",
  content: [
    {
      type: "fields",
      fieldInfos: [
        { fieldName: "PermitNo", label: "Permit Number" },
        { fieldName: "PER_NAME", label: "Permittee" },
        { fieldName: "FeatCLS", label: "Mine Type" },
        { fieldName: "Type_Flag", label: "Status" },
        { fieldName: "MINE_STATU", label: "Detailed Status" },
        { fieldName: "DATE_ISS", label: "Date Issued", format: { dateFormat: "short-date" } },
        { fieldName: "Calc_Acres", label: "Acres", format: { digitSeparator: true, places: 1 } },
        { fieldName: "PER_TYPE", label: "Permit Type" },
        { fieldName: "REGION_DES", label: "DMP Region" },
      ],
    },
  ],
};

/** Highlight symbol for selected mine */
export const SELECTION_SYMBOL = {
  type: "simple-fill",
  color: [255, 255, 0, 80],
  outline: { color: [255, 255, 0, 255], width: 2.5 },
};

/** Coal county fill color */
export const COAL_COUNTY_COLOR = [66, 133, 244, 50];

/** Non-coal county fill color */
export const NON_COAL_COUNTY_COLOR = [200, 200, 200, 30];

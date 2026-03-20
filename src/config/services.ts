/** Centralized REST service URLs — all public, no API keys required */

export const MINE_BOUNDARIES_URL =
  import.meta.env.VITE_MINE_BOUNDARIES_URL as string ??
  'https://kygisserver.ky.gov/arcgis/rest/services/WGS84WM_Services/Ky_Permitted_Mine_Boundaries_WGS84WM/MapServer/0';

export const COUNTIES_URL =
  import.meta.env.VITE_COUNTIES_URL as string ??
  'https://kygisserver.ky.gov/arcgis/rest/services/WGS84WM_Services/Ky_Census_County_2020_WGS84WM/MapServer/0';

export const IMAGERY_URL =
  import.meta.env.VITE_IMAGERY_URL as string ??
  'https://kyraster.ky.gov/arcgis/rest/services/ImageServices/Ky_KYAPED_Imagery_WGS84WM/ImageServer';

export const SMIS_TRANSFERS_URL =
  import.meta.env.VITE_SMIS_TRANSFERS_URL as string ??
  'https://services.arcgis.com/TosFUe3nXUAksqSj/arcgis/rest/services/SMIS_Permit_Transfers/FeatureServer/0';

/** External resource links */
export const RESOURCE_LINKS = {
  dmpHome: 'https://eec.ky.gov/Natural-Resources/Mining/Mine-Permits/Pages/default.aspx',
  smisInfo: 'https://eec.ky.gov/Natural-Resources/Mining/Pages/Surface-Mining-Information-System.aspx',
  smisWeb: 'https://smis.ky.gov/smis.web/',
  docTree: 'https://doctree.ky.gov/DocTree.web/',
} as const;

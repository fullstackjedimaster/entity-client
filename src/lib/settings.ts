// /src/lib/settings.ts

export interface AppSettings {
  API_BASE_URL: string;
  DEFAULT_JWT: string | null;
}

export const settings: AppSettings = {
  API_BASE_URL:
    process.env.NEXT_PUBLIC_EC_API_BASE_URL ||
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    "/api",

  DEFAULT_JWT:
    process.env.NEXT_PUBLIC_EC_DEFAULT_JWT !== undefined
      ? process.env.NEXT_PUBLIC_EC_DEFAULT_JWT || null
      : null,
};

export default settings;

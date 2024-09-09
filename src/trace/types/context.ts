export type Context = Record<string, unknown>;

export interface Contexts extends Record<string, Context | undefined> {
  app?: AppContext;
  device?: DeviceContext;
  os?: OsContext;
  culture?: CultureContext;
  response?: ResponseContext;
}

export interface AppContext extends Record<string, unknown> {
  app_name?: string;
  app_start_time?: string;
  app_version?: string;
  app_identifier?: string;
}

export interface DeviceContext extends Record<string, unknown> {
  screen_resolution?: string;
  screen_height_pixels?: number;
  screen_width_pixels?: number;
  screen_density?: number;
  screen_dpi?: number;
  online?: boolean;
}

export interface OsContext extends Record<string, unknown> {
  name?: string;
  version?: string;
  build?: string;
  kernel_version?: string;
}

export interface CultureContext extends Record<string, unknown> {
  calendar?: string;
  display_name?: string;
  locale?: string;
  is_24_hour_format?: boolean;
  timezone?: string;
}

export interface ResponseContext extends Record<string, unknown> {
  type?: string;
  cookies?: string[][] | Record<string, string>;
  headers?: Record<string, string>;
  status_code?: number;
  body_size?: number; // in bytes
}

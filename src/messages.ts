export type RainStartEvent = {
  serial_number: string;
  type: 'evt_precip';
  hub_sn: string;
  evt: [number];
};

export type LightningStrikeEvent = {
  serial_number: string;
  type: 'evt_strike';
  hub_sn: string;
  evt: [number, number, number];
};

export type RapidWind = {
  serial_number: string;
  type: 'rapid_wind';
  hub_sn: string;
  ob: [number, number, number];
};

export type ObservationAir = {
  serial_number: string;
  type: 'obs_air';
  hub_sn: string;
  obs: [number, number, number, number, number, number, number, number][];
  firmware_revision: number;
};

export type ObservationSky = {
  serial_number: string;
  type: 'obs_sky';
  hub_sn: string;
  obs: [
    number,
    number,
    number,
    number,
    number,
    number,
    number,
    number,
    number,
    number,
    number,
    number,
    number,
    number
  ][];
  firmware_revision: number;
};

export type ObservationTempest = {
  serial_number: string;
  type: 'obs_st';
  hub_sn: string;
  obs: [
    number,
    number,
    number,
    number,
    number,
    number,
    number,
    number,
    number,
    number,
    number,
    number,
    number,
    number,
    number,
    number,
    number,
    number
  ][];
  firmware_revision: number;
};

export type StatusDevice = {
  serial_number: string;
  type: 'device_status';
  hub_sn: string;
  timestamp: number;
  uptime: number;
  voltage: number;
  firmware_revision: number;
  rssi: number;
  hub_rssi: number;
  sensor_status: number;
  debug: number;
};

export type StatusHub = {
  serial_number: string;
  type: 'hub_status';
  firmware_revision: string;
  uptime: number;
  rssi: number;
  timestamp: number;
  reset_flags: string;
  seq: number;
  fs: number[];
  radio_stats: [number, number, number, number, number];
  mqtt_stats: number[];
};

export type Message =
  | RainStartEvent
  | LightningStrikeEvent
  | RapidWind
  | ObservationAir
  | ObservationSky
  | ObservationTempest
  | StatusDevice
  | StatusHub;

export const MESSAGE_TYPES = [
  'evt_precip',
  'evt_strike',
  'rapid_wind',
  'obs_air',
  'obs_sky',
  'obs_st',
  'device_status',
  'hub_status',
];

export function parse(buffer: Buffer): Message | undefined;
export function parse(str: string): Message | undefined;
export function parse(obj: NonNullable<unknown>): Message | undefined;
export function parse(val: Buffer | string | NonNullable<unknown>) {
  if (val instanceof Buffer) {
    return parse(JSON.parse(val.toString()));
  }

  if (typeof val === 'string') {
    return parse(JSON.parse(val));
  }

  if (!('type' in val) || !MESSAGE_TYPES.includes(val.type as string)) {
    return undefined;
  }

  return val;
}

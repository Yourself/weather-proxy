import {
  LightningStrikeEvent,
  Message,
  ObservationAir,
  ObservationSky,
  ObservationTempest,
  RainStartEvent,
  RapidWind,
} from './messages';

export type WindMeasurement = {
  time: Date;
  speed: number; // m / s
  direction: number; // degrees
};

export type AggregateWindData = {
  lull: number; // m / s
  avg: number; // m / s
  gust: number; // m / s
  direction: number; // degrees
  interval: number; // seconds
};

export type LightningData = {
  distance: number; // km
  strikes: number;
};

export type AirObservation = {
  time: Date;
  pressure: number; // millibars
  temperature: number; // C
  humidity: number; // percent
  lightning: LightningData;
  battery: number; // volts
  interval: number; // seconds
};

export type SkyObservation = {
  time: Date;
  wind: AggregateWindData;
  illuminance: number; // lux
  uvIndex: number;
  irradiance: number; // W / m^2
  totalRain: number; // mm
  rainfall: number; // mm / min
  rain: boolean;
  hail: boolean;
  battery: number; // volts
  interval: number; // seconds
};

export type StationObservation = {
  time: Date;
  wind: AggregateWindData;
  pressure: number; // millibars
  temperature: number; // C
  humidity: number; // percent
  illuminance: number; // lux
  uvIndex: number;
  irradiance: number; // W / m^2
  rainfall: number; // mm / min
  rain: boolean;
  hail: boolean;
  lightning: LightningData;
  battery: number; // volts
  interval: number; // seconds
};

export function getData(msg: RainStartEvent): { time: Date };
export function getData(msg: LightningStrikeEvent): { time: Date; distance: /* km */ number; energy: number };
export function getData(msg: RapidWind): WindMeasurement;
export function getData(msg: ObservationAir): AirObservation;
export function getData(msg: ObservationSky): SkyObservation;
export function getData(msg: ObservationTempest): StationObservation;

export function getData(msg: Message) {
  if (msg.type === 'evt_precip') {
    return { time: new Date(msg.evt[0] * 1000) };
  }
  if (msg.type === 'evt_strike') {
    const [epoch, distance, energy] = msg.evt;
    return { time: new Date(epoch * 1000), distance, energy };
  }
  if (msg.type === 'rapid_wind') {
    const [epoch, speed, direction] = msg.ob;
    return { time: new Date(epoch * 1000), speed, direction };
  }
  if (msg.type === 'obs_air') {
    const [epoch, pressure, temperature, humidity, strikes, distance, battery, interval] = msg.obs[0];
    return {
      time: new Date(epoch * 1000),
      pressure,
      temperature,
      humidity,
      lightning: { distance, strikes },
      battery,
      interval: interval * 60,
    };
  }
  if (msg.type === 'obs_sky') {
    const [
      epoch,
      illuminance,
      uvIndex,
      rainfall,
      lull,
      avg,
      gust,
      direction,
      battery,
      obsInterval,
      irradiance,
      totalRain,
      precip,
      interval,
    ] = msg.obs[0];
    return {
      time: new Date(epoch * 1000),
      wind: { lull, avg, gust, direction, interval },
      illuminance,
      uvIndex,
      rainfall,
      irradiance,
      totalRain,
      rain: precip === 1,
      hail: precip === 2,
      battery,
      interval: obsInterval * 60,
    };
  }
  if (msg.type === 'obs_st') {
    const [
      epoch,
      lull,
      avg,
      gust,
      direction,
      interval,
      pressure,
      temperature,
      humidity,
      illuminance,
      uvIndex,
      irradiance,
      rainfall,
      precip,
      distance,
      strikes,
      battery,
      obsInterval,
    ] = msg.obs[0];
    return {
      time: new Date(epoch * 1000),
      wind: { lull, avg, gust, direction, interval },
      lightning: { distance, strikes },
      pressure,
      temperature,
      humidity,
      illuminance,
      uvIndex,
      irradiance,
      rainfall,
      rain: (precip & 1) !== 0,
      hail: (precip & 2) !== 0,
      battery,
      interval: obsInterval * 60,
    };
  }

  return undefined;
}

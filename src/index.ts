import dgram from 'dgram';
import { parse } from './messages';
import { AirObservation, StationObservation, getData } from './types';

const { API_ROOT } = process.env;

async function postAirData(id: string, obs: StationObservation | AirObservation) {
  if (API_ROOT != null) {
    const body = JSON.stringify({ atmp: obs.temperature, rhum: obs.humidity });
    await fetch(`${API_ROOT}/api/restricted/submit/${id}`, {
      method: 'post',
      body,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

const sock = dgram.createSocket('udp4');
sock.on('message', (rawMsg) => {
  const msg = parse(rawMsg);
  if (msg == null) {
    return;
  }

  if (msg.type === 'rapid_wind') {
    const data = getData(msg);
    console.log(data);
  } else if (msg.type === 'obs_st') {
    const data = getData(msg);
    postAirData(msg.serial_number, data);
  }
});
sock.bind(50222);
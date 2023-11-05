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
  } else {
    console.warn('API_ROOT not set');
  }
}

// For some dumbshit reason linux refuses to allow broadcast packets through if we bind to a specific interface, so we
// have to instead just rate limit ourselves to not send more than one request with duplicate data.
let lastReceived = Date.now();
const sock = dgram.createSocket('udp4');
sock.on('message', (rawMsg) => {
  const msg = parse(rawMsg);
  if (msg == null) {
    return;
  }

  if (msg.type === 'obs_st') {
    const now = Date.now();
    if (now - lastReceived < 1000) {
      return;
    }
    const data = getData(msg);
    console.log(data);
    postAirData(msg.serial_number, data);
    lastReceived = now;
  }
});

sock.on('error', (error) => {
  console.error('Socket error:', error);
});

process.on('SIGINT', () => {
  sock.close();
  process.exit();
});

sock.bind({ port: 50222, exclusive: false }, () => {
  console.log(`Listening on ${sock.address().address}:${sock.address().port}`);
  sock.setBroadcast(true);
});

import dgram from 'dgram';
import os from 'os';
import { parse } from './messages';
import { AirObservation, StationObservation, getData } from './types';

const { API_ROOT, NIC_IP } = process.env;

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

const sock = dgram.createSocket('udp4');
sock.on('message', (rawMsg) => {
  const msg = parse(rawMsg);
  if (msg == null) {
    return;
  }

  if (msg.type === 'obs_st') {
    const data = getData(msg);
    console.log(data);
    postAirData(msg.serial_number, data);
  }
});

sock.on('error', (error) => {
  console.error('Socket error:', error);
});

process.on('SIGINT', () => {
  sock.close();
  process.exit();
});

const netIface = Object.values(os.networkInterfaces())
  .flat()
  .find((info) => info?.family === 'IPv4' && !info.internal);

console.log('Found interface: ', netIface);
const ip = NIC_IP ?? netIface?.address;

console.log(`Binding to ${ip}`);
sock.bind(50222, ip);

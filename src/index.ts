import dgram from 'dgram';
import { parse } from './messages';
import { getData } from './types';

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
    console.log(data);
  }
});
sock.bind(50222);

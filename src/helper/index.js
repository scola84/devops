import fail2ban from './fail2ban';
import logwatch from './logwatch';
import ntp from './ntp';
import os from './os';
import sendmail from './sendmail';
import ssh from './ssh';
import swap from './swap';
import sysctl from './sysctl';
import ufw from './ufw';
import upgrades from './upgrades';
import user from './user';

export {
  fail2ban,
  logwatch,
  ntp,
  os,
  sendmail,
  ssh,
  swap,
  sysctl,
  ufw,
  upgrades,
  user
};

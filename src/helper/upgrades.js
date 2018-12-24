import { Commander, pkg } from '@scola/ssh';

export default function unattendedUpgrades() {
  return new Commander({
    description: 'Install unattended-upgrades',
    command: pkg('install', 'unattended-upgrades')
  });
}

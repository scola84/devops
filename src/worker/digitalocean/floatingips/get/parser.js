import { Worker } from '@scola/worker';

export default class GetDigitaloceanFloatingipsParser extends Worker {
  act(response, data, callback) {
    const extra = response.request.extra;
    const box = extra.box;

    const ip = data.floating_ip;
    data = extra.data;

    if (ip.droplet && ip.droplet.id !== data.vps.id) {
      data.vps.actions.assign_floating_ip = true;
    }

    this.pass(box, data, callback);
  }

  err(response, error, callback) {
    const extra = response.request.extra;
    const box = extra.box;

    error.data = extra.data;

    this.fail(box, error, callback);
  }
}

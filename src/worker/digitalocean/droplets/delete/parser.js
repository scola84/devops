import { Worker } from '@scola/worker';

export default class DeleteDigitaloceanDropletParser extends Worker {
  act(response, data, callback) {
    const extra = response.request.extra;
    const box = extra.box;

    this.pass(box, extra.data, callback);
  }

  err(response, error, callback) {
    const extra = response.request.extra;
    const box = extra.box;

    error.data = extra.data;

    this.fail(box, error, callback);
  }
}

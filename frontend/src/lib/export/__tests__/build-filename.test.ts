import { buildExportFilename } from '../build-filename';

describe('buildExportFilename', () => {
  it('builds dated xlsx filename from module slug', () => {
    const name = buildExportFilename('drivers');
    expect(name).toMatch(/^drivers_\d{4}-\d{2}-\d{2}\.xlsx$/);
  });

  it('sanitizes unsafe characters in slug', () => {
    const name = buildExportFilename('gps/devices');
    expect(name).toMatch(/^gps_devices_\d{4}-\d{2}-\d{2}\.xlsx$/);
  });
});

import * as migration_20260801_232755_initial from './20260801_232755_initial';
import * as migration_20260803_155526 from './20260803_155526';
import * as migration_20260815_103000_services_icon_picker from './20260815_103000_services_icon_picker';

export const migrations = [
  {
    up: migration_20260801_232755_initial.up,
    down: migration_20260801_232755_initial.down,
    name: '20260801_232755_initial',
  },
  {
    up: migration_20260803_155526.up,
    down: migration_20260803_155526.down,
    name: '20260803_155526'
  },
  {
    up: migration_20260815_103000_services_icon_picker.up,
    down: migration_20260815_103000_services_icon_picker.down,
    name: '20260815_103000_services_icon_picker'
  },
];

import * as migration_20260801_232755_initial from './20260801_232755_initial';

export const migrations = [
  {
    up: migration_20260801_232755_initial.up,
    down: migration_20260801_232755_initial.down,
    name: '20260801_232755_initial'
  },
];

import * as migration_20260825_205151_initial from './20260825_205151_initial';

export const migrations = [
  {
    up: migration_20260825_205151_initial.up,
    down: migration_20260825_205151_initial.down,
    name: '20260825_205151_initial'
  },
];

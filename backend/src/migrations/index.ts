import * as migration_20260825_205151_initial from './20260825_205151_initial';
import * as migration_20260901_152435 from './20260901_152435';

export const migrations = [
  {
    up: migration_20260825_205151_initial.up,
    down: migration_20260825_205151_initial.down,
    name: '20260825_205151_initial',
  },
  {
    up: migration_20260901_152435.up,
    down: migration_20260901_152435.down,
    name: '20260901_152435'
  },
];

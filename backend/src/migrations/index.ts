import * as migration_20260825_205151_initial from './20260825_205151_initial';
import * as migration_20260901_152435 from './20260901_152435';
import * as migration_20261019_174809_v1_1_audit_improvements from './20261019_174809_v1_1_audit_improvements';

export const migrations = [
  {
    up: migration_20260825_205151_initial.up,
    down: migration_20260825_205151_initial.down,
    name: '20260825_205151_initial',
  },
  {
    up: migration_20260901_152435.up,
    down: migration_20260901_152435.down,
    name: '20260901_152435',
  },
  {
    up: migration_20261019_174809_v1_1_audit_improvements.up,
    down: migration_20261019_174809_v1_1_audit_improvements.down,
    name: '20261019_174809_v1_1_audit_improvements'
  },
];

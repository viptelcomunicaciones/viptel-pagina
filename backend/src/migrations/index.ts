import * as migration_20260825_205151_initial from './20260825_205151_initial';
import * as migration_20260901_152435 from './20260901_152435';
import * as migration_20261019_174809_v1_1_audit_improvements from './20261019_174809_v1_1_audit_improvements';
import * as migration_20261104_150522_add_cta_and_blocks_schema from './20261104_150522_add_cta_and_blocks_schema';
import * as migration_20261106_220152_add_site_settings_and_layout_options from './20261106_220152_add_site_settings_and_layout_options';

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
    name: '20261019_174809_v1_1_audit_improvements',
  },
  {
    up: migration_20261104_150522_add_cta_and_blocks_schema.up,
    down: migration_20261104_150522_add_cta_and_blocks_schema.down,
    name: '20261104_150522_add_cta_and_blocks_schema',
  },
  {
    up: migration_20261106_220152_add_site_settings_and_layout_options.up,
    down: migration_20261106_220152_add_site_settings_and_layout_options.down,
    name: '20261106_220152_add_site_settings_and_layout_options'
  },
];

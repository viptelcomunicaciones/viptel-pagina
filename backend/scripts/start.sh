#!/bin/sh
pnpm payload migrate --forceAcceptWarning || true
pnpm start

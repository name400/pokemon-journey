// Local integration harness only. No API or browser can set this flag, and
// production must not enable the experiment until all lifecycle checks pass.
export function adventureClockExperimentEnabled(){return globalThis.__adventureClockLeaseTestOnly===true;}

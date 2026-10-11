import type { BuildContext, StationDefinition } from "../types";
import { buildConsole } from "./console";
import { buildExperiments } from "./experiments";
import { buildRepair, type RepairParts } from "./repair";
import { buildServers } from "./servers";
import { buildNotebook } from "./notebook";
import { buildComms } from "./comms";

export interface BuiltStations {
  list: StationDefinition[];
  repair: RepairParts;
}

export function buildStations(ctx: BuildContext): BuiltStations {
  const repair = buildRepair(ctx);
  const list: StationDefinition[] = [
    buildConsole(ctx),
    buildExperiments(ctx),
    repair,
    buildServers(ctx),
    buildNotebook(ctx),
    buildComms(ctx),
  ];
  for (const s of list) {
    s.group.userData.station = s.id;
    for (const h of s.hotspots) h.userData.station = s.id;
  }
  return { list, repair: repair.parts };
}

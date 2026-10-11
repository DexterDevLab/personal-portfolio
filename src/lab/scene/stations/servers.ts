import { Group, Mesh, Vector3 } from "three";
import { PALETTE } from "../../config";
import { PartBuilder, box, circle, contactShadow, cyl, hitBox, rbox } from "../../geometry";
import { poseFor } from "../../camera";
import type { Animator, BuildContext, StationDefinition } from "../types";

/**
 * Station 4 — server cabinet (hosting & maintenance). A tall cabinet with
 * six slots, a slow fan, restrained status LEDs and a cable tray running to
 * the console.
 */
export function buildServers(ctx: BuildContext): StationDefinition {
  const mats = ctx.makeMaterials();
  const group = new Group();
  group.name = "station:servers";
  const X = 3.2;
  const Z = -2.25;
  group.position.set(X, 0, Z);
  group.rotation.y = -Math.PI / 2 + 0.7; // faces into the room (−x), turned toward the camera corner

  const parts = new PartBuilder(mats);
  parts
    .add(rbox(1.0, 2.5, 0.8, 0.05), PALETTE.charcoal, { position: [0, 1.25, 0] })
    .add(rbox(0.9, 0.1, 0.9, 0.03), PALETTE.charcoalLight, { position: [0, 0.05, 0] })
    .add(rbox(0.9, 0.08, 0.82, 0.02), PALETTE.teal, { position: [0, 2.54, 0] });
  // Six slots on the front face (local +z)
  for (let i = 0; i < 6; i++) {
    const y = 0.42 + i * 0.34;
    parts
      .add(rbox(0.84, 0.26, 0.06, 0.02), i % 2 ? PALETTE.metal : PALETTE.metalDark, { position: [0, y, 0.4] })
      .add(box(0.3, 0.03, 0.02), PALETTE.charcoal, { position: [-0.15, y - 0.06, 0.44] })
      .add(cyl(0.02, 0.02, 0.03, 8), PALETTE.orange, { position: [0.36, y + 0.06, 0.43], rotation: [Math.PI / 2, 0, 0] });
  }
  // Cable tray toward the console
  parts
    .add(rbox(0.1, 0.06, 1.3, 0.02), PALETTE.metalDark, { position: [-0.65, 2.3, -0.2], rotation: [0, 0.9, 0] })
    .add(cyl(0.02, 0.02, 1.2, 6), PALETTE.blue, { position: [-0.65, 2.34, -0.2], rotation: [Math.PI / 2, 0, -0.9] });
  parts.build(group, ctx.shared.outline, new Set([PALETTE.charcoal]));

  // LEDs: two per slot
  const leds: Mesh[] = [];
  for (let i = 0; i < 6; i++) {
    const y = 0.42 + i * 0.34;
    for (let k = 0; k < 2; k++) {
      const led = new Mesh(box(0.04, 0.04, 0.02), ctx.shared.ledOff);
      led.position.set(0.08 + k * 0.08, y + 0.06, 0.44);
      group.add(led);
      leds.push(led);
    }
  }
  // Fan on the side
  const fanHousing = new Mesh(cyl(0.2, 0.2, 0.04, 20), mats.toon(PALETTE.charcoalLight));
  fanHousing.rotation.z = Math.PI / 2;
  fanHousing.position.set(0.52, 1.6, -0.1);
  const fan = new Group();
  fan.position.set(0.55, 1.6, -0.1);
  for (let b = 0; b < 4; b++) {
    const blade = new Mesh(box(0.02, 0.14, 0.05), mats.toon(PALETTE.teal));
    blade.position.set(0, 0.09, 0);
    const pivot = new Group();
    pivot.rotation.x = (b * Math.PI) / 2;
    pivot.add(blade);
    fan.add(pivot);
  }
  const hub = new Mesh(circle(0.05, 12), ctx.shared.ledOff);
  hub.rotation.y = Math.PI / 2;
  fan.add(hub);
  group.add(fanHousing, fan);

  group.add(contactShadow(ctx.shared, 0.75, { position: [0, 0, 0] }));

  const hotspots = [hitBox(1.3, 2.7, 1.1, { position: [0, 1.3, 0.1] })];
  hotspots.forEach((h) => group.add(h));

  const animators: Animator[] = [
    (() => {
      let next = 0;
      return {
        id: "serverLeds",
        update: (_dt, t) => {
          if (t < next) return false;
          next = t + 0.4;
          const i = Math.floor(Math.random() * leds.length);
          const led = leds[i]!;
          led.material = led.material === ctx.shared.ledOff ? (Math.random() < 0.8 ? ctx.shared.ledTeal : ctx.shared.ledOrange) : ctx.shared.ledOff;
          return true;
        },
      } satisfies Animator;
    })(),
    {
      id: "serverFan",
      update: (dt) => {
        fan.rotation.x += dt * 1.6;
        return true;
      },
    },
  ];

  const focus = new Vector3(X - 0.1, 1.4, Z + 0.2);
  return {
    id: "servers",
    group,
    hotspots,
    materials: mats,
    pressTarget: group,
    pose: poseFor(focus, new Vector3(-0.9, 0, 1), 4.4, 1.4),
    focus,
    animators,
  };
}

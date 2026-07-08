import { composeHarbors } from "./harborRepository";
import { facilitySeed, harborSeed } from "./seed";

export const harbors = composeHarbors(harborSeed, facilitySeed);

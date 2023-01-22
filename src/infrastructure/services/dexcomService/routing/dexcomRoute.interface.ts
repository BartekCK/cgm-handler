import { IDexcomAuthRoute } from './dexcomAuthRoute.inteface';
import { IDexcomServiceRoute } from './dexcomServiceRoute.inteface';

export interface IDexcomRoute extends IDexcomAuthRoute, IDexcomServiceRoute {}

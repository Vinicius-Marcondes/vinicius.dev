import type { InboundPort } from "./port";

export interface UseCase<Input, Output> extends InboundPort<Input, Output> {}

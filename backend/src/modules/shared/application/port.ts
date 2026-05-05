export interface InboundPort<Input, Output> {
  execute(input: Input): Output | Promise<Output>;
}

export interface OutboundPort<Input, Output> {
  execute(input: Input): Output | Promise<Output>;
}

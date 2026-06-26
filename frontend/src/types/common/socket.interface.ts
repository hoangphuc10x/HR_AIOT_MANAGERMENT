export interface CustomSocket {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  on(event: string, callback: (...args: any[]) => void): this;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  off(event?: string, callback?: (...args: any[]) => void): this;
  disconnect(): this;
}

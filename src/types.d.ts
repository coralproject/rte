declare module "*.css";

declare type Omit<U, K extends keyof U> = Pick<U, Exclude<keyof U, K>>;

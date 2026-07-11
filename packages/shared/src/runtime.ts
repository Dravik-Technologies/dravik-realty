export type AppEnvironment = "local" | "staging" | "prod";

declare const process: {
  env: {
    NEXT_PUBLIC_APP_ENV?: string;
  };
};

function normalizeAppEnvironment(value: string | undefined): AppEnvironment {
  if (value === "staging" || value === "prod") {
    return value;
  }

  return "local";
}

export const appEnvironment = normalizeAppEnvironment(
  process.env.NEXT_PUBLIC_APP_ENV
);

export const isLocalDemoEnvironment = appEnvironment === "local";
export const isDemoDataEnvironment = appEnvironment !== "prod";

export function localDemoData<T>(items: T[]): T[] {
  return isDemoDataEnvironment ? items : [];
}

export function localDemoValue<T>(value: T, emptyValue: T): T {
  return isDemoDataEnvironment ? value : emptyValue;
}

export type AuthMode = 'basic' | 'jwt';

export interface RuntimeArgs {
  host?: string;
  author?: string;
  publish?: string;
  authType?: AuthMode;
  username?: string;
  password?: string;
  token?: string;
}

const flagKeys: Record<string, keyof RuntimeArgs> = {
  host: 'host',
  'aem-host': 'host',
  author: 'author',
  'aem-author': 'author',
  publish: 'publish',
  'aem-publish': 'publish',
  username: 'username',
  user: 'username',
  password: 'password',
  pass: 'password',
  token: 'token',
  jwt: 'token',
  'dev-token': 'token',
  bearer: 'token',
  'auth-type': 'authType',
  auth: 'authType',
};

export function parseRuntimeArgs(argv: string[] = process.argv.slice(2)): RuntimeArgs {
  const args: RuntimeArgs = {};

  const readValue = (current: string, index: number) => {
    const [flag, inlineValue] = current.split('=');
    if (inlineValue) return { flag, value: inlineValue };
    const next = argv[index + 1];
    if (next && !next.startsWith('--')) {
      return { flag, value: next };
    }
    return { flag, value: undefined };
  };

  for (let i = 0; i < argv.length; i += 1) {
    const raw = argv[i];
    if (!raw.startsWith('--')) continue;

    const { flag, value } = readValue(raw, i);
    if (value === undefined) continue;

    const normalizedKey = flag.replace(/^--/, '');
    const mappedKey = flagKeys[normalizedKey];

    if (mappedKey === 'authType') {
      args.authType = value === 'jwt' ? 'jwt' : 'basic';
      continue;
    }

    if (mappedKey === 'token') {
      args.token = value;
      args.authType = 'jwt';
      continue;
    }

    if (mappedKey) {
      (args as any)[mappedKey] = value;
      if (mappedKey === 'username' || mappedKey === 'password') {
        args.authType = args.authType || 'basic';
      }
    }

    if (value !== undefined && !nextArgIsFlag(argv, i)) {
      i += 1; // Skip the value we just consumed
    }
  }

  return args;
}

function nextArgIsFlag(argv: string[], index: number): boolean {
  const next = argv[index + 1];
  return !next || next.startsWith('--');
}

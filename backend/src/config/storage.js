import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { env } from './env.js';

const workspaceRoot = fileURLToPath(new URL('../../../', import.meta.url));
export const uploadDirectory = path.isAbsolute(env.STORAGE_PATH) ? env.STORAGE_PATH : path.join(workspaceRoot, env.STORAGE_PATH);

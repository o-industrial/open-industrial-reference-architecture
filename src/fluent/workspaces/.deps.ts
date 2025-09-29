export { parse as parseJsonc } from 'jsr:@std/jsonc@1.0.2';
export { existsSync } from 'jsr:@std/fs@1.0.17/exists';
export { dirname } from 'jsr:@std/path@^1.0.9/dirname';
export { fromFileUrl } from 'jsr:@std/path@^1.0.9/from-file-url';
export { join } from 'jsr:@std/path@^1.0.9/join';

export {
  DFSFileHandler,
  LocalDFSFileHandler,
  type LocalDFSFileHandlerDetails,
} from 'jsr:@fathym/common@0.2.272/dfs';
export { IoCContainer } from 'jsr:@fathym/ioc@0.0.14';

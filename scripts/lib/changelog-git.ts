import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);

export type GitRunner = (args: string[], cwd: string) => Promise<string>;

export const defaultGitRunner: GitRunner = async (args, cwd) => {
  const { stdout } = await execFileAsync('git', args, { cwd, maxBuffer: 1024 * 1024 });
  return stdout;
};

/**
 * Resolve the first semver tag (sorted by v:refname) whose history contains
 * the given commit. Returns "Unreleased" when no tag contains it.
 */
export async function resolveVersionTag(
  commit: string,
  repoPath: string,
  runner: GitRunner = defaultGitRunner,
): Promise<string> {
  const stdout = await runner(
    ['tag', '--contains', commit, '--sort=v:refname'],
    repoPath,
  );
  const first = stdout
    .split('\n')
    .map((line) => line.trim())
    .find((line) => line.length > 0);
  return first ?? 'Unreleased';
}

/**
 * Return the commit SHA that last touched `archivePath` in the source repo.
 * This is used as `source_commit` for a given archived change directory.
 */
export async function resolveArchiveCommit(
  archivePath: string,
  repoPath: string,
  runner: GitRunner = defaultGitRunner,
): Promise<string> {
  const stdout = await runner(
    ['log', '-n', '1', '--format=%H', '--', archivePath],
    repoPath,
  );
  const sha = stdout.trim();
  if (sha === '') {
    throw new Error(
      `Could not resolve commit for ${archivePath} in ${repoPath}. Is the path tracked?`,
    );
  }
  return sha;
}

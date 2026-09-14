async function importModule<T>(url: string): Promise<T> {
  return import(/* @vite-ignore */ url) as Promise<T>;
}

export async function retryLazyImport<T>(
  load: () => Promise<T>,
  attempt: number,
  retryImport: (url: string) => Promise<T> = importModule,
): Promise<T> {
  try {
    return await load();
  } catch (error) {
    if (attempt === 0 || !(error instanceof Error)) {
      throw error;
    }

    const failedUrl = error.message.match(/https?:\/\/\S+/)?.[0];
    if (!failedUrl) {
      throw error;
    }

    const retryUrl = new URL(failedUrl);
    if (retryUrl.origin !== window.location.origin) {
      throw error;
    }

    retryUrl.hash = `retry=${attempt}`;
    return retryImport(retryUrl.href);
  }
}

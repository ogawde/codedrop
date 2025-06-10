import { WebContainer } from '@webcontainer/api';
import { useEffect, useState } from 'react';

interface PreviewFrameProps {
  webContainer: WebContainer;
}

let previewInitialized = false;
let cachedUrl = "";

export function PreviewFrame({ webContainer }: PreviewFrameProps) {
  const [url, setUrl] = useState(cachedUrl);
  const [isLoading, setIsLoading] = useState(!previewInitialized);

  useEffect(() => {
    if (!webContainer) return;

    if (previewInitialized && cachedUrl) {
      setUrl(cachedUrl);
      setIsLoading(false);
      return;
    }

    const main = async () => {
      try {
        setIsLoading(true);
        
        const installProcess = await webContainer.spawn('npm', ['install']);

        await installProcess.exit;

        await webContainer.spawn('npm', ['run', 'dev']);

        webContainer.on('server-ready', (_port, serverUrl) => {
          cachedUrl = serverUrl;
          previewInitialized = true;
          setUrl(serverUrl);
          setIsLoading(false);
        });
      } catch (error) {
        console.error('Error starting preview:', error);
        setIsLoading(false);
      }
    };

    main();
  }, [webContainer]);

  return (
    <div className="h-full flex items-center justify-center text-gray-400">
      {isLoading && (
        <div className="text-center">
          <p className="mb-2">Loading preview...</p>
        </div>
      )}
      {!isLoading && !url && (
        <div className="text-center">
          <p className="mb-2">Waiting for server...</p>
        </div>
      )}
      {url && <iframe width={"100%"} height={"100%"} src={url} />}
    </div>
  );
}
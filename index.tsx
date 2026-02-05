
import React from 'react';
import ReactDOM from 'react-dom/client';
import { TonConnectUIProvider } from '@tonconnect/ui-react';
import App from './App.tsx';

const rootElement = document.getElementById('root');
if (rootElement) {
  const root = ReactDOM.createRoot(rootElement);
  
  /**
   * DYNAMIC MANIFEST GENERATION
   * TonConnect requires the 'url' field in the manifest to match the app's origin exactly.
   * In preview environments (like Bolt), the origin is dynamic. 
   * We generate a Data URL manifest to ensure the 'url' property always matches window.location.origin,
   * effectively preventing 'Manifest content error'.
   */
  const origin = window.location.origin;
  const manifest = {
    url: origin,
    name: "AdTONX",
    iconUrl: "https://i.ibb.co/NgbS3j2F/logo.png",
    termsOfUseUrl: origin,
    privacyPolicyUrl: origin
  };

  const manifestUrl = `data:application/json,${encodeURIComponent(JSON.stringify(manifest))}`;

  root.render(
    <React.StrictMode>
      <TonConnectUIProvider manifestUrl={manifestUrl}>
        <App />
      </TonConnectUIProvider>
    </React.StrictMode>
  );
}

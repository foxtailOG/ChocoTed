import React from 'react';
import ReactDOM from 'react-dom/client';
import { DetailView } from './app/components/DetailView';
import './styles/index.css';

const urlParams = new URLSearchParams(window.location.search);
const dataParam = urlParams.get('data');
const searchData = dataParam ? JSON.parse(decodeURIComponent(dataParam)) : null;

ReactDOM.createRoot(document.getElementById('detail-root')!).render(
  <React.StrictMode>
    {searchData ? (
      <DetailView searchData={searchData} onBack={() => window.close()} />
    ) : (
      <div className="p-8 text-center">No data provided</div>
    )}
  </React.StrictMode>
);

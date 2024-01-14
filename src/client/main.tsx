import { StrictMode } from 'react';
import ReactDOM from 'react-dom/client';

import AppWrapper from './AppWrapper';
import './index.css';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
    <StrictMode>
        <AppWrapper />
    </StrictMode>
);

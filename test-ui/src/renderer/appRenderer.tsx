import ReactDOM from 'react-dom/client';
import './admin-ui/src/utils/styles/index.scss';

import { HashRouter } from 'react-router-dom';
import App from './admin-ui/src/App';

// @ts-ignore
const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <HashRouter>
    <App />
  </HashRouter>
);

import React from 'react';
import { render } from 'react-dom';

import CssBaseline from '@material-ui/core/CssBaseline';
import { MuiThemeProvider } from '@material-ui/core/styles';

import { theme } from './configs/colors';

import Root from './components/Root';

import registerServiceWorker from './registerServiceWorker';

import './assets/styles/app.css';
import './assets/styles/react-color-overwrite.css';

const App = () => (
  <MuiThemeProvider theme={theme}>
    <CssBaseline />

    <Root />
  </MuiThemeProvider>
);

render(<App />, document.getElementById('root'));

registerServiceWorker();

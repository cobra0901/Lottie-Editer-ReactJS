import { createMuiTheme } from '@material-ui/core/styles';

const colors = {
  black: '#171717',
  gray: '#7a7a7a',
  grayLight: '#d8d8d8',
  grayLighter: '#f8f8f8',
  primary: '#00d2c1',
  secondary: '#00b7d2',
  tertiary: '#007a88',
  white: '#ffffff'
};

const theme = createMuiTheme({
  palette: {
    common: { black: colors.black },
    text: { primary: colors.black },
    primary: {
      main: colors.primary,
      contrastText: colors.white
    }
  },
  typography: {
    fontFamily: 'Delius'
  }
});

export { colors as default, theme };

import React from 'react';

import PropTypes from 'prop-types';

import BugReport from '@material-ui/icons/BugReport';
import Colorize from '@material-ui/icons/Colorize';
import FileDownload from '@material-ui/icons/FileDownload';
import FileUpload from '@material-ui/icons/FileUpload';
import Layers from '@material-ui/icons/Layers';
import Link from '@material-ui/icons/Link';
import SentimentVeryDissatisfied from '@material-ui/icons/SentimentVeryDissatisfied';

const icons = {
  BugReport,
  Colorize,
  FileDownload,
  FileUpload,
  Layers,
  Link,
  SentimentVeryDissatisfied
};

const Icon = ({ name, color, size }) => {
  const I = icons[name];
  return <I style={{ color, width: size }} />;
};

Icon.propTypes = {
  color: PropTypes.string,
  name: PropTypes.string.isRequired,
  size: PropTypes.number
};

Icon.defaultProps = {
  color: undefined,
  size: 16
};

export default Icon;

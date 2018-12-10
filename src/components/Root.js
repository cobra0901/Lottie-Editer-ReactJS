import React, { Component } from 'react';

import { diffTrimmedLines as diff } from 'diff';
import { fade, hexToRgb, invert } from 'color-invert';
import { SketchPicker as Picker } from 'react-color';

import CircularProgress from '@material-ui/core/CircularProgress';
import Dropzone from 'react-dropzone';
import GithubCorner from 'react-github-corner';
import log from 'log-with-style';
import Snack from '@material-ui/core/Snackbar';

import colors from '../configs/colors';
import getColors from '../configs/algorithm';

import { download, toUnitVector } from '../configs/utils';

import Btn from './Btn';
import ErrorView from './ErrorView';
import Full from './Full';
import Icon from './Icon';
import Lottie from './Lottie';
import Paper from './Paper';
import Table from './Table';

const { version } = require('../../package.json');

export default class extends Component {
  state = {
    err: false,
    json: '',
    jsonName: '',
    loading: false,
    picker: false,
    presetColors: Object.values(colors),
    rows: [],
    selectedCol: -1,
    selectedRow: -1,
    snack: false,
    snackMessage: '',
    showLayerNames: false
  };

  componentWillMount() {
    const url = (window.location.href.split('src=')[1] || '').split('&')[0];

    if (url) this.fetchUrl(url, 'animation.json');
  }

  // eslint-disable-next-line react/sort-comp
  cols = [
    {
      prop: 'color',
      render: (color, row, col) => {
        const { picker, showLayerNames, rows } = this.state;

        return (
          <div // eslint-disable-line
            style={Object.assign(
              {},
              { backgroundColor: color, color: invert(color) },
              styles.colorRow,
              styles.landing
            )}
            onClick={() =>
              this.setState({
                picker: !picker,
                selectedCol: col,
                selectedRow: row
              })
            }>
            {color}
            {showLayerNames && <br />}
            {showLayerNames && rows[row].nm}
          </div>
        );
      }
    }
  ];

  original = '';

  fetchUrl = (url, fileName) =>
    this.setState({ json: '', err: '', loading: true }, () =>
      fetch(url)
        .then(res => res.json())
        .then(json => this.parse(JSON.stringify(json), fileName))
        .catch(err =>
          this.setState({
            err: true,
            loading: false,
            snack: true,
            snackMessage: err.message
          })
        )
    );

  hidePicker = () => this.setState({ picker: false });

  assignAddAnimation = ref => (this.addAnimation = ref);

  pickColor = (color: Object) => {
    const { rows, selectedRow, selectedCol, json } = this.state;

    const { i, j, k, a, asset } = rows[selectedRow];

    const newColor = color.hex;

    const newRows = rows;
    newRows[selectedRow][this.cols[selectedCol].prop] = newColor;
    this.setState({ rows: newRows });

    const newJson = JSON.parse(json);

    const { r, g, b } = hexToRgb(newColor);

    if (asset === -1) {
      if (newJson && newJson.layers) {
        newJson.layers[i].shapes[j].it[k].c.k = [
          toUnitVector(r),
          toUnitVector(g),
          toUnitVector(b),
          a
        ];
      }
    } else {
      // eslint-disable-next-line no-lonely-if
      if (newJson && newJson.assets) {
        newJson.assets[asset].layers[i].shapes[j].it[k].c.k = [
          toUnitVector(r),
          toUnitVector(g),
          toUnitVector(b),
          a
        ];
      }
    }

    this.setState({ json: JSON.stringify(newJson) });
  };

  pushColor = () => {
    const { presetColors, rows, selectedRow } = this.state;
    const { color } = rows[selectedRow];

    this.setState({ presetColors: presetColors.concat(color) });

    if (this.addAnimation && this.addAnimation.ref) {
      const animation = this.addAnimation.ref;
      animation.setSpeed(3);
      animation.play();
      animation.addEventListener('complete', () =>
        setTimeout(() => animation.goToAndStop(0), 500)
      );
    }
  };

  upload = files => {
    if (files[0]) {
      this.setState({ loading: true });

      const reader = new FileReader();

      reader.onload = e => this.parse(e.target.result, files[0].name);

      reader.readAsText(files[0]);
    }
  };

  parse = (source, fileName) => {
    this.original = source;

    this.setState({ json: source, picker: false, rows: [] }, () => {
      const rows = [];

      let { json } = this.state;
      json = JSON.parse(json);

      let jsonName = fileName.slice(0, -5);
      jsonName += `-w${json.w}-h${json.h}.json`;

      if (json && json.layers) {
        getColors(json.layers, color => rows.push(color));
      }

      if (json && json.assets) {
        json.assets.forEach((asset, i) =>
          getColors(asset.layers, color => rows.push(color), i)
        );
      }

      setTimeout(() => this.setState({ rows, jsonName, loading: false }), 500);
    });
  };

  export = () => {
    const { json, jsonName } = this.state;

    download(json, jsonName);

    setTimeout(() => this.showSnack('Diff is available in the console.'), 500);

    log('Computing diff ..');

    let additions = 0;
    let deletions = 0;

    const original = JSON.stringify(JSON.parse(this.original), null, 2);
    const parsed = JSON.stringify(JSON.parse(json), null, 2);

    diff(original, parsed, {
      newlineIsToken: true
    }).forEach(part => {
      const { added, removed, value } = part;

      const color = added ? 'green' : removed ? 'red' : null;

      if (color) log(`[c="color: ${color};"]${added ? '+' : '-'} ${value}[c]`);

      if (added) additions += value.length;
      else if (removed) deletions += value.length;
    });

    log(
      `[c="color: green;"]${additions} additions[c], [c="color: red;"]${deletions} deletions[c].`
    );
  };

  showSnack = snackMessage => this.setState({ snack: true, snackMessage });

  closeSnack = () => this.setState({ snack: false });

  toggleNames = () =>
    this.setState(state => ({ showLayerNames: !state.showLayerNames }));

  render() {
    const {
      bugHoverColor,
      err,
      json,
      linkHoverColor,
      loading,
      picker,
      presetColors,
      rows,
      selectedRow,
      snack,
      snackMessage
    } = this.state;

    const Animation = () =>
      json && (
        <Lottie
          fallback={<ErrorView color={colors.gray} />}
          src={JSON.parse(json)}
        />
      );

    const { color } = (rows && rows[selectedRow]) || {};

    return (
      <Full style={styles.container}>
        <h3 style={styles.header}>
          <a style={styles.link} href="./">
            Lottie Editor
          </a>
          <sub style={styles.subtitle}> {version}</sub>
        </h3>

        <Full style={styles.row}>
          {!loading &&
            json && (
              <Paper style={styles.left}>
                {picker && (
                  <div style={styles.popover}>
                    <div // eslint-disable-line
                      onClick={this.hidePicker}
                      style={styles.cover}
                    />

                    <Picker
                      color={color}
                      disableAlpha
                      onChange={this.pickColor}
                      presetColors={presetColors}
                    />

                    <div
                      style={{
                        backgroundColor:
                          color === colors.white ? colors.black : colors.white
                      }}>
                      <Btn
                        backgroundColor={color}
                        fullWidth
                        hoverColor={fade(color)}
                        icon={
                          <Lottie
                            config={{ autoplay: false, loop: false }}
                            fallback={
                              <Icon name="Colorize" color={invert(color)} />
                            }
                            ref={this.assignAddAnimation}
                            src={require('../assets/animations/added.json')}
                          />
                        }
                        onClick={this.pushColor}
                        style={styles.add}
                      />
                    </div>
                  </div>
                )}

                <Table noHead cols={this.cols} rows={rows} />
              </Paper>
            )}

          <Paper style={styles.right}>
            <Dropzone
              accept="application/json"
              multiple={false}
              onDrop={this.upload}
              style={styles.dropzone}>
              {loading && (
                <CircularProgress style={{ color: colors.primary }} />
              )}

              {!loading && (
                <Full>
                  {err ? (
                    <ErrorView color={colors.gray} />
                  ) : json ? (
                    <Animation />
                  ) : (
                    <Full style={styles.landing}>
                      <Icon
                        name="FileUpload"
                        color={colors.primary}
                        size={128}
                      />
                      <h3 style={styles.subtitle}>Drag and drop your JSON</h3>
                    </Full>
                  )}
                </Full>
              )}
            </Dropzone>
          </Paper>
        </Full>

        {!loading &&
          json && (
            <div style={styles.bottom}>
              <Paper style={styles.layersBtn}>
                <Btn
                  color="primary"
                  variant="raised"
                  onClick={this.toggleNames}
                  style={{ width: 220 }}>
                  <Icon name="Layers" color={colors.white} />
                </Btn>
              </Paper>

              <Paper>
                <Btn color="primary" variant="raised" onClick={this.export}>
                  <Icon name="FileDownload" color={colors.white} />
                </Btn>
              </Paper>
            </div>
          )}

        {!loading &&
          !json && (
            <div style={Object.assign({}, styles.footer, styles.row)}>
              <div style={Object.assign({}, styles.footerItem, { flex: 3 })}>
                {
                  "Files uploaded here won't be visible for public and aren't stored anywhere in the cloud."
                }
              </div>

              <div
                style={Object.assign({}, styles.footerItem, {
                  marginLeft: 20
                })}>
                <a
                  // href="./?src=https://editor.lottiefiles.com/whale.json"
                  href="./?src=http://localhost:3000/whale.json"
                  style={styles.link}
                  rel="noopener noreferrer"
                  target="_blank"
                  title="Append with /?src=YOUR_LINK">
                  <Icon color={linkHoverColor} name="Link" />
                </a>
              </div>

              <div
                style={Object.assign({}, styles.footerItem, {
                  marginLeft: 20
                })}>
                <a
                  href="https://github.com/sonaye/lottie-editor/issues/1"
                  rel="noopener noreferrer"
                  style={styles.link}
                  target="_blank"
                  title="Not working? report here">
                  <Icon name="BugReport" color={bugHoverColor} />
                </a>
              </div>
            </div>
          )}

        <GithubCorner
          bannerColor={colors.primary}
          href="https://github.com/sonaye/lottie-editor"
          octoColor={colors.white}
        />

        <Snack
          autoHideDuration={4000}
          // bodyStyle={styles.snack}
          message={snackMessage}
          // onRequestClose={this.closeSnack}
          open={snack}
        />
      </Full>
    );
  }
}

const styles = {
  add: { paddingBottom: 10, paddingTop: 10 },
  bottom: {
    marginTop: 20,
    maxHeight: 48,
    flexDirection: 'row',
    display: 'flex'
  },
  colorRow: {
    cursor: 'pointer',
    fontSize: 16,
    textAlign: 'center',
    height: 48,
    width: '100%',
    display: 'flex'
  },
  container: {
    padding: 20,
    paddingRight: 40,
    paddingLeft: 40,
    backgroundColor: colors.grayLighter
  },
  cover: { bottom: 0, left: 0, position: 'fixed', right: 0, top: 0 },
  dropzone: { cursor: 'pointer', display: 'flex', flex: 1 },
  footer: { marginTop: 20 },
  footerItem: { color: colors.gray, display: 'flex' },
  header: { color: colors.primary, margin: 0, marginBottom: 17 },
  landing: { alignItems: 'center', justifyContent: 'center' },
  left: { marginRight: 40, width: 220 },
  link: { color: colors.primary, textDecoration: 'none' },
  popover: { position: 'absolute', zIndex: 1 },
  right: { flex: 3, overflow: 'hidden' },
  row: { display: 'flex', flexDirection: 'row' },
  snack: { borderRadius: 0 },
  subtitle: { color: colors.gray },
  layersBtn: { width: 220, marginRight: 40 }
};

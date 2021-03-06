'use strict';

var React = require('react-native');
var {
  AppRegistry,
  Text,
  View,
  ScrollView,
  AsyncStorage,
  ToastAndroid,
  Alert,
  } = React;

import _ from 'lodash';
import {styles} from './Styles';

import {
  SetServerButton,
  ServerAddressInput,
  ControllerButton,
  PlayPauseButton,
  ShutdownButton,
} from './ButtonSets';

var naiveClient = React.createClass({
  getInitialState: function () {
    return {
      playState: false,
      connectedServer: false,
      serverInfo: {},
    }
  },

  componentDidMount: async function () {
    var value = await AsyncStorage.getItem('serverAddress');
    this.setState({
      serverAddress: value
    });
  },

  _togglePlayState: function () {
    if (this.state.connectedServer) {
      this.setState({
        playState: !this.state.playState
      });
      this._sendCommand('pause_play');
    }
  },

  _inputServerAddress: function (event) {
    this.setState({
      serverAddress: event
    });
  },

  _setServer: async function () {
    if (this.state.serverAddress) {
      fetch('http://' + this.state.serverAddress + '/mobile_connect')
        .then((response) => {
          return response.json();
        })
        .catch(function () {
          ToastAndroid.show('服务器异常', ToastAndroid.SHORT);
        })
        .then((response) => {
          this.setState({
            serverInfo: response
          });
        });

      this.setState({
        connectedServer: true
      });

      await AsyncStorage.setItem('serverAddress', this.state.serverAddress);
    }
  },

  _sendCommand: function (command) {
    if (this.state.connectedServer) {
      fetch('http://' + this.state.serverAddress + '?action=' + command);
    }
  },

  _confirmShutdown: function () {
    Alert.alert(
      '提示',
      '确认要关机吗',
      [
        {text: '取消', style: 'cancel'},
        {text: '确定', onPress: () => this._sendCommand('shutdown')}
      ]
    );
  },

  render: function() {
    return (
      <ScrollView style={styles.scrollView}
                  contentContainerStyle={styles.container}>
        <View style={styles.row}>
          <Text style={styles.welcome}>Netease Music Controller</Text>
          <Text style={styles.connectedMarker}>
            {this.state.connectedServer ? '✓' : ''}
          </Text>
        </View>
        <View style={styles.row}>
          <View style={styles.colNoAlign}>
            <ServerAddressInput value={this.state.serverAddress} onTextChange={(e) => this._inputServerAddress(e)} />
          </View>
          <View style={styles.col}>
            <SetServerButton onPress={() => this._setServer()}/>
          </View>
        </View>
        <View style={styles.row}>
          <View style={styles.col}>
            <ControllerButton onPress={() => this._sendCommand('prev_song')}>
              <Text style={styles.buttonText}>前一首</Text>
            </ControllerButton>
          </View>
          <View style={styles.col}>
            <ControllerButton onPress={() => this._sendCommand('next_song')}>
              <Text style={styles.buttonText}>下一首</Text>
            </ControllerButton>
          </View>
        </View>

        <View style={styles.row}>
          <View style={styles.col}>
            <PlayPauseButton onPress={() => this._togglePlayState()}>
              <Text style={styles.buttonText}>
                播放 / 暂停
              </Text>
            </PlayPauseButton>
          </View>
        </View>

        <View style={styles.row}>
          <View style={styles.col}>
            <ControllerButton onPress={() => this._sendCommand('volume_down')}>
              <Text style={styles.buttonText}>音量-</Text>
            </ControllerButton>
          </View>
          <View style={styles.col}>
            <ControllerButton onPress={() => this._sendCommand('volume_up')}>
              <Text style={styles.buttonText}>音量+</Text>
            </ControllerButton>
          </View>
        </View>

        <View>
          <Text style={styles.textLine}>
            服务器信息
          </Text>
          <Text style={styles.textLine}>
            服务器状态: {this.state.serverInfo.status ? 'online' : 'offline'}
          </Text>
          <Text style={styles.textLine}>
            服务器版本: {this.state.serverInfo.version}
          </Text>
          <Text style={styles.textLine}>
            服务器平台: {this.state.serverInfo.platform}
          </Text>
        </View>

        <View style={styles.row}>
          <Text>Powered By React Native.</Text>
        </View>

        <View style={styles.shutdownButton}>

          <ShutdownButton onPress={() => this._confirmShutdown()}/>
        </View>
      </ScrollView>
    );
  }
});

AppRegistry.registerComponent('naiveClient', () => naiveClient);

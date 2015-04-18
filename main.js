(function(){

  //var config = {
  //  channel: 'tessel-degree',
  //  pubKey: 'pub-c-c20892e1-eb22-45f2-9457-2b5d58d3390e',
  //  subKey: 'sub-c-fd26f1f6-e545-11e4-8eac-0619f8945a4f'
  //};
  var config = {
    channel: 'Sandbox',
    pubKey: 'pub-c-046ffbf3-56c3-42a6-8730-98be12984e81',
    subKey: 'sub-c-f5f16f1c-e593-11e4-b759-0619f8945a4f'
  };

  var connection;

  /**
   * Date.now
   */
  function initDateNow() {
    if (typeof Date.now === 'undefined') {
      Date.now = function() {
        return new Date().getTime();
      };
    }
  }

  /**
   * Vue initialize
   */
  function initVue() {
    Vue.filter('timestamp', function (value) {
      return new Date(value).toString();
    });
  }

  /**
   * create Vue Model
   */
  function createModel() {
    model = new Vue({
      el: '.contents',
      data: {
        value: 0,
        timestamp: 0
      },
      methods: {
        plus: function () {
          pushData(this.$data.value + 1);
        },
        minus: function () {
          pushData(this.$data.value - 1);
        }
      }
    });
    return model;
  }

  /**
   * 接続
   */
  function connect() {
    var pubnub = PUBNUB.init({
      publish_key: config.pubKey,
      subscribe_key: config.subKey
    });
    return pubnub;
  }

  /**
   * initialize Data
   */
  function initData(con) {
    con.history({
      channel: config.channel,
      count: 5,
      callback: onReceiveMessages
    });
    con.subscribe({
      channel: config.channel,
      message: onReceiveMessage
    });
  }

  /**
   * ReceiveMessage handler
   */
  function onReceiveMessages(msgs) {
    console.log('onReceiveMessages:', msgs);
    var msg = msgs[0];
    if (msg instanceof Array) {
      var lastMsg = msg[msg.length-1];
      model.$data.value = lastMsg.value;
      model.$data.timestamp = lastMsg.timestamp;
      flowChart(msg);
    } else {
      model.$data.value = msg.value;
      model.$data.timestamp = msg.timestamp;
      flowChart([msg]);
    }
  }
  function onReceiveMessage(msg) {
    console.log('onReceiveMessage:', msg);
    model.$data.value = msg.value;
    model.$data.timestamp = msg.timestamp;
    flowChart([msg]);
  }

  function pushData(value) {
    var data = { value : value, timestamp: Date.now() };
    connection.publish({
      channel: config.channel,
      message: data
    });
  }

  /**
   * init chart
   */
  function createChart() {
    chart = c3.generate({
      data: {
        json: [
          {value: 0, timestamp: 0},
          {value: 0, timestamp: 0},
          {value: 0, timestamp: 0},
          {value: 0, timestamp: 0},
          {value: 0, timestamp: 0}
        ],
        keys: {
          x: 'timestamp',
          value: ['value']
        }
      },
      axis: {
        x: {
          type: 'timeseries',
          tick: {
            format: '%H:%M:%S'
          }
        },
        y: {
          tick: {
            format: d3.format('d')
          }
        }
      }
    });
    return chart;
  }

  function flowChart(data) {
    chart.flow({
      json: data,
      keys: {
        x: 'timestamp',
        value: ['value']
      },
      duration: 300,
//                length: 0
    });
  }


  /**
   * Main
   */
  function main() {
    initDateNow();
    initVue();
    connection = connect();
    initData(connection);
    var model = createModel();
    var chart = createChart();

    window.sensorModel = model;
  }

  main();

})();

const { ipcRenderer } = require('electron');

var able = 'start';
const ip_reg = /^(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])$/;
const bytes_reg = /^\d+$/;

$(document).ready(function () {
  global.choice = null;
  const cpu_num = require('os').cpus().length;
  $('#process-num').val(cpu_num);

  $('input[name="choice"]').change(function () {
    global.choice = $("input[name='choice']:checked").attr('id');
    if (global.choice === 'icmp') {
      global.choice = 1;
    } else if (global.choice === 'udp') {
      global.choice = 2;
    } else {
      global.choice = null;
    }
    if (global.choice === 1) {
      $('#target-port').attr('disabled', true);
    } else if (global.choice === 2) {
      $('#target-port').attr('disabled', false);
    }
  });

  $('#start-button').click(function () {
    var target_ip = $('#target-ip').val();
    var target_port = $('#target-port').val();
    var bytes = $('#bytes').val();
    var sleep_time = $('#sleep-time').val();
    var process_num = $('#process-num').val();
    var data = [target_ip, target_port, bytes, sleep_time, process_num, global.choice];

    if (global.choice === 1 && target_ip && bytes && sleep_time && process_num) {
      let bytes_num = parseInt(bytes);
      if (ip_reg.test(target_ip) && bytes_reg.test(bytes) && bytes_reg.test(sleep_time) && bytes_reg.test(process_num) && bytes_num > 0 && bytes_num < 65536) {
        if (able === 'start') {
          ipcRenderer.send('start', data);
          $('#start-button').attr('class', 'btn btn-primary disabled');
          $('#stop-button').attr('class', 'btn btn-primary');
          $('#info').text('ATTACKING...');
          able = 'stop';
        }
      } else {
        ipcRenderer.send('error', 'format');
      }
    } else if (global.choice === 2 && target_ip && target_port && bytes && sleep_time && process_num) {
      let target_port_num = parseInt(target_port);
      let bytes_num = parseInt(bytes);
      if (ip_reg.test(target_ip) && bytes_reg.test(target_port) && bytes_reg.test(bytes) && bytes_reg.test(sleep_time) && bytes_reg.test(process_num) && bytes_num > 0 && bytes_num < 65536 && target_port_num > 0 && target_port_num < 65536) {
        if (able === 'start') {
          ipcRenderer.send('start', data);
          $('#start-button').attr('class', 'btn btn-primary disabled');
          $('#stop-button').attr('class', 'btn btn-primary');
          $('#info').text('ATTACKING...');
          able = 'stop';
        }
      } else {
        ipcRenderer.send('error', 'format');
      }
    } else {
      ipcRenderer.send('error', 'lack');
    }
  });

  $('#stop-button').click(function () {
    if (able === 'stop') {
      ipcRenderer.send('stop', 0);
      $('#start-button').attr('class', 'btn btn-primary');
      $('#stop-button').attr('class', 'btn btn-primary disabled');
      $('#info').text('STOPPED');
      able = 'start';
    }
  });
});

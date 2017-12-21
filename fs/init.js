load('api_config.js');
load('api_gpio.js');
load('api_mqtt.js');
load('api_net.js');
load('api_sys.js');
load('api_timer.js');
load("api_dht.js");

//Get GPIO from configurations
let led = Cfg.get('pins.led');
let btn = Cfg.get('pins.button');
let gdRel = Cfg.get('pins.garageDoorRelay');
let dSTri = Cfg.get('pins.doorSensorTrig');
let dSEch = Cfg.get('pins.doorSensorEcho');
let cSTri = Cfg.get('pins.carSensorTrig');
let cSEch = Cfg.get('pins.carSensorEcho');
let dhtS = Cfg.get('pins.dhtSensor');

//Set GPIO pins mode
GPIO.set_mode(led, GPIO.MODE_OUTPUT);
GPIO.set_mode(btn, GPIO.MODE_INPUT);
GPIO.set_mode(gdRel, GPIO.MODE_OUTPUT);
GPIO.set_mode(dSTri, GPIO.MODE_OUTPUT);
GPIO.set_mode(dSEch, GPIO.MODE_INPUT);
GPIO.set_mode(cSTri, GPIO.MODE_OUTPUT);
GPIO.set_mode(cSEch, GPIO.MODE_INPUT);
GPIO.set_mode(dhtS, GPIO.MODE_OUTPUT);


let stTop = '/devices/' + Cfg.get('device.id') + '/garage-door-state';
let ctTop = '/devices/' + Cfg.get('device.id') + '/garage-door-control';

print('LED GPIO:', led, 'button GPIO:', button, 'Garage Relay: ', gdRel, 'Door Sensor Trig: ', dSTri);
print('Door Sensor Echo:', dSEch, 'Car Sensor Tri:', cSTri, 'Car Sensor Echo: ', cSEch, 'DHT: ', dhtS);

let getInfo = function() {
  return JSON.stringify({
    total_ram: Sys.total_ram(),
    free_ram: Sys.free_ram()
  });
};

// Blink built-in LED every second
// GPIO.set_mode(led, GPIO.MODE_OUTPUT);
// Timer.set(1000 /* 1 sec */, true /* repeat */, function() {
//   let value = GPIO.toggle(led);
//   print(value ? 'Tick' : 'Tock', 'uptime:', Sys.uptime(), getInfo());
// }, null);

// Publish to MQTT topic on a button press. Button is wired to GPIO pin 0
GPIO.set_button_handler(button, GPIO.PULL_UP, GPIO.INT_EDGE_NEG, 200, function() {
  let message = getInfo();
  let ok = MQTT.pub(topic, message, 1);
  print('Published:', ok, topic, '->', message);
}, null);

// Monitor network connectivity.
Net.setStatusEventHandler(function(ev, arg) {
  let evs = '???';
  if (ev === Net.STATUS_DISCONNECTED) {
    evs = 'DISCONNECTED';
  } else if (ev === Net.STATUS_CONNECTING) {
    evs = 'CONNECTING';
  } else if (ev === Net.STATUS_CONNECTED) {
    evs = 'CONNECTED';
  } else if (ev === Net.STATUS_GOT_IP) {
    evs = 'GOT_IP';
  }
  print('== Net event:', ev, evs);
}, null);

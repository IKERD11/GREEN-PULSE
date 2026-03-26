#include <WiFi.h>
#include <HTTPClient.h>
#include <WebServer.h>
#include <BLEDevice.h>
#include <BLEServer.h>
#include <BLEUtils.h>
#include <BLE2902.h>
#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>
#include <ArduinoJson.h>

const char* ssid = "&TNMCuautla";
const char* password = "Internet";

String apiKey = "OTB9VUDFDUMP9CTR";
const char* serverUrl = "http://api.thingspeak.com/update";

const int sensorPin = 32;
const int valveNutrients = 26;
const int valveWater = 27;

#define SCREEN_WIDTH 128
#define SCREEN_HEIGHT 64
Adafruit_SSD1306 display(SCREEN_WIDTH, SCREEN_HEIGHT, &Wire, -1);

#define SERVICE_UUID           "0000ffe0-0000-1000-8000-00805f9b34fb"
#define CHARACTERISTIC_UUID_RX "0000ffe2-0000-1000-8000-00805f9b34fb"
#define CHARACTERISTIC_UUID_TX "0000ffe1-0000-1000-8000-00805f9b34fb"

float conductividad = 0, salinidad = 0, humedad = 0, ph = 0;
float humMin = 40, condMin = 300;
float phOffset = 0.0;

bool manualMode = false;
unsigned long lastManualAction = 0;
const long MANUAL_TIMEOUT = 120000;

WebServer webServer(80);
BLECharacteristic *pCharacteristicTX;
unsigned long lastTSUpdate = 0;
const long TS_INTERVAL = 20000; // Incrementado a 20 segs para evitar rate limits de ThinkSpeak

void updateValves(bool nutrients, bool water) {
  digitalWrite(valveNutrients, nutrients ? HIGH : LOW);
  digitalWrite(valveWater, water ? HIGH : LOW);
}

void processAutoLogic() {
  if (manualMode) {
    if (millis() - lastManualAction > MANUAL_TIMEOUT) {
      manualMode = false;
      Serial.println("Volviendo a modo AUTOMÁTICO");
    } else {
      return;
    }
  }

  if (humedad < humMin) {
    updateValves(false, true);
  } else if (conductividad < condMin) {
    updateValves(true, false);
  } else {
    updateValves(false, false);
  }
}

String handleJSONCommand(String input) {
  StaticJsonDocument<200> doc;
  DeserializationError err = deserializeJson(doc, input);
  if (err) return "{\"status\":\"ERROR\"}";

  const char* v = doc["valvula"];
  const char* a = doc["accion"];

  if (!v || !a) return "{\"status\":\"ERROR\"}";

  manualMode = true;
  lastManualAction = millis();
  bool newState = (strcmp(a, "ON") == 0);

  if (String(v) == "V1") digitalWrite(valveNutrients, newState ? HIGH : LOW);
  else if (String(v) == "V2") digitalWrite(valveWater, newState ? HIGH : LOW);

  return "{\"valvula\":\"" + String(v) + "\",\"estado\":\"" + String(a) + "\",\"mode\":\"MANUAL\",\"status\":\"OK\"}";
}

bool deviceConnected = false;

class MyServerCallbacks: public BLEServerCallbacks {
    void onConnect(BLEServer* pServer) {
      deviceConnected = true;
      Serial.println("Cliente BLE conectado!");
    };
    void onDisconnect(BLEServer* pServer) {
      deviceConnected = false;
      Serial.println("Cliente BLE desconectado. Reiniciando Advertising...");
      // Reanudar la publicidad BLE para que otros dispositivos puedan conectarse
      pServer->getAdvertising()->start();
    }
};

class MyCallbacks: public BLECharacteristicCallbacks {
    void onWrite(BLECharacteristic *pc) {
      String val = String(pc->getValue().c_str());
      if (val.length() > 0) {
        String res = handleJSONCommand(val);
        pCharacteristicTX->setValue(res.c_str());
        pCharacteristicTX->notify();
      }
    }
};

void handleControl() {
  if (webServer.hasArg("plain")) {
    String res = handleJSONCommand(webServer.arg("plain"));
    webServer.send(200, "application/json", res);
  }
}

void setup() {
  Serial.begin(115200);

  pinMode(valveNutrients, OUTPUT);
  pinMode(valveWater, OUTPUT);
  updateValves(false, false);

  Wire.begin(21, 22);
  if (!display.begin(SSD1306_SWITCHCAPVCC, 0x3C)) Serial.println("OLED error");
  display.clearDisplay();
  display.setTextColor(SSD1306_WHITE);

  WiFi.begin(ssid, password);
  Serial.print("Conectando WiFi");
  int retries = 0;
  // Timeout de 10 segundos para no bloquear el dispositivo
  while (WiFi.status() != WL_CONNECTED && retries < 40) { 
    delay(250); 
    Serial.print("."); 
    retries++; 
  }

  display.clearDisplay();
  display.setTextSize(1);
  display.setCursor(0, 10);
  
  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("\nWiFi OK");
    Serial.print("IP: "); Serial.println(WiFi.localIP());
    display.println("SISTEMA: EN LINEA");
    display.setCursor(0, 30);
    display.print("IP: ");
    display.println(WiFi.localIP());
  } else {
    Serial.println("\nWiFi Falló. Iniciando modo offline.");
    display.println("SISTEMA: OFFLINE");
    display.setCursor(0, 30);
    display.println("Sin red WiFi");
  }

  display.setCursor(0, 50);
  display.println("Iniciando BLE...");
  display.display();
  delay(3000);

  webServer.on("/control", HTTP_POST, handleControl);
  webServer.begin();

  BLEDevice::init("GREEN_PULSE_SMART");
  // Aumentar tamaño MTU a 512 bytes para evitar que el JSON se fragmente
  BLEDevice::setMTU(512);

  BLEServer *pServer = BLEDevice::createServer();
  pServer->setCallbacks(new MyServerCallbacks());
  BLEService *pService = pServer->createService(SERVICE_UUID);
  BLECharacteristic *px = pService->createCharacteristic(CHARACTERISTIC_UUID_RX, BLECharacteristic::PROPERTY_WRITE);
  px->setCallbacks(new MyCallbacks());
  pCharacteristicTX = pService->createCharacteristic(CHARACTERISTIC_UUID_TX, BLECharacteristic::PROPERTY_NOTIFY);
  pCharacteristicTX->addDescriptor(new BLE2902());
  pService->start();
  pServer->getAdvertising()->start();
  Serial.println("BLE OK");
}

void loop() {
  webServer.handleClient();

  // Intento periódico de reconexión de WiFi si se llega a perder
  static unsigned long lastWiFiCheck = 0;
  if (WiFi.status() != WL_CONNECTED && (millis() - lastWiFiCheck > 30000)) {
    Serial.println("Conexión perdida. Intentando reconectar WiFi...");
    WiFi.disconnect();
    WiFi.begin(ssid, password);
    lastWiFiCheck = millis();
  }

  static unsigned long lastReading = 0;
  if (millis() - lastReading > 2000) {
    lastReading = millis();
    long suma = 10;
    for(int i=0; i<10; i++) suma += analogRead(sensorPin);
    int raw = suma / 10;
    float voltaje = raw * (3.3 / 4095.0);
    
    conductividad = max(0.0f, (float)(2047 - raw));
    salinidad = conductividad * 0.5;
    humedad = constrain(map(raw, 2047, 217, 0, 100), 0, 100);
    ph = (voltaje * 3.5) + phOffset;

    processAutoLogic();

    display.clearDisplay();
    display.setTextSize(1);
    display.setCursor(0,0);
    display.print("Cond: "); display.print(conductividad);
    display.setCursor(0, 10);
    display.print("Sal:  "); display.print(salinidad);
    display.setCursor(0, 20);
    display.print("pH:   "); display.println(ph);
    display.setCursor(0, 30);
    display.print("Hum:  "); display.print(humedad); display.println("%");
    
    display.setCursor(0, 45);
    display.print("V1:"); display.print(digitalRead(valveNutrients)?"ON":"OFF");
    display.setCursor(64, 45);
    display.print("V2:"); display.print(digitalRead(valveWater)?"ON":"OFF");
    
    display.setCursor(0, 56);
    display.print(manualMode ? "[MODO MANUAL]" : "[MODO AUTOMATICO]");
    display.display();
  }

  if (millis() - lastTSUpdate > TS_INTERVAL) {
    if (WiFi.status() == WL_CONNECTED) {
      lastTSUpdate = millis();
      HTTPClient http;
      String url = String(serverUrl) + "?api_key=" + apiKey + "&field1=" + conductividad + "&field2=" + salinidad + "&field3=" + ph + "&field4=" + humedad;
      http.begin(url);
      http.GET();
      http.end();
    }
  }
}

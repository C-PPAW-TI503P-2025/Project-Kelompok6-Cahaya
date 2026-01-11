/*
 * =====================================================
 * ESP32 TWILIGHT SWITCH - BACKEND SYNC
 * =====================================================
 * Relay dikontrol 100% oleh BACKEND
 * ESP32 hanya kirim data lux dan terima perintah relay
 * =====================================================
 */

#include <WiFi.h>
#include <HTTPClient.h>
#include <Wire.h>
#include <BH1750.h>
#include <ArduinoJson.h>

/* ================= WIFI ================= */
const char* ssid     = "Galaxy A54 5G FEB7";
const char* password = "12345678";

/* ================= SERVER =============== */
String dataUrl     = "http://10.228.186.151:3000/api/iot/data";
String settingsUrl = "http://10.228.186.151:3000/api/iot/settings";

/* ================= PIN ================== */
#define SDA_PIN   17
#define SCL_PIN   16
#define RELAY_PIN 25

/* ================= SENSOR =============== */
BH1750 lightMeter;

/* ================= SYSTEM =============== */
float lux = 0;
bool relayState = false;
String mode = "auto";
int luxThreshold = 100;

unsigned long lastSend = 0;
unsigned long lastGet  = 0;

#define SEND_INTERVAL     3000   // Kirim data setiap 5 detik
#define SETTINGS_INTERVAL 5000  // Cek settings setiap 10 detik

/* ================================================= */
void setup() {
  Serial.begin(115200);
  delay(1000);

  Serial.println("\n=================================");
  Serial.println("ESP32 TWILIGHT SWITCH");
  Serial.println("Backend Sync Mode");
  Serial.println("=================================\n");

  // Setup relay pin
  pinMode(RELAY_PIN, OUTPUT);
  digitalWrite(RELAY_PIN, LOW); // RELAY OFF (ACTIVE HIGH)
  Serial.println("✅ Relay initialized (OFF)");

  // Setup I2C untuk BH1750
  Wire.begin(SDA_PIN, SCL_PIN);
  Serial.println("✅ I2C initialized");

  // Inisialisasi BH1750
  if (!lightMeter.begin(BH1750::CONTINUOUS_HIGH_RES_MODE)) {
    Serial.println("❌ BH1750 NOT FOUND!");
    Serial.println("   Check wiring:");
    Serial.println("   VCC → 3.3V");
    Serial.println("   GND → GND");
    Serial.println("   SDA → D17");
    Serial.println("   SCL → D16");
    while (1) delay(1000);
  }
  Serial.println("✅ BH1750 detected");

  // Koneksi WiFi
  Serial.print("\n🔌 Connecting to WiFi");
  WiFi.begin(ssid, password);
  
  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 20) {
    delay(500);
    Serial.print(".");
    attempts++;
  }

  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("\n✅ WiFi Connected!");
    Serial.print("📡 IP: ");
    Serial.println(WiFi.localIP());
  } else {
    Serial.println("\n❌ WiFi Failed!");
  }

  Serial.println("\n=================================");
  Serial.println("🚀 SYSTEM READY");
  Serial.println("=================================\n");
  delay(2000);
}

/* ================================================= */
void loop() {
  unsigned long now = millis();

  // Kirim data sensor ke backend
  if (now - lastSend >= SEND_INTERVAL) {
    lastSend = now;
    readSensorAndSend();
  }

  // Ambil settings dari backend
  if (now - lastGet >= SETTINGS_INTERVAL) {
    lastGet = now;
    getSettings();
  }

  delay(100);
}

/* ================= READ & SEND ================= */
void readSensorAndSend() {
  // Baca sensor
  lux = lightMeter.readLightLevel();
  
  if (lux < 0) {
    Serial.println("❌ Sensor error!");
    return;
  }

  // Tampilkan data
  Serial.println("\n─────────────────────────────────");
  Serial.print("☀️  Lux: ");
  Serial.print(lux, 1);
  
  // Tampilkan status berdasarkan threshold
  if (lux < luxThreshold) {
    Serial.print(" [GELAP - Relay should be ON]");
  } else {
    Serial.print(" [TERANG - Relay should be OFF]");
  }
  Serial.println();

  Serial.print("💡 Relay: ");
  Serial.print(relayState ? "ON ⚡" : "OFF 💤");
  Serial.print(" | Mode: ");
  Serial.print(mode);
  Serial.print(" | Threshold: ");
  Serial.print(luxThreshold);
  Serial.println(" lux");

  // Kirim ke backend
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("⚠️  WiFi disconnected!");
    return;
  }

  HTTPClient http;
  http.begin(dataUrl);
  http.addHeader("Content-Type", "application/json");

  // Buat JSON payload
  String payload = "{";
  payload += "\"lux\":" + String(lux, 2) + ",";
  payload += "\"relay_status\":" + String(relayState ? "true" : "false");
  payload += "}";

  Serial.print("📤 Sending... ");

  // Kirim POST request
  int code = http.POST(payload);

  if (code > 0) {
    Serial.print("✅ OK (");
    Serial.print(code);
    Serial.println(")");

    // Parse response dari backend
    String response = http.getString();
    
    StaticJsonDocument<512> doc;
    DeserializationError error = deserializeJson(doc, response);

    if (!error && doc.containsKey("relay_state")) {
      bool newRelayState = doc["relay_state"];
      
      Serial.print("🔧 Backend says: Relay should be ");
      Serial.println(newRelayState ? "ON" : "OFF");
      
      // Update relay sesuai perintah backend
      setRelay(newRelayState);
    } else {
      Serial.println("⚠️  No relay_state in response");
    }

  } else {
    Serial.print("❌ FAILED (");
    Serial.print(code);
    Serial.println(")");
  }

  http.end();
  Serial.println("─────────────────────────────────");
}

/* ================= GET SETTINGS =============== */
void getSettings() {
  if (WiFi.status() != WL_CONNECTED) return;

  HTTPClient http;
  http.begin(settingsUrl);
  int code = http.GET();

  if (code == 200) {
    String response = http.getString();
    
    StaticJsonDocument<256> doc;
    DeserializationError error = deserializeJson(doc, response);

    if (!error) {
      String newMode = doc["mode"].as<String>();
      int newThreshold = doc["lux_threshold"];
      bool manualState = doc["manual_relay_state"];

      // Update settings lokal
      if (newMode != mode || newThreshold != luxThreshold) {
        mode = newMode;
        luxThreshold = newThreshold;
        
        Serial.println("\n⚙️  SETTINGS UPDATED");
        Serial.print("   Mode: ");
        Serial.println(mode);
        Serial.print("   Threshold: ");
        Serial.println(luxThreshold);
        
        // Jika mode manual, update relay
        if (mode == "manual") {
          Serial.print("   Manual State: ");
          Serial.println(manualState ? "ON" : "OFF");
          setRelay(manualState);
        }
      }
    }
  }

  http.end();
}

/* ================= SET RELAY ================== */
void setRelay(bool state) {
  if (state != relayState) {
    relayState = state;
    
    // ACTIVE HIGH: true=HIGH (ON), false=LOW (OFF)
    // Relay Anda nyala saat HIGH, mati saat LOW
    digitalWrite(RELAY_PIN, state ? HIGH : LOW);
    
    Serial.println("\n🔄 *** RELAY CHANGED ***");
    Serial.print("   Relay is now: ");
    Serial.println(state ? "ON ⚡" : "OFF 💤");
    Serial.println("   *********************");
  }
}

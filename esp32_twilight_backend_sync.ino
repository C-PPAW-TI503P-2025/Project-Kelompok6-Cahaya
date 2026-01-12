#include <WiFi.h>
#include <HTTPClient.h>
#include <Wire.h>
#include <BH1750.h>
#include <ArduinoJson.h>

/* ================= WIFI ================= */
const char* ssid     = "Galaxy A54 5G FEB7";
const char* password = "12345678";

/* ================= SERVER =============== */
String dataUrl     = "http://10.190.173.151:3000/api/iot/data";
String settingsUrl = "http://10.190.173.151:3000/api/iot/settings";

/* ================= PIN ================== */
#define SDA_PIN   17
#define SCL_PIN   16
#define RELAY_PIN 26

/* ================= SENSOR =============== */
BH1750 lightMeter;

/* ================= SYSTEM =============== */
float lux = 0;
bool relayState = false;
String mode = "auto";
int luxThreshold = 200;  // Default threshold

unsigned long lastSend = 0;
unsigned long lastGet  = 0;

#define SEND_INTERVAL     3000   // Kirim data setiap 3 detik
#define SETTINGS_INTERVAL 5000   // Cek settings setiap 5 detik

/* ================================================= */
void setup() {
  Serial.begin(115200);
  delay(1000);

  Serial.println("\n=================================");
  Serial.println("ESP32 TWILIGHT SWITCH");
  Serial.println("Backend Sync Mode v2.0");
  Serial.println("=================================\n");

  // Setup relay pin
  pinMode(RELAY_PIN, OUTPUT);
  digitalWrite(RELAY_PIN, HIGH); // ACTIVE LOW: HIGH = OFF (Lampu MATI)
  Serial.println("✅ Relay initialized (OFF - Lampu MATI)");

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
    
    StaticJsonDocument<1024> doc;
    DeserializationError error = deserializeJson(doc, response);

    if (!error) {
      // Backend response structure:
      // { "success": true, "relay_state": bool, "mode": "auto/manual", ... }
      
      if (doc.containsKey("relay_state")) {
        bool newRelayState = doc["relay_state"];
        String backendMode = doc["mode"].as<String>();
        
        Serial.print("🔧 Backend says: Mode=");
        Serial.print(backendMode);
        Serial.print(", Relay=");
        Serial.println(newRelayState ? "ON" : "OFF");
        
        // Update mode lokal
        mode = backendMode;
        
        // Update relay sesuai perintah backend
        setRelay(newRelayState);
      } else {
        Serial.println("⚠️  No relay_state in response");
      }
    } else {
      Serial.print("⚠️  JSON parse error: ");
      Serial.println(error.c_str());
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
    
    StaticJsonDocument<512> doc;
    DeserializationError error = deserializeJson(doc, response);

    if (!error) {
      // Backend response structure:
      // { "success": true, "data": { "mode": "auto", "lux_threshold": 200, "manual_relay_state": false } }
      
      if (doc.containsKey("data")) {
        JsonObject data = doc["data"];
        
        String newMode = data["mode"].as<String>();
        int newThreshold = data["lux_threshold"];
        bool manualState = data["manual_relay_state"];

        // Update settings lokal
        bool settingsChanged = false;
        
        if (newMode != mode) {
          mode = newMode;
          settingsChanged = true;
        }
        
        if (newThreshold != luxThreshold) {
          luxThreshold = newThreshold;
          settingsChanged = true;
        }
        
        if (settingsChanged) {
          Serial.println("\n⚙️  SETTINGS UPDATED");
          Serial.print("   Mode: ");
          Serial.println(mode);
          Serial.print("   Threshold: ");
          Serial.print(luxThreshold);
          Serial.println(" lux");
          
          // Jika mode manual, update relay sesuai manual_relay_state
          if (mode == "manual") {
            Serial.print("   Manual State: ");
            Serial.println(manualState ? "ON" : "OFF");
            setRelay(manualState);
          }
        }
      }
    } else {
      Serial.print("⚠️  Settings JSON parse error: ");
      Serial.println(error.c_str());
    }
  } else if (code > 0) {
    Serial.print("⚠️  Settings GET failed: ");
    Serial.println(code);
  }

  http.end();
}

/* ================= SET RELAY ================== */
void setRelay(bool state) {
  if (state != relayState) {
    relayState = state;
    
    // ⚠️ ACTIVE LOW: Relay module dengan optocoupler biasanya ACTIVE LOW
    // true (ON)  = LOW  → Relay tertutup, lampu NYALA
    // false (OFF) = HIGH → Relay terbuka, lampu MATI
    // 
    // Jika relay Anda ACTIVE HIGH (jarang), ubah menjadi:
    // digitalWrite(RELAY_PIN, state ? HIGH : LOW);
    
    digitalWrite(RELAY_PIN, state ? LOW : HIGH);  // ACTIVE LOW
    
    Serial.println("\n🔄 *** RELAY CHANGED ***");
    Serial.print("   Relay is now: ");
    Serial.println(state ? "ON ⚡ (Lampu NYALA)" : "OFF 💤 (Lampu MATI)");
    Serial.print("   GPIO Pin: ");
    Serial.println(state ? "LOW" : "HIGH");
    Serial.println("   *********************");
  }
}

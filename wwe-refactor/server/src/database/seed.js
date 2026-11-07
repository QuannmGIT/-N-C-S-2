/**
 * Seed data for the storefront catalogue — used by seedMongoDB() to populate MongoDB Atlas.
 */

export const CATEGORIES = [
  {
    key: "iot",
    name: "IoT & Wireless",
    img: "/assets/products/Sensors & Wireless.png",
  },
  {
    key: "robotics",
    name: "Robotics",
    img: "/assets/products/Microcontrollers.png",
  },
  {
    key: "displays",
    name: "Displays",
    img: "/assets/products/TFT 2.4 ILI9341.png",
  },
  { key: "tools", name: "Tools", img: "/assets/posts/Tools & Accessories.png" },
];

export const PRODUCTS = [
  {
    slug: "esp32s3",
    name: "ESP32-S3-DevKitC-1",
    category: "iot",
    brand: "Espressif",
    specs: "Dual-core Wi-Fi + BT 5.0, 8MB PSRAM, USB-C",
    img: "/assets/products/ESP32-S3-DevKitC-1.png",
    price: 185000,
    oldPrice: 210000,
    badge: "hot",
    stock: 42,
  },
  {
    slug: "ov7670",
    name: "Camera OV7670 Module",
    category: "iot",
    brand: "Omnivision",
    specs: "640×480 resolution, I2C interface",
    img: "/assets/products/Camera OV7670 Module.png",
    price: 65000,
    oldPrice: 85000,
    badge: "sale",
    stock: 30,
  },
  {
    slug: "esp8266",
    name: "ESP8266 NodeMCU v3",
    category: "iot",
    brand: "Espressif",
    specs: "Wi-Fi 802.11 b/g/n, 80MHz, 4MB Flash",
    img: "/assets/products/ESP8266 NodeMCU v3.jpg",
    price: 55000,
    oldPrice: 70000,
    badge: "sale",
    stock: 55,
  },
  {
    slug: "lora32",
    name: "LoRa32 SX1276 Module",
    category: "iot",
    brand: "TTGO",
    specs: '868/915 MHz LoRa, OLED 0.96", ESP32',
    img: "/assets/products/LoRa32 SX1276 Module.png",
    price: 210000,
    oldPrice: null,
    badge: "hot",
    stock: 18,
  },
  {
    slug: "bms3s",
    name: "BMS 3S 40A Module",
    category: "robotics",
    brand: "Generic",
    specs: "Lithium battery protection with balance",
    img: "/assets/products/BMS 3S 40A Module.png",
    price: 42000,
    oldPrice: null,
    badge: null,
    stock: 60,
  },
  {
    slug: "nano",
    name: "Arduino Nano Every",
    category: "robotics",
    brand: "Arduino",
    specs: "ATMega4809, 20MHz, 48KB Flash",
    img: "/assets/products/Arduino Nano Every.png",
    price: 245000,
    oldPrice: null,
    badge: null,
    stock: 25,
  },
  {
    slug: "servo",
    name: "MG996R Servo Motor",
    category: "robotics",
    brand: "Tower Pro",
    specs: "11 kg/cm torque, 360° rotation, metal gear",
    img: "/assets/products/MG996R Servo Motor.png",
    price: 75000,
    oldPrice: 95000,
    badge: "sale",
    stock: 40,
  },
  {
    slug: "stepper",
    name: "NEMA 17 Stepper Motor",
    category: "robotics",
    brand: "Generic",
    specs: "1.8° step angle, 2A, 59 N·cm holding torque",
    img: "/assets/products/NEMA 17 Stepper Motor.png",
    price: 145000,
    oldPrice: null,
    badge: null,
    stock: 22,
  },
  {
    slug: "oled128",
    name: 'OLED 1.3" SH1106',
    category: "displays",
    brand: "Waveshare",
    specs: "128×64 px, I2C/SPI, 3.3–5V",
    img: "/assets/products/OLED 1.3 SH1106.png",
    price: 38000,
    oldPrice: 50000,
    badge: "sale",
    stock: 48,
  },
  {
    slug: "tft24",
    name: 'TFT 2.4" ILI9341',
    category: "displays",
    brand: "Ilitek",
    specs: "240×320 px, SPI, touch, SD slot",
    img: "/assets/products/TFT 2.4 ILI9341.png",
    price: 89000,
    oldPrice: null,
    badge: "hot",
    stock: 33,
  },
  {
    slug: "epaper",
    name: 'E-Paper 2.9" HAT',
    category: "displays",
    brand: "Good Display",
    specs: "296×128 px, ultra-low power, SPI",
    img: "/assets/products/E-Paper 2.9 HAT.png",
    price: 185000,
    oldPrice: null,
    badge: null,
    stock: 15,
  },
  {
    slug: "lcd16",
    name: "LCD 16×2 with I2C",
    category: "displays",
    brand: "HD44780",
    specs: "16 columns × 2 rows, backlight, I2C backpack",
    img: "/assets/products/LCD 16x2 with I2C.png",
    price: 28000,
    oldPrice: 35000,
    badge: "sale",
    stock: 70,
  },
  {
    slug: "logic8",
    name: "Logic Analyzer 8CH",
    category: "tools",
    brand: "Saleae",
    specs: "24MHz sampling, USB, compatible with Logic 2",
    img: "/assets/products/Logic Analyzer 8CH.png",
    price: 320000,
    oldPrice: 390000,
    badge: "sale",
    stock: 12,
  },
  {
    slug: "multimeter",
    name: "UT61E Digital Multimeter",
    category: "tools",
    brand: "UNI-T",
    specs: "True RMS, 22000 counts, auto range",
    img: "/assets/products/UT61E Digital Multimeter.png",
    price: 580000,
    oldPrice: null,
    badge: "hot",
    stock: 10,
  },
  {
    slug: "psu",
    name: "RD6006 Power Supply Module",
    category: "tools",
    brand: "RIDEN",
    specs: "60V 6A, constant Quantumage/current, LCD",
    img: "/assets/products/RD6006 Power Supply Module.png",
    price: 750000,
    oldPrice: null,
    badge: null,
    stock: 8,
  },
  {
    slug: "heatgun",
    name: "858D Hot Air Rework",
    category: "tools",
    brand: "Quick",
    specs: "200–480°C, digital display, adjustable airflow",
    img: "/assets/products/858D Hot Air Rework.png",
    price: 490000,
    oldPrice: 550000,
    badge: "sale",
    stock: 14,
  },
];

/*
 * Articles: the 6 fully-written ones carried over from post.html, plus the 5
 * previously-dead slugs now seeded with real content. `tag` derived from cat
 * label; cat_color is the article-page accent; the SPA maps category → badge
 * color for the grid cards.
 */
export const ARTICLES = [
  {
    slug: "esp32-guide",
    title:
      "Getting Started with ESP32: Comprehensive Guide from GPIO to OTA Update",
    category: "Tutorials",
    cat_label: "Tutorial",
    cat_color: "#c8410f",
    author: "QuantumCore Team",
    avatar: "/assets/icons/userlogo.svg",
    published: "2025-04-01",
    minutes: 8,
    reads: 34200,
    img: "/assets/posts/esp32 getting started.png",
    emoji: "🔌",
    gradient: "linear-gradient(135deg,#1a0d08,#2d1506)",
    excerpt:
      "ESP32 is the most powerful microcontroller at its price point — dual-core 240MHz, integrated WiFi/Bluetooth 5.0, 34+ GPIOs, DAC, and 12-bit ADC. This guide takes you through Arduino IDE setup, GPIO programming, WiFi/BLE connectivity, to over-the-air (OTA) firmware updates.",
    tags: ["ESP32", "Arduino", "IoT", "WiFi", "OTA"],
    toc: [
      "Why ESP32?",
      "Setting Up the IDE",
      "GPIO Basics",
      "WiFi & BLE",
      "OTA Firmware Updates",
    ],
    featured: 1,
    content: `
      <h2 id="s0">Why ESP32?</h2>
      <p>The ESP32 is a game-changer for maker projects. At under $5, you get a dual-core Xtensa LX6 processor running at up to 240 MHz, 520 KB SRAM, integrated 802.11 b/g/n WiFi, Bluetooth 4.2/5.0, and 34 programmable GPIO pins — all on a single chip.</p>
      <div class="info-box">
        <span class="icon">💡</span>
        <p>Compared to the Arduino Uno, the ESP32 is roughly <strong>10× faster</strong>, has <strong>100× more RAM</strong>, and adds wireless connectivity. For IoT projects, it's the obvious choice.</p>
      </div>

      <h2 id="s1">Setting Up the IDE</h2>
      <p>You can use the Arduino IDE (recommended for beginners) or PlatformIO in VS Code (recommended for professional projects). We'll use Arduino IDE 2.x here.</p>
      <ol>
        <li>Download Arduino IDE 2.x from <code>arduino.cc/en/software</code></li>
        <li>Open <strong>File → Preferences</strong> and paste the ESP32 board URL into "Additional Board Manager URLs":</li>
      </ol>
      <pre><code>https://raw.githubusercontent.com/espressif/arduino-esp32/gh-pages/package_esp32_index.json</code></pre>
      <p>Then go to <strong>Tools → Board → Board Manager</strong>, search for "esp32" by Espressif, and install version 2.x or later.</p>

      <h2 id="s2">GPIO Basics</h2>
      <p>GPIO (General Purpose Input/Output) pins let you read sensors, control LEDs, drive motors, and communicate with other devices. The ESP32-DevKitC exposes 34 GPIO pins, though some have restrictions.</p>
      <h3>Blink an LED</h3>
      <pre><code>#define LED_PIN 2   // Built-in LED on most boards

void setup() {
  pinMode(LED_PIN, OUTPUT);
}

void loop() {
  digitalWrite(LED_PIN, HIGH);  // ON
  delay(500);
  digitalWrite(LED_PIN, LOW);   // OFF
  delay(500);
}</code></pre>
      <blockquote>
        <p>GPIO 34–39 are <em>input-only</em> — they have no internal pull-up/pull-down resistors. Avoid using them for output.</p>
      </blockquote>

      <h2 id="s3">WiFi &amp; BLE</h2>
      <p>Connecting the ESP32 to WiFi takes less than 10 lines of code thanks to the <code>WiFi.h</code> library bundled with the Espressif Arduino core.</p>
      <pre><code>#include &lt;WiFi.h&gt;

const char* ssid     = "YourSSID";
const char* password = "YourPassword";

void setup() {
  Serial.begin(115200);
  WiFi.begin(ssid, password);

  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("Connected! IP: " + WiFi.localIP().toString());
}

void loop() { }</code></pre>
      <p>For Bluetooth Low Energy (BLE), use the <code>BLEDevice</code> library included in the core. BLE is ideal for low-power peripherals like heart rate monitors and beacons.</p>

      <h2 id="s4">OTA Firmware Updates</h2>
      <p>Over-the-Air (OTA) updates let you push new firmware to a deployed device over WiFi — no USB cable required. This is critical for production IoT products.</p>
      <pre><code>#include &lt;ArduinoOTA.h&gt;
#include &lt;WiFi.h&gt;

void setup() {
  WiFi.begin("SSID", "PASSWORD");
  while (WiFi.status() != WL_CONNECTED) delay(500);

  ArduinoOTA.setHostname("Quantumcore-device");
  ArduinoOTA.setPassword("ota-secret");
  ArduinoOTA.begin();
}

void loop() {
  ArduinoOTA.handle();  // Must call every loop
  // Your main code here
}</code></pre>
      <div class="info-box">
        <span class="icon">🔒</span>
        <p>Always set a strong OTA password. An unprotected OTA endpoint is a serious security vulnerability in production devices.</p>
      </div>
      <p>You can now upload firmware from <strong>Tools → Port → Network Ports</strong> in Arduino IDE, selecting your device's hostname on the local network.</p>
    `,
  },
  {
    slug: "arduino-r3-vs-r4",
    title: "Arduino Uno R3 vs R4 WiFi: Which One to Buy in 2025?",
    category: "Reviews",
    cat_label: "Review",
    cat_color: "#1a6b4a",
    author: "The Electronic Guy",
    avatar: "/assets/icons/userlogo.svg",
    published: "2025-03-28",
    minutes: 5,
    reads: 9800,
    img: "/assets/posts/r3r4.png",
    emoji: "🔬",
    gradient: "linear-gradient(135deg,#0a1929,#0d2137)",
    excerpt:
      "Detailed analysis of differences in chips, performance, pricing, and ecosystem between the two most popular Arduino Uno versions.",
    tags: ["Arduino", "Review", "Comparison", "R4", "WiFi"],
    toc: [
      "Core Differences",
      "Performance",
      "WiFi Features",
      "Pricing",
      "Verdict",
    ],
    featured: 0,
    content: `
      <h2 id="s0">Core Differences</h2>
      <p>The R3 uses the classic ATmega328P (8-bit, 16 MHz, 2 KB SRAM). The R4 WiFi moves to a Renesas RA4M1 (32-bit Arm Cortex-M4, 48 MHz, 32 KB SRAM) and adds an ESP32-S3 co-processor for wireless.</p>
      <div class="info-box">
        <span class="icon">📊</span>
        <p>The R4 delivers <strong>3× the clock speed</strong>, <strong>16× more SRAM</strong>, and native floating-point — making it far better suited for DSP, sensor fusion, and ML tasks.</p>
      </div>

      <h2 id="s1">Performance</h2>
      <p>We benchmarked both boards running a 1000-sample FFT and computing a 32×32 matrix multiplication:</p>
      <ul>
        <li><strong>FFT 1024pt:</strong> R3 = 380 ms · R4 = 28 ms (13.6× faster)</li>
        <li><strong>Matrix multiply:</strong> R3 = 1.4 s · R4 = 90 ms (15.6× faster)</li>
      </ul>

      <h2 id="s2">WiFi Features (R4 WiFi only)</h2>
      <p>The R4 WiFi ships with an ESP32-S3 handling 2.4 GHz 802.11 b/g/n and Bluetooth 5.0. Espressif's AT-command firmware is pre-loaded, and Arduinos WiFiS3 library wraps it cleanly. The board also has a 12×8 LED matrix built in — great for quick status displays.</p>

      <h2 id="s3">Pricing</h2>
      <p>R3 hovers around $27 official MSRP (clones as low as $3). R4 WiFi retails at $27.50 official — essentially the same price as R3 official, with massively more capability. Clones do not yet exist for R4.</p>

      <h2 id="s4">Verdict</h2>
      <blockquote><p>If you're starting fresh in 2025: buy the R4 WiFi. If you have existing R3 shields and code that must work unchanged: the R3 remains fully supported. For everything new, R4 is the clear winner.</p></blockquote>
    `,
  },
  {
    slug: "i2c-spi-uart",
    title: "I2C vs SPI vs UART: When to Use Which Protocol?",
    category: "Technical",
    cat_label: "Technical",
    cat_color: "#2563a8",
    author: "Sigma Boy",
    avatar: "/assets/icons/userlogo.svg",
    published: "2025-03-22",
    minutes: 6,
    reads: 14200,
    img: "/assets/posts/uartvsi2cvsspi.png",
    emoji: "🔀",
    gradient: "linear-gradient(135deg,#071a10,#0d2a1a)",
    excerpt:
      "Guide to choosing the right communication protocol — from sensors to displays, RF modules, and external memory.",
    tags: ["I2C", "SPI", "UART", "Protocols", "Embedded"],
    toc: ["UART", "I2C", "SPI", "Quick Comparison", "Which to Choose?"],
    featured: 0,
    content: `
      <h2 id="s0">UART — Universal Asynchronous Receiver/Transmitter</h2>
      <p>UART is the simplest of the three. It uses just two wires (TX and RX), requires no shared clock, and is perfect for point-to-point communication — think serial monitor, GPS modules, or GSM modules.</p>
      <ul>
        <li><strong>Wires:</strong> 2 (TX, RX)</li>
        <li><strong>Devices:</strong> Point-to-point only</li>
        <li><strong>Speed:</strong> Up to ~5 Mbps in theory, 115200 bps typical</li>
        <li><strong>Use when:</strong> Talking to a GPS, Bluetooth module, or PC terminal</li>
      </ul>

      <h2 id="s1">I2C — Inter-Integrated Circuit</h2>
      <p>I2C uses two wires (SDA and SCL) and supports multiple devices on the same bus, each identified by a 7-bit address. Ideal for sensors and low-speed peripherals.</p>
      <pre><code>#include &lt;Wire.h&gt;

void setup() {
  Wire.begin();                  // Join bus as master
  Wire.beginTransmission(0x68);  // Start talking to device at 0x68
  Wire.write(0x6B);              // Register address (e.g. MPU-6050 power)
  Wire.write(0);                 // Value to write
  Wire.endTransmission();
}</code></pre>
      <div class="info-box">
        <span class="icon">⚠️</span>
        <p>I2C requires pull-up resistors on both SDA and SCL lines — typically 4.7 kΩ to 10 kΩ. Most breakout boards include these.</p>
      </div>

      <h2 id="s2">SPI — Serial Peripheral Interface</h2>
      <p>SPI is the fastest of the three. It uses 4 wires (MOSI, MISO, SCK, CS) and achieves speeds up to 80 MHz on ESP32. Each device needs its own CS (Chip Select) pin.</p>
      <ul>
        <li><strong>Wires:</strong> 4+ (MOSI, MISO, SCK, CS per device)</li>
        <li><strong>Devices:</strong> Multiple (one CS pin each)</li>
        <li><strong>Speed:</strong> Up to 80 MHz on ESP32</li>
        <li><strong>Use when:</strong> Driving TFT displays, SD cards, high-speed ADCs</li>
      </ul>

      <h2 id="s3">Quick Comparison</h2>
      <p>Here's how the three protocols stack up at a glance:</p>
      <ul>
        <li><strong>UART</strong> — Simple, 2 wires, point-to-point, moderate speed</li>
        <li><strong>I2C</strong> — 2 wires, multi-device, addresses, slower but very convenient</li>
        <li><strong>SPI</strong> — 4+ wires, multi-device, fastest, best for data-heavy peripherals</li>
      </ul>

      <h2 id="s4">Which to Choose?</h2>
      <blockquote><p>Use <strong>I2C</strong> when wiring space matters and speed is under 400 kHz. Use <strong>SPI</strong> for displays, SD cards, and anything needing high throughput. Use <strong>UART</strong> for simple one-to-one communication.</p></blockquote>
      <p>In most real designs, you'll use all three — I2C for sensors, SPI for the display, and UART for debugging and external modules.</p>
    `,
  },
  {
    slug: "tflite-esp32",
    title: "Running TensorFlow Lite on ESP32: Offline Voice Recognition",
    category: "AI & IoT",
    cat_label: "AI & IoT",
    cat_color: "#0891b2",
    author: "Edge Impulse",
    avatar: "/assets/icons/userlogo.svg",
    published: "2025-03-15",
    minutes: 12,
    reads: 21000,
    img: "/assets/posts/speechrec.png",
    emoji: "🎙️",
    gradient: "linear-gradient(135deg,#100a1a,#1c0d2e)",
    excerpt:
      "Deploying compact ML models on ESP32 for high-accuracy, low-power wake-word detection without internet.",
    tags: ["TensorFlow Lite", "ESP32", "AI", "Voice", "ML"],
    toc: [
      "Why TFLite on MCUs?",
      "Model Preparation",
      "Audio Pipeline",
      "Inference Loop",
      "Results",
    ],
    featured: 0,
    content: `
      <h2 id="s0">Why TFLite on Microcontrollers?</h2>
      <p>Running inference directly on an ESP32 means zero latency, no internet dependency, and sub-milliwatt idle power. For wake-word detection ("Hey QuantumCore!"), this is exactly what you need.</p>
      <div class="info-box">
        <span class="icon">🧠</span>
        <p>TensorFlow Lite for Microcontrollers (TFLite Micro) targets devices with as little as 256 KB RAM. The ESP32 has 520 KB — plenty for a compact keyword-detection model.</p>
      </div>

      <h2 id="s1">Model Preparation</h2>
      <p>Train a keyword recognition model using Google's Speech Commands dataset, then quantize it to 8-bit integers to shrink it from ~1 MB to ~40 KB:</p>
      <pre><code># Convert and quantize with TFLite converter
converter = tf.lite.TFLiteConverter.from_saved_model(saved_model_dir)
converter.optimizations = [tf.lite.Optimize.DEFAULT]
converter.target_spec.supported_ops = [tf.lite.OpsSet.TFLITE_BUILTINS_INT8]
tflite_model = converter.convert()

# Save the binary
with open('model.tflite', 'wb') as f:
    f.write(tflite_model)</code></pre>
      <p>Then convert to a C array for embedding in your firmware:</p>
      <pre><code>xxd -i model.tflite &gt; model_data.cc</code></pre>

      <h2 id="s2">Audio Pipeline</h2>
      <p>The I2S digital microphone (like INMP441) streams 16-bit PCM audio at 16 kHz directly to the ESP32's I2S peripheral, bypassing the CPU until a full 1-second window is ready.</p>
      <pre><code>#include &lt;driver/i2s.h&gt;

i2s_config_t i2s_config = {
  .mode = (i2s_mode_t)(I2S_MODE_MASTER | I2S_MODE_RX),
  .sample_rate = 16000,
  .bits_per_sample = I2S_BITS_PER_SAMPLE_16BIT,
  .channel_format = I2S_CHANNEL_FMT_ONLY_LEFT,
  .communication_format = I2S_COMM_FORMAT_STAND_I2S,
  .intr_alloc_flags = 0,
  .dma_buf_count = 8,
  .dma_buf_len = 512,
};</code></pre>

      <h2 id="s3">Inference Loop</h2>
      <p>On each 1-second audio window: compute a Mel spectrogram, flatten to a 1960-element float array, quantize to int8, and run the TFLite interpreter.</p>
      <pre><code>// Quantize input
for (int i = 0; i &lt; kInputSize; i++) {
  input-&gt;data.int8[i] = (int8_t)(mel_features[i] / scale + zero_point);
}

// Run inference
TfLiteStatus invoke_status = interpreter-&gt;Invoke();

// Read output
int8_t* output = output_tensor-&gt;data.int8;
int prediction = std::distance(output, std::max_element(output, output + kLabelCount));</code></pre>

      <h2 id="s4">Results</h2>
      <p>On our test set of 500 utterances per keyword, the quantized model achieved 94.2% accuracy with an inference time of just <strong>18 ms</strong> at 240 MHz. Current draw during inference peaked at 120 mA, dropping to 8 µA in deep sleep between windows.</p>
      <blockquote><p>With a 3000 mAh LiPo and wake-word polling every 1 second, estimated battery life exceeds 14 months.</p></blockquote>
    `,
  },
  {
    slug: "iot-power-tips",
    title: "Optimizing Power Consumption for IoT: Extend Battery Life 10x",
    category: "Tips & Tricks",
    cat_label: "Tips & Tricks",
    cat_color: "#7c3aed",
    author: "Kukukaka",
    avatar: "/assets/icons/userlogo.svg",
    published: "2025-03-08",
    minutes: 7,
    reads: 7600,
    img: "/assets/posts/optimize.png",
    emoji: "🔋",
    gradient: "linear-gradient(135deg,#071520,#0a2030)",
    excerpt:
      "Deep sleep, light sleep, CPU frequency scaling, and disabling WiFi — keep your IoT device running for a year on a single charge.",
    tags: ["IoT", "Power", "Battery", "ESP32", "DeepSleep"],
    toc: [
      "Deep Sleep",
      "Light Sleep",
      "WiFi Tricks",
      "CPU Scaling",
      "Checklist",
    ],
    featured: 0,
    content: `
      <h2 id="s0">Deep Sleep</h2>
      <p>The biggest win. ESP32 in deep sleep draws only <strong>5–10 µA</strong>, versus ~160 mA active. Use <code>esp_deep_sleep_start()</code> whenever the device doesn't need to run.</p>
      <pre><code>#include &lt;esp_sleep.h&gt;

void setup() {
  // Do your work here (read sensor, send data)
  sendSensorData();

  // Sleep for 60 seconds
  esp_sleep_enable_timer_wakeup(60 * 1000000ULL);
  esp_deep_sleep_start();
  // Code after this line never executes
}</code></pre>
      <div class="info-box">
        <span class="icon">⚡</span>
        <p>Deep sleep resets the chip on wakeup — <code>setup()</code> runs again. Store state in RTC memory with <code>RTC_DATA_ATTR</code> to survive sleep cycles.</p>
      </div>

      <h2 id="s1">Light Sleep</h2>
      <p>Light sleep keeps RAM and the CPU state intact, waking in under 1 ms. Current: ~0.8 mA — 200× less than active. Perfect for applications that need fast response.</p>
      <pre><code>esp_sleep_enable_timer_wakeup(10000);  // 10 ms
esp_light_sleep_start();
// Execution continues here after wakeup</code></pre>

      <h2 id="s2">WiFi Tricks</h2>
      <p>WiFi consumes ~160–300 mA during active transmission. Strategies to minimize this:</p>
      <ul>
        <li>Enable <strong>Modem Sleep</strong>: WiFi stays associated but powers down between DTIM beacons</li>
        <li>Use <strong>static IP</strong>: Skip DHCP negotiation (saves ~200 ms and significant energy per boot)</li>
        <li>Batch sensor readings — connect once, send a batch, disconnect</li>
        <li>Use <strong>UDP</strong> instead of TCP for small payloads (no handshake overhead)</li>
      </ul>

      <h2 id="s3">CPU Frequency Scaling</h2>
      <p>Drop the CPU clock for non-time-critical work. Each halving of frequency roughly halves dynamic power.</p>
      <pre><code>#include &lt;esp_pm.h&gt;

esp_pm_config_esp32_t pm_config = {
  .max_freq_mhz = 240,
  .min_freq_mhz = 10,
  .light_sleep_enable = true
};
esp_pm_configure(&amp;pm_config);</code></pre>

      <h2 id="s4">Power Optimization Checklist</h2>
      <ul>
        <li>✅ Use deep sleep between sensor readings</li>
        <li>✅ Enable WiFi modem sleep when idle</li>
        <li>✅ Use static IP to skip DHCP</li>
        <li>✅ Lower CPU freq when WiFi is off</li>
        <li>✅ Disable Bluetooth if unused: <code>btStop()</code></li>
        <li>✅ Store state in RTC memory</li>
        <li>✅ Choose low-power sensors (e.g. SHT40 over DHT22)</li>
      </ul>
      <blockquote><p>Combining deep sleep, static IP, and batched transmissions, we measured a 3000 mAh cell lasting <strong>18 months</strong> on a once-per-minute soil moisture sensor.</p></blockquote>
    `,
  },
  {
    slug: "pwm-guide",
    title: "What is PWM? Controlling LED Brightness, Motor Speed, and Servos",
    category: "Tutorials",
    cat_label: "Tutorial",
    cat_color: "#c8410f",
    author: "Yes King",
    avatar: "/assets/icons/userlogo.svg",
    published: "2025-03-02",
    minutes: 6,
    reads: 11400,
    img: "/assets/posts/controlling led.png",
    emoji: "〰️",
    gradient: "linear-gradient(135deg,#1a0808,#2d0f0f)",
    excerpt:
      "Simulate analog outputs with a digital signal — fade LEDs, drive DC motors via H-bridges, and position hobby servos with precise 50 Hz pulses.",
    tags: ["PWM", "Arduino", "Motors", "Servos", "LED"],
    toc: ["What is PWM?", "LED Brightness", "DC Motor Speed", "Servo Control"],
    featured: 0,
    content: `
      <h2 id="s0">What is PWM?</h2>
      <p>Pulse Width Modulation (PWM) is a technique for simulating an analog output using a digital signal. By rapidly switching a pin between HIGH and LOW, and varying the ratio of HIGH time to total period (the "duty cycle"), you can control the average Quantumage seen by a load.</p>
      <div class="info-box">
        <span class="icon">📐</span>
        <p>50% duty cycle = half average Quantumage. 100% duty cycle = full Quantumage. 0% duty cycle = 0 V.</p>
      </div>

      <h2 id="s1">LED Brightness</h2>
      <p>Arduino's <code>analogWrite()</code> produces 490 Hz PWM on most pins. The human eye integrates flicker above ~50 Hz, perceiving intermediate brightness.</p>
      <pre><code>int brightness = 0;
int fadeAmount = 5;

void loop() {
  analogWrite(9, brightness);   // PWM on pin 9
  brightness += fadeAmount;
  if (brightness == 0 || brightness == 255) fadeAmount = -fadeAmount;
  delay(30);
}</code></pre>

      <h2 id="s2">DC Motor Speed</h2>
      <p>Drive a DC motor via an L298N or DRV8833 H-bridge with PWM on the enable pin. Higher duty cycle = more average current = higher RPM.</p>
      <pre><code>int motorPin = 5;
analogWrite(motorPin, 128);  // ~50% speed</code></pre>

      <h2 id="s3">Servo Control</h2>
      <p>Servos use PWM at 50 Hz with pulse widths between 1 ms (0°) and 2 ms (180°). The Arduino Servo library handles all of this automatically.</p>
      <pre><code>#include &lt;Servo.h&gt;
Servo myServo;

void setup() {
  myServo.attach(9);     // Servo signal wire to pin 9
}
void loop() {
  myServo.write(0);      // Rotate to 0 degrees
  delay(1000);
  myServo.write(90);     // Rotate to 90 degrees
  delay(1000);
  myServo.write(180);    // Rotate to 180 degrees
  delay(1000);
}</code></pre>
    `,
  },
  {
    slug: "smart-home-hub",
    title: "Build a Smart Home Hub with ESP32 and Home Assistant",
    category: "Projects",
    cat_label: "Projects",
    cat_color: "#0891b2",
    author: "QuantumCore Team",
    avatar: "/assets/icons/userlogo.svg",
    published: "2025-02-18",
    minutes: 10,
    reads: 11500,
    img: "/assets/posts/esp32homeassistant.png",
    emoji: "🏠",
    gradient: "linear-gradient(135deg,#0d1b12,#1e3a26)",
    excerpt:
      "Connect sensors, relays, and displays into a unified smart home dashboard using MQTT and Home Assistant YAML configs.",
    tags: ["ESP32", "Home Assistant", "MQTT", "Smart Home", "Sensors"],
    toc: ["Architecture", "Hardware BOM", "MQTT Wiring", "YAML Dashboard"],
    featured: 0,
    content: `
      <h2 id="s0">Architecture</h2>
      <p>An ESP32-S3 firmware publishes sensor readings to an MQTT broker; Home Assistant subscribes and drives automations; browsers and phones consume the dashboard. Everything stays local — no cloud account required, and topics survive broker restarts with <code>retain</code> flags.</p>
      <div class="info-box">
        <span class="icon">🛰️</span>
        <p>Keep one root topic per room (e.g. <code>home/living</code>) and publish leaf topics under it: <code>home/living/temperature</code>, <code>home/living/relay1/command</code>. Debugging with <code>mosquitto_sub -v</code> becomes trivial.</p>
      </div>

      <h2 id="s1">Hardware BOM</h2>
      <ul>
        <li>ESP32-S3-DevKitC-1 — the hub brain</li>
        <li>DHT22 or SHT40 for temperature/humidity</li>
        <li>2–4 channel relay module for lights and fans</li>
        <li>OLED 1.3" SH1106 for the physical status panel</li>
        <li>5V/2A PSU — relays and WiFi together dip below brown-out on weaker supplies</li>
      </ul>

      <h2 id="s2">MQTT Wiring</h2>
      <p>Publish telemetry every 30 s and act on switch commands immediately:</p>
      <pre><code>#include &lt;PubSubClient.h&gt;

void callback(char* topic, byte* payload, unsigned int len) {
  String cmd = String((char*)payload).substring(0, len);
  if (cmd == "ON")  digitalWrite(RELAY_PIN, HIGH);
  if (cmd == "OFF") digitalWrite(RELAY_PIN, LOW);
}</code></pre>

      <h2 id="s3">YAML Dashboard</h2>
      <p>Home Assistant consumes the broker via <code>mqtt.yaml</code>; sensors and switches map one-to-one to your topics:</p>
      <pre><code>sensor:
  - name: "Living Room Temp"
    state_topic: "home/living/temperature"
    unit_of_measurement: "°C"
    device_class: temperature
switch:
  - name: "Fan"
    command_topic: "home/living/relay1/command"
    state_topic: "home/living/relay1/state"</code></pre>
      <blockquote><p>Start with one room end-to-end (sensor → dashboard → automation), then clone. Wiring four rooms at once is how topics get misspelled.</p></blockquote>
    `,
  },
  {
    slug: "soldering-101",
    title: "Soldering 101: Tools, Techniques, and Common Mistakes",
    category: "Tutorials",
    cat_label: "Tutorial",
    cat_color: "#c8410f",
    author: "Sigma Boy",
    avatar: "/assets/icons/userlogo.svg",
    published: "2025-02-05",
    minutes: 9,
    reads: 18400,
    img: "/assets/posts/soldering.png",
    emoji: "🔧",
    gradient: "linear-gradient(135deg,#1a0f08,#2d1a0d)",
    excerpt:
      "Everything a beginner needs — choosing the right iron and solder to fixing cold joints, bridges, and lifted pads.",
    tags: ["Soldering", "Tools", "Basics", "Electronics"],
    toc: ["Tools You Need", "Making a Good Joint", "Fixing Common Mistakes"],
    featured: 0,
    content: `
      <h2 id="s0">Tools You Need</h2>
      <p>A temperature-controlled 60–80 W iron beats cheap fixed-power units for through-hole work; hot-air rework (858D-class stations) handles SMD later. you'll want 0.7 mm rosin-core solder (or SAC305 lead-free with flux), side cutters, tweezers, and brass sponge tip cleaner.</p>
      <div class="info-box">
        <span class="icon">🌡️</span>
        <p>Start at ~330 °C for leaded solder, ~360 °C for lead-free. Higher irons cook flux faster than you can move the solder — slow joints are cold joints.</p>
      </div>

      <h2 id="s1">Making a Good Joint</h2>
      <p>A proper joint looks like a small shiny volcano, wetting both pad and pin. Heat the joint for 1–2 s, feed solder at the pin (not the tip), then pull both away simultaneously. Add a drop of flux when oxidized boards refuse to wet.</p>
      <pre><code>1. Wipe tip on brass sponge
2. Tin the tip
3. Touch pad + pin with the tip
4. Feed 1–2 mm of solder
5. Remove solder, remove iron, hold still</code></pre>

      <h2 id="s2">Fixing Common Mistakes</h2>
      <p><strong>Cold joints</strong> (dull, grey) — re-heat and add flux. <strong>Bridges</strong> on fine-pitch chips — drag fresh iron with flux, or braid with wick. <strong>Lifted pads</strong> — stop, don't re-plate; scrape to the trace and solder to the copper line. desoldering is 80% patience: wick + fresh tip, never force.</p>
      <blockquote><p>Rivet rule: a joint you have to re-melt more than twice means upgrade the tip or drop the temperature — the board wins ties.</p></blockquote>
    `,
  },
  {
    slug: "mqtt-esp32",
    title:
      "MQTT Explained: Building an IoT Pub/Sub System with ESP32 and Mosquitto",
    category: "Technical",
    cat_label: "Technical",
    cat_color: "#7c3aed",
    author: "Hachimi Mambo",
    avatar: "/assets/icons/userlogo.svg",
    published: "2025-02-24",
    minutes: 9,
    reads: 9800,
    img: "/assets/posts/mqtt.png",
    emoji: "📡",
    gradient: "linear-gradient(135deg,#0a1425,#12305c)",
    excerpt:
      "Publish/subscribe messaging for microcontrollers — topics, QoS, retained messages, and last-will notifications, with an esp32 + mosquitto walkthrough.",
    tags: ["MQTT", "ESP32", "IoT", "PubSub", "Mosquitto"],
    toc: ["Why MQTT?", "Topics & QoS", "ESP32 Client Code"],
    featured: 0,
    content: `
      <h2 id="s0">Why MQTT?</h2>
      <p>MQTT is a light publish/subscribe protocol — 2-byte minimum header, no handshakes per message — designed exactly for devices that sleep most of their lives. One broker (Mosquitto) routes messages by topic pattern between hundreds of nodes without any node knowing another's address.</p>
      <div class="info-box">
        <span class="icon">📭</span>
        <p>Retained messages let a battery node that wakes once per hour read the latest room temperature immediately, without waiting for the next sensor publish.</p>
      </div>

      <h2 id="s1">Topics &amp; QoS</h2>
      <p>Topics are slash-separated trees. <code>Quantumcore/lab/temp</code> publishes measurement; <code>Quantumcore/lab/fan/cmd</code> switches the fan. Three QoS levels trade guarantees vs. overhead: 0 at-most-once (fine most times), 1 at-least-once (commands), 2 exactly-once (rarely needed). Pair a Last Will &amp; Testament (LWT) so the broker snapshots "device offline" for you.</p>

      <h2 id="s2">ESP32 Client Code</h2>
      <p>Mosquitto runs on a Raspberry Pi (or anywhere). The ESP32 side is small: WiFi → PubSubClient → subscribe to command topics, publish telemetry. Common automation-grade snippets:</p>
      <pre><code>#include &lt;PubSubClient.h&gt;

client.setServer("192.168.1.10", 1883);
client.setCallback(callback);

// graceful reconnect with LWT registered once at boot:
client.connect(
  "esp32-01", NULL, NULL,
  "Quantumcore/esp32-01/status", 1, true, "offline"
);</code></pre>
      <blockquote><p>Reconnect on <code>client.state()</code>, not <code>random delay</code> — exponential backoff keeps a power-cycling network from pinning the broker's CPU.</p></blockquote>
    `,
  },
  {
    slug: "chatgpt-robot-arm",
    title: "ChatGPT + Arduino: Building a Voice-Activated Robot Arm",
    category: "AI & IoT",
    cat_label: "AI & IoT",
    cat_color: "#0891b2",
    author: "Hachimi Mambo",
    avatar: "/assets/icons/userlogo.svg",
    published: "2025-01-30",
    minutes: 11,
    reads: 16000,
    img: "/assets/posts/chatgpt+esp32.png",
    emoji: "🦾",
    gradient: "linear-gradient(135deg,#14101f,#2a1d40)",
    excerpt:
      "Give a 4-DOF arm a natural language interface — speech-to-text, an LLM that plans servo moves, and a constrained command surface that keeps every swing inside the arm's physical limits.",
    tags: ["AI", "LLM", "Robotics", "Arduino", "Voice"],
    toc: ["How It Works", "Voice to Intent", "Servo Choreography"],
    featured: 0,
    content: `
      <h2 id="s0">How It Works</h2>
      <p>Three layers: a phone app transcribes your phrase ("pick up the red block and put it on the scale"), an LLM translates that into a compact sequence of arm commands (home → approach → close → lift → drop), and an ESP32 plays the schedule back on four servos with PID-stabilized move timing.</p>
      <div class="info-box">
        <span class="icon">🧠</span>
        <p>Constrain the model by only offering commands it may emit: <code>{"action":"move","x":120,"y":40,"z":80,"grip":45}</code> instead of free-form angles. You get a tighter, safer command surface for free.</p>
      </div>

      <h2 id="s1">Voice to Intent</h2>
      <p>Whisper-quality small models run locally now, but latency-wise a 1-call cloud STT is still 400 ms faster on phone hardware. Either way, feed the model the arm's geometry (link lengths, max reach, grab height) as text — it will keep invented positions inside physical limits if you ask it nicely and validate anyway.</p>

      <h2 id="s2">Servo Choreography</h2>
      <p>Playing four planned poses is easy; the polish is tweening between them on <code>move timing = max axis delta / speed cap</code>:</p>
      <pre><code>long moveTime = maxAxisDelta() / SPEED_DEG_PER_S; // ms
for (int t = 0; t &lt;= moveTime; t += 20) {
  writePose(p1, p2, easeInOut(t / (float)moveTime));
  delay(20);
}</code></pre>
      <blockquote><p>Always physically E-stop before the first run of a new plan — LLM output is a suggestion layer, not a safety system.</p></blockquote>
    `,
  },
  {
    slug: "top-arduino-projects",
    title: "Top 10 Arduino Projects for Beginners",
    category: "Tutorials",
    cat_label: "Tutorial",
    cat_color: "#c8410f",
    author: "QuantumCore Team",
    avatar: "/assets/icons/userlogo.svg",
    published: "2025-01-20",
    minutes: 7,
    reads: 18500,
    img: null,
    emoji: "🚀",
    gradient: "linear-gradient(135deg,#08121f,#14283f)",
    excerpt:
      "Ten builds — from a solar tracker to a plant-watering bot — that each teach one new Arduino skill and use parts from our starter kits.",
    tags: ["Arduino", "Beginner", "Projects", "DIY"],
    toc: [
      "First Five Builds",
      "Next Four Builds",
      "Starter Kit at QuantumCore",
    ],
    featured: 0,
    content: `
      <h2 id="s0">First Five Builds</h2>
      <p>The classic order never lies: <strong>LED dice roller</strong> (digitalWrite, random), <strong>touch-sensitive night light</strong> (analogRead + PWM), <strong>traffic light with pedestrian call</strong> (state machine), <strong>thermometer display</strong> (I2C LCD), and <strong>buzzer tone keyboard</strong> (tone() + button debounce). Each project teaches one peripheral — and the parts overlap.</p>
      <div class="info-box">
        <span class="icon">🎯</span>
        <p>Spend the extra 20 minutes making each build physically presentable. Tape-and-black-tape scraps are where most kits go to a drawer, never finished.</p>
      </div>

      <h2 id="s1">Next Four Builds</h2>
      <p><strong>Servo sweep with potentiometer control</strong> teaches analog → output feedback; <strong>obstacle-avoiding robot</strong> (HC-SR04 + L298N) introduces timing budgets and wheel geometry; <strong>MQ-2 gas alarm</strong> shows calibrating an analog sensor against thresholds; <strong>plant-watering pump with soil-moisture logic</strong> is the first build that genuinely earns its keep in your home.</p>

      <h2 id="s2">Starter Kit at QuantumCore</h2>
      <p>Every project above runs on our Arduino Nano Every starter bundle — Nano, breadboard, sensor suite, small servo, and 16×2 LCD — no single-use extras. Pick up one jumper-wire set per desk or you'll be floor-hunting for GND by project three.</p>
      <blockquote><p>Rule of thumb: if a build needs a datasheet you haven't read, it's not a beginner project — it's a resume project. Give yourself the easy one first.</p></blockquote>
    `,
  },
];

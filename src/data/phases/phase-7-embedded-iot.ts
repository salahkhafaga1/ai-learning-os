import type { Phase, Week } from "@/domain/types";
import { makeTask, type PhaseBundle } from "./bundle";

const phase: Phase = {
  id: "phase-7",
  number: 7,
  title: "الأنظمة المدمجة وإنترنت الأشياء",
  shortTitle: "Embedded & IoT",
  description:
    "أربعة أسابيع تخرج من الحاسب إلى العالم المادي: ESP32 والحساسات، بروتوكول MQTT، ثم خط استيعاب بيانات من الجهاز إلى قاعدة البيانات مع قرارات edge مقابل cloud.",
  objectives: [
    "برمجة متحكم ESP32 وقراءة الحساسات بشكل موثوق",
    "بناء خط بيانات كامل من الجهاز إلى قاعدة البيانات واختيار موقع الاستدلال",
  ],
  weekNumbers: [28, 29, 30, 31],
};

const weeks: Week[] = [
  {
    number: 28,
    phaseId: "phase-7",
    title: "المتحكمات وESP32",
    objectives: [
      "فهم بنية microcontroller ودورة البرمجة والتنفيذ",
      "تشغيل أول برنامج على ESP32 عبر Arduino framework",
    ],
    topics: [
      "Microcontroller basics",
      "GPIO & pins",
      "Arduino workflow",
      "Embedded C++ basics",
      "Serial monitor",
    ],
    exercises: [
      "وميض LED بمعدلين مختلفين وتغييرهما ديناميكيًا",
      "قراءة حساس درجة حرارة وطباعة القيم في Serial",
    ],
    deliverables: ["مشروع ESP32 صغير يعمل مستقلًا عن الحاسب"],
    masteryCriteria: [
      "أرفع برنامجًا جديدًا خلال 10 دقائق دون مراجعة خطوات التحميل",
      "أشخّص سبب عدم عمل دائرة بسيطة بمنهجية لا تخمين",
    ],
    tasks: [
      makeTask(
        "w28-t1",
        28,
        "دراسة أمثلة ESP32 Arduino الأساسية من المستودع الرسمي",
        "study",
        120,
        ["esp32-arduino"],
      ),
      makeTask(
        "w28-t2",
        28,
        "وميض LED وتجربة معدلي إضاءة مختلفين",
        "exercise",
        90,
        ["esp32-arduino"],
      ),
      makeTask(
        "w28-t3",
        28,
        "قراءة حساس درجة حرارة وطباعة القيم",
        "exercise",
        90,
        ["esp32-arduino"],
      ),
      makeTask(
        "w28-t4",
        28,
        "تسليم مشروع ESP32 مستقل مع مخطط التوصيل",
        "deliverable",
        90,
      ),
    ],
    resourceIds: ["esp32-arduino"],
  },
  {
    number: 29,
    phaseId: "phase-7",
    title: "الحساسات واستيعاب البيانات",
    objectives: [
      "قراءة بيانات حساسات رقمية وتماثلية وتنقيتها",
      "تصميم تدفق بيانات واضح من الحساس إلى التخزين",
    ],
    topics: [
      "Analog & digital sensors",
      "Sampling rates",
      "Noise filtering",
      "Data serialization",
      "Buffering",
    ],
    exercises: [
      "قراءة حساسين مختلفين وتوحيد صيغة القراءة",
      "تنقية قراءات مشوشة بمتوسط متحرك بسيط",
    ],
    deliverables: ["وحدة قراءة حساسات موثقة بإشارات الدخل والخرج"],
    masteryCriteria: [
      "أضيف حساسًا جديدًا للمشروع خلال 30 دقيقة",
      "أفسر قراءة غريبة وأحدد إن كان سببها كهربائيًا أم برمجيًا",
    ],
    tasks: [
      makeTask(
        "w29-t1",
        29,
        "دراسة أنماط قراءة الحساسات في أمثلة ESP32",
        "study",
        90,
        ["esp32-arduino"],
      ),
      makeTask(
        "w29-t2",
        29,
        "قراءة حساسين وتوحيد صيغة القراءة",
        "exercise",
        120,
        ["esp32-arduino"],
      ),
      makeTask(
        "w29-t3",
        29,
        "تنقية قراءات مشوشة بمتوسط متحرك",
        "exercise",
        60,
        ["esp32-arduino"],
      ),
      makeTask(
        "w29-t4",
        29,
        "تسليم وحدة قراءة الحساسات مع توثيقها",
        "deliverable",
        90,
      ),
    ],
    resourceIds: ["esp32-arduino"],
  },
  {
    number: 30,
    phaseId: "phase-7",
    title: "بروتوكولات التواصل: HTTP وMQTT",
    objectives: [
      "فهم لماذا يُستخدم MQTT في إنترنت الأشياء مقابل HTTP",
      "نشر قراءات الحساس على وسيط MQTT ومراقبتها",
    ],
    topics: [
      "Publish/subscribe",
      "MQTT topics & QoS",
      "HTTP vs MQTT",
      "Message payloads",
      "Connection reliability",
    ],
    exercises: [
      "نشر قراءات إلى topics منظمة ومراقبتها بأداة عميل",
      "محاكاة انقطاع اتصال ودراسة سلوك إعادة الاتصال",
    ],
    deliverables: ["تدفق قراءات مباشر من الجهاز إلى وسيط MQTT"],
    masteryCriteria: [
      "أصمم topics واضحة قابلة للتوسع قبل كتابة أي كود",
      "أشرح مقايضة QoS مقابل زمن الاستجابة بأرقام",
    ],
    tasks: [
      makeTask(
        "w30-t1",
        30,
        "دراسة أساسيات النشر/الاشتراك من موقع MQTT الرسمي",
        "study",
        120,
        ["mqtt-org"],
      ),
      makeTask(
        "w30-t2",
        30,
        "نشر قراءات الحساس إلى topics منظمة ومراقبتها",
        "exercise",
        120,
        ["mqtt-org"],
      ),
      makeTask(
        "w30-t3",
        30,
        "محاكاة انقطاع اتصال ومراقبة إعادة الاتصال",
        "exercise",
        60,
        ["mqtt-org"],
      ),
      makeTask(
        "w30-t4",
        30,
        "تسليم تدفق MQTT مباشر مع أسماء topics موثقة",
        "deliverable",
        90,
      ),
    ],
    resourceIds: ["mqtt-org"],
  },
  {
    number: 31,
    phaseId: "phase-7",
    title: "من الجهاز إلى السحابة والاستدلال الحافي",
    objectives: [
      "بناء خط استيعاب يحفظ قراءات الجهاز في قاعدة بيانات",
      "اتخاذ قرار edge مقابل cloud inference بقياسات فعلية",
    ],
    topics: [
      "Data ingestion pipeline",
      "Broker to database",
      "Edge vs cloud inference",
      "Latency & constraints",
      "Device deployment",
    ],
    exercises: [
      "ربط تدفق MQTT بكاتب (writer) يحفظ القراءات في PostgreSQL",
      "تجربة نموذج صغير على الجهاز مقابل السحابة وقياس الزمن",
    ],
    deliverables: ["خط كامل: حساس ثم وسيط ثم قاعدة بيانات مع لوحة قراءة"],
    masteryCriteria: [
      "أبني خط استيعاب جديدًا من طرف إلى طرف دون توجيه",
      "أبرر قرار edge/cloud بأرقام قياس فعلية لا انطباعات",
    ],
    tasks: [
      makeTask(
        "w31-t1",
        31,
        "مراجعة مفاهيم الاستيعاب والاستدلال الحافي من مصدر MQTT",
        "study",
        90,
        ["mqtt-org"],
      ),
      makeTask(
        "w31-t2",
        31,
        "ربط تدفق MQTT بكاتب يحفظ في PostgreSQL",
        "exercise",
        150,
        ["mqtt-org", "esp32-arduino"],
      ),
      makeTask(
        "w31-t3",
        31,
        "قياس زمن استدلال نموذج صغير على الجهاز مقابل السحابة",
        "exercise",
        90,
        ["esp32-arduino"],
      ),
      makeTask(
        "w31-t4",
        31,
        "تسليم الخط الكامل مع لوحة قراءة بسيطة",
        "deliverable",
        120,
      ),
      makeTask(
        "w31-t5",
        31,
        "مراجعة المرحلة السابعة: ما الفرق بين برمجة الويب وبرمجة الجهاز؟",
        "review",
        45,
      ),
    ],
    resourceIds: ["mqtt-org", "esp32-arduino"],
  },
];

export const phase7Bundle: PhaseBundle = { phase, weeks };

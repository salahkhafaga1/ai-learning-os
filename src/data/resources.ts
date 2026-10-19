import type { Resource } from "@/domain/types";

export const resources: Resource[] = [
  {
    id: "pytorch-basics",
    title: "أساسيات PyTorch من الدليل الرسمي",
    url: "https://docs.pytorch.org/tutorials/beginner/basics/intro.html",
    kind: "official_docs",
    official: true,
    phaseIds: ["phase-1"],
    weekNumbers: [1, 2, 3, 4, 5, 6],
    description:
      "المسار الرسمي خطوة بخطوة: التنسورات، autograd، بناء النماذج، والتدريب.",
  },
  {
    id: "python-tutorial",
    title: "دليل Python الرسمي",
    url: "https://docs.python.org/3/tutorial/",
    kind: "official_docs",
    official: true,
    phaseIds: ["phase-2"],
    weekNumbers: [7, 8],
    description:
      "المرجع التعليمي الرسمي للغة: الوحدات والكائنات والأنواع ومعالجة الأخطاء.",
  },
  {
    id: "fastapi-tutorial",
    title: "الدليل التعليمي الرسمي لـ FastAPI",
    url: "https://fastapi.tiangolo.com/tutorial/",
    kind: "official_docs",
    official: true,
    phaseIds: ["phase-2", "phase-8"],
    weekNumbers: [9, 33],
    description:
      "من أول endpoint حتى قواعد البيانات: مسار رسمي متدرج لبناء واجهات برمجية.",
  },
  {
    id: "postgresql-tutorial",
    title: "دليل PostgreSQL الرسمي",
    url: "https://www.postgresql.org/docs/17/tutorial.html",
    kind: "official_docs",
    official: true,
    phaseIds: ["phase-2", "phase-8"],
    weekNumbers: [10, 33],
    description:
      "من أول اتصال بالخادم إلى الاستعلامات المتقدمة بلغة SQL.",
  },
  {
    id: "nextjs-docs",
    title: "توثيق Next.js الرسمي: App Router",
    url: "https://nextjs.org/docs/app",
    kind: "official_docs",
    official: true,
    phaseIds: ["phase-3", "phase-8"],
    weekNumbers: [11, 12, 13, 14, 34, 37],
    description:
      "مرجع App Router والمكونات والبيانات والنماذج من فريق Next.js.",
  },
  {
    id: "hf-llm-course",
    title: "دورة Hugging Face للنماذج اللغوية",
    url: "https://huggingface.co/learn/llm-course/en/chapter1/1",
    kind: "course",
    official: true,
    phaseIds: ["phase-4", "phase-8"],
    weekNumbers: [15, 16, 17, 18, 19, 32],
    description:
      "دورة رسمية تغطي التوكنة والتضمينات والمحولات وبناء أنظمة RAG.",
  },
  {
    id: "hf-agents-course",
    title: "دورة Hugging Face للوكلاء",
    url: "https://huggingface.co/learn/agents-course/en/unit1/introduction",
    kind: "course",
    official: true,
    phaseIds: ["phase-5"],
    weekNumbers: [20, 21, 22, 23],
    description:
      "دورة رسمية لبناء الوكلاء: الأدوات والحالة والتقييم والحدود الآمنة.",
  },
  {
    id: "mlflow",
    title: "توثيق MLflow الرسمي",
    url: "https://mlflow.org/docs/latest/ml/",
    kind: "official_docs",
    official: true,
    phaseIds: ["phase-6", "phase-8"],
    weekNumbers: [24, 25, 27, 36],
    description:
      "تتبع التجارب وسجل النماذج وإدارة دورة حياة النموذج من ميلادها حتى تشغيلها.",
  },
  {
    id: "docker-get-started",
    title: "البداية مع Docker",
    url: "https://docs.docker.com/get-started/",
    kind: "official_docs",
    official: true,
    phaseIds: ["phase-6", "phase-8"],
    weekNumbers: [25, 26, 27, 36],
    description:
      "المسار الرسمي: الصور والحاويات وبناء الخدمات وتشغيلها بأمر واحد.",
  },
  {
    id: "esp32-arduino",
    title: "مستودع ESP32 Arduino الرسمي",
    url: "https://github.com/espressif/arduino-esp32",
    kind: "repo",
    official: true,
    phaseIds: ["phase-7"],
    weekNumbers: [28, 29, 31],
    description:
      "الأمثلة والمكتبات الرسمية لبرمجة ESP32 بإطار Arduino.",
  },
  {
    id: "pytest-docs",
    title: "توثيق pytest الرسمي",
    url: "https://docs.pytest.org/",
    kind: "official_docs",
    official: true,
    phaseIds: ["phase-2", "phase-8"],
    weekNumbers: [8, 35],
    description: "مرجع كتابة الاختبارات وتشغيلها بلغة Python.",
  },
  {
    id: "mdn-http",
    title: "نظرة MDN على HTTP",
    url: "https://developer.mozilla.org/en-US/docs/Web/HTTP",
    kind: "article",
    official: true,
    phaseIds: ["phase-2"],
    weekNumbers: [9],
    description: "شرح مرجعي لبروتوكول HTTP: الطرق والحالات والرؤوس.",
  },
  {
    id: "mqtt-org",
    title: "موقع MQTT الرسمي",
    url: "https://mqtt.org/",
    kind: "official_docs",
    official: true,
    phaseIds: ["phase-7"],
    weekNumbers: [30, 31],
    description:
      "مرجع بروتوكول النشر/الاشتراك المستخدم في مشاريع إنترنت الأشياء.",
  },
  {
    id: "scikit-learn-model-evaluation",
    title: "دليل تقييم النماذج في scikit-learn",
    url: "https://scikit-learn.org/stable/modules/model_evaluation.html",
    kind: "official_docs",
    official: true,
    phaseIds: ["phase-1", "phase-8"],
    weekNumbers: [5, 35],
    description:
      "مرجع مقاييس التقييم ومصفوفة الالتباس وتقارير التصنيف.",
  },
];

export const resourceById: Record<string, Resource> = Object.fromEntries(
  resources.map((resource) => [resource.id, resource]),
);

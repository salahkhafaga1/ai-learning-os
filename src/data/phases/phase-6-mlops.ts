import type { Phase, Week } from "@/domain/types";
import { makeTask, type PhaseBundle } from "./bundle";

const phase: Phase = {
  id: "phase-6",
  number: 6,
  title: "عمليات تعلم الآلة والنشر",
  shortTitle: "MLOps",
  description:
    "أربعة أسابيع تحوّل التجارب إلى أنظمة: تتبع التجارب بإصدارات، الحاويات وDocker، التكامل المستمر، ثم السجلات والمراقبة ورصد الانحدار.",
  objectives: [
    "تسجيل التجارب وإدارة إصدارات النماذج بشكل قابل للاستنساخ",
    "نشر خدمة نموذج ومراقبتها بأدوات CI وحاويات",
  ],
  weekNumbers: [24, 25, 26, 27],
};

const weeks: Week[] = [
  {
    number: 24,
    phaseId: "phase-6",
    title: "تتبع التجارب والاستنساخ",
    objectives: [
      "تسجيل كل تجربة بأرقامها بدل الاعتماد على الذاكرة",
      "فهم مكونات MLflow الأساسية وتشغيلها عمليًا",
    ],
    topics: [
      "Experiment tracking",
      "MLflow basics",
      "Parameters & metrics",
      "Artifacts",
      "Reproducibility",
    ],
    exercises: [
      "تشغيل تجربتين وتسجيل params/metrics في MLflow ومقارنتهما",
      "إعادة إنتاج تجربة سابقة بالاعتماد على سجلها فقط",
    ],
    deliverables: ["سجل MLflow يحوي 5 تجارب قابلة للمقارنة"],
    masteryCriteria: [
      "أسجل تجربة جديدة كاملة خلال 10 دقائق",
      "أعيد إنتاج نتيجة من السجل دون تخمين أو شفهية",
    ],
    tasks: [
      makeTask(
        "w24-t1",
        24,
        "دراسة تتبع التجارب من توثيق MLflow الرسمي",
        "study",
        120,
        ["mlflow"],
      ),
      makeTask(
        "w24-t2",
        24,
        "تشغيل تجربتين وتسجيلهما ومقارنة النتائج",
        "exercise",
        120,
        ["mlflow"],
      ),
      makeTask(
        "w24-t3",
        24,
        "إعادة إنتاج تجربة سابقة من سجلها حرفيًا",
        "exercise",
        60,
        ["mlflow"],
      ),
      makeTask(
        "w24-t4",
        24,
        "تسليم سجل MLflow بخمس تجارب موثقة",
        "deliverable",
        120,
      ),
    ],
    resourceIds: ["mlflow"],
  },
  {
    number: 25,
    phaseId: "phase-6",
    title: "إصدارات النماذج والحاويات",
    objectives: [
      "إدارة إصدارات النماذج والبيانات بمنهج واضح",
      "تغليف خدمة نموذج في حاوية Docker تعمل محليًا",
    ],
    topics: [
      "Model versioning",
      "Model registry",
      "Environment reproducibility",
      "Docker basics",
      "Dockerfiles",
    ],
    exercises: [
      "تسجيل إصدارين لنموذج والتفريق بينهما في السجل",
      "كتابة Dockerfile يشغل خدمة نموذج بسيطة",
    ],
    deliverables: ["حاوية تشغّل خدمة النموذج بأمر واحد"],
    masteryCriteria: [
      "أشرح الفرق بين إصدار الكود والبيانات والنموذج",
      "أبني صورة Docker نظيفة من الصفر خلال جلسة",
    ],
    tasks: [
      makeTask(
        "w25-t1",
        25,
        "دراسة سجل النماذج (Model Registry) من توثيق MLflow",
        "study",
        90,
        ["mlflow"],
      ),
      makeTask(
        "w25-t2",
        25,
        "دراسة أساسيات Docker من التوثيق الرسمي",
        "study",
        90,
        ["docker-get-started"],
      ),
      makeTask(
        "w25-t3",
        25,
        "كتابة Dockerfile وتشغيل خدمة النموذج داخله",
        "exercise",
        150,
        ["docker-get-started"],
      ),
      makeTask(
        "w25-t4",
        25,
        "تسليم الحاوية مع تعليمات التشغيل بأمر واحد",
        "deliverable",
        90,
      ),
    ],
    resourceIds: ["mlflow", "docker-get-started"],
  },
  {
    number: 26,
    phaseId: "phase-6",
    title: "التكامل المستمر (CI)",
    objectives: [
      "تشغيل فحوصات آلية (اختبارات وبناء) على كل تغيير",
      "فهم خط أنابيب CI مبسط من commit حتى بناء ناجح",
    ],
    topics: [
      "Continuous integration",
      "Automated checks",
      "Build pipelines",
      "Fail-fast culture",
      "Artifact publishing",
    ],
    exercises: [
      "إعداد خطوة CI تشغّل الاختبارات تلقائيًا",
      "كسر الاختبار عن قصد والتأكد أن البناء يفشل ثم إصلاحه",
    ],
    deliverables: ["مستودع بتشغيل CI أخضر على آخر commit"],
    masteryCriteria: [
      "أربط فحصًا جديدًا بخط CI خلال دقائق",
      "أشرح دلالة كل خطوة في سجل CI لشخص آخر",
    ],
    tasks: [
      makeTask(
        "w26-t1",
        26,
        "دراسة متطلبات تشغيل الاختبارات والبناء في CI",
        "study",
        60,
        ["docker-get-started"],
      ),
      makeTask(
        "w26-t2",
        26,
        "إعداد خطوة CI تشغّل الاختبارات تلقائيًا",
        "exercise",
        120,
        ["docker-get-started"],
      ),
      makeTask(
        "w26-t3",
        26,
        "تجربة الفشل المقصود والتحقق من رجوع البناء أخضر",
        "exercise",
        60,
        ["docker-get-started"],
      ),
      makeTask(
        "w26-t4",
        26,
        "تسليم مستودع بآخر تشغيل CI ناجح",
        "deliverable",
        90,
      ),
    ],
    resourceIds: ["docker-get-started"],
  },
  {
    number: 27,
    phaseId: "phase-6",
    title: "السجلات والمراقبة",
    objectives: [
      "تصميم سجلات (logs) تجيب على أسئلة التشغيل اليومية",
      "مراقبة خدمة نموذج ورصد الانحدار (drift) مبكرًا",
    ],
    topics: [
      "Structured logging",
      "Log levels",
      "Monitoring basics",
      "Alerting ideas",
      "Data & concept drift",
    ],
    exercises: [
      "إضافة سجلات منظمة لخدمة النموذج مع معرّف لكل طلب",
      "محاكاة انحدار في البيانات وكتابة تقرير رصد",
    ],
    deliverables: ["لوحة مراقبة أولية لآخر الطلبات وأخطائها"],
    masteryCriteria: [
      "أجيب على سؤال تشغيلي من السجلات دون قراءة كود الخدمة",
      "أكتشف تراجعًا في البيانات قبل أن يشتكي مستخدم",
    ],
    tasks: [
      makeTask(
        "w27-t1",
        27,
        "دراسة أنماط التسجيل والمراقبة من توثيق MLflow و Docker",
        "study",
        90,
        ["mlflow", "docker-get-started"],
      ),
      makeTask(
        "w27-t2",
        27,
        "إضافة سجلات منظمة لخدمة النموذج",
        "exercise",
        120,
        ["mlflow"],
      ),
      makeTask(
        "w27-t3",
        27,
        "محاكاة drift وكتابة تقرير رصد بسيط",
        "exercise",
        60,
        ["mlflow"],
      ),
      makeTask(
        "w27-t4",
        27,
        "تسليم لوحة المراقبة الأولية",
        "deliverable",
        90,
      ),
      makeTask(
        "w27-t5",
        27,
        "مراجعة المرحلة السادسة: ما الذي أصبح قابلًا للنشر فعلًا؟",
        "review",
        45,
      ),
    ],
    resourceIds: ["mlflow", "docker-get-started"],
  },
];

export const phase6Bundle: PhaseBundle = { phase, weeks };

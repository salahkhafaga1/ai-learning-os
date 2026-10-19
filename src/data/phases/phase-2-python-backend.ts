import type { Phase, Week } from "@/domain/types";
import { makeTask, type PhaseBundle } from "./bundle";

const phase: Phase = {
  id: "phase-2",
  number: 2,
  title: "هندسة البرمجيات بلغة Python والخادم",
  shortTitle: "Python & Backend",
  description:
    "أربعة أسابيع تصقل مهارات مهندس البرمجيات: تنظيم الشيفرة والأنواع، الاختبارات وGit، ثم بناء واجهات برمجية وقواعد بيانات حقيقية.",
  objectives: [
    "إدارة مشاريع Python بمعايير مهنية: modules و tests و Git",
    "تشغيل API مع قاعدة بيانات PostgreSQL بدءًا من الصفر",
  ],
  weekNumbers: [7, 8, 9, 10],
};

const weeks: Week[] = [
  {
    number: 7,
    phaseId: "phase-2",
    title: "الوحدات البرمجية والبرمجة الكائنية في Python",
    objectives: [
      "تنظيم الشيفرة في modules و packages قابلة للصيانة",
      "توظيف Type hints و dataclasses لتحسين الوضوح والتحقق",
    ],
    topics: [
      "Modules & packages",
      "Classes & OOP",
      "Type hints",
      "Dataclasses",
      "Virtual environments",
    ],
    exercises: [
      "تحويل سكربت متسلسل إلى ثلاث وحدات مترابطة بواجهات واضحة",
      "كتابة type hints لجميع دوال سكربت قديم ومراجعة الأنواع يدويًا",
    ],
    deliverables: ["هيكل حزمة Python نظيف مع README يشرح بنيته"],
    masteryCriteria: [
      "أصمم حدود modules واضحة دون كود مكرر أو تبعيات دائرية",
      "أكتب type hints تلتقط أخطاء فعلية قبل التشغيل",
    ],
    tasks: [
      makeTask(
        "w7-t1",
        7,
        "قراءة فصول الوحدات والكائنات من دليل Python الرسمي",
        "study",
        120,
        ["python-tutorial"],
      ),
      makeTask(
        "w7-t2",
        7,
        "تحويل سكربت متسلسل إلى حزمة modules مع type hints",
        "exercise",
        90,
        ["python-tutorial"],
      ),
      makeTask(
        "w7-t3",
        7,
        "بناء صنف Inventory باستخدام dataclass مع دوال موثقة الأنواع",
        "exercise",
        60,
      ),
      makeTask(
        "w7-t4",
        7,
        "تسليم مستودع Git صغير بهيكل حزمة نظيف",
        "deliverable",
        90,
      ),
    ],
    resourceIds: ["python-tutorial"],
  },
  {
    number: 8,
    phaseId: "phase-2",
    title: "الاختبارات وGit وتصحيح الأخطاء",
    objectives: [
      "كتابة اختبارات وحدة تغطي الحالات الحدية لا المسار السعيد فقط",
      "بناء عادات Git نظيفة وقراءة أخطاء Python بمنهجية",
    ],
    topics: [
      "pytest basics",
      "Unit tests & edge cases",
      "Git workflow",
      "Traceback reading",
      "Debugging strategy",
    ],
    exercises: [
      "اختبار دالة تقسم على صفر وتوثيق السلوك المتوقع",
      "تمرين Git: فرع جديد مع commits صغيرة ثم دمج نظيف",
    ],
    deliverables: ["حزمة اختبارات pytest تمر بنجاح مع سجل commits نظيف"],
    masteryCriteria: [
      "أكتب اختبارًا يفشل أولًا ثم ينجح بعد الإصلاح دون تعديل الاختبار",
      "أقرأ traceback وأحدد السطر المسبب خلال دقيقتين",
    ],
    tasks: [
      makeTask(
        "w8-t1",
        8,
        "دراسة دليل pytest: البداية وكتابة أول الاختبارات",
        "study",
        90,
        ["pytest-docs"],
      ),
      makeTask(
        "w8-t2",
        8,
        "كتابة 10 اختبارات تغطي حالات حدية لدوال سابقة",
        "exercise",
        120,
        ["pytest-docs"],
      ),
      makeTask(
        "w8-t3",
        8,
        "تمرين Git: فرع ثم commits صغيرة ثم دمج",
        "exercise",
        60,
      ),
      makeTask(
        "w8-t4",
        8,
        "تسليم اختبارات خضراء مع سجل commits قابل للمراجعة",
        "deliverable",
        60,
      ),
    ],
    resourceIds: ["pytest-docs", "python-tutorial"],
  },
  {
    number: 9,
    phaseId: "phase-2",
    title: "HTTP وواجهات FastAPI",
    objectives: [
      "فهم دورة حياة طلب HTTP وبنية REST الصحيحة",
      "بناء API صغير آمن الأنواع باستخدام FastAPI",
    ],
    topics: [
      "HTTP methods & status codes",
      "REST design",
      "FastAPI routing",
      "Path & query params",
      "Request validation",
    ],
    exercises: [
      "بناء 4 endpoints لواجهة إدارة كتب مع تحقق كامل من المدخلات",
      "اختبار API يدويًا عبر واجهة /docs وتوثيق النتائج",
    ],
    deliverables: ["API يعمل مع توثيق تفاعلي على /docs"],
    masteryCriteria: [
      "أختار status code الصحيح لكل حالة دون بحث",
      "أبني endpoint جديدًا مع تحقق مدخلات خلال 15 دقيقة",
    ],
    tasks: [
      makeTask(
        "w9-t1",
        9,
        "قراءة مقال MDN عن HTTP: الطرق والحالات والرؤوس",
        "study",
        60,
        ["mdn-http"],
      ),
      makeTask(
        "w9-t2",
        9,
        "تتبع دليل FastAPI حتى التعامل مع request body",
        "study",
        90,
        ["fastapi-tutorial"],
      ),
      makeTask(
        "w9-t3",
        9,
        "بناء 4 endpoints لواجهة إدارة كتب مع التحقق",
        "exercise",
        120,
        ["fastapi-tutorial"],
      ),
      makeTask(
        "w9-t4",
        9,
        "تسليم خدمة API قابلة للتشغيل بأمر واحد",
        "deliverable",
        90,
      ),
    ],
    resourceIds: ["fastapi-tutorial", "mdn-http"],
  },
  {
    number: 10,
    phaseId: "phase-2",
    title: "SQL وPostgreSQL",
    objectives: [
      "كتابة استعلامات SQL تجلب وتجمع البيانات بكفاءة",
      "فهم المفاتيح والفهارس وقيود السلامة في PostgreSQL",
    ],
    topics: [
      "SELECT & filtering",
      "JOINs",
      "Aggregations & GROUP BY",
      "Primary & foreign keys",
      "Indexes & constraints",
    ],
    exercises: [
      "إنشاء جداول مكتبة كتب بعلاقات وقيود ثم جلب البيانات بـ JOIN",
      "كتابة 5 استعلامات تجميع تجيب على أسئلة عمل فعلية",
    ],
    deliverables: ["سكربت SQL يبني قاعدة كتب كاملة مع بيانات تجريبية"],
    masteryCriteria: [
      "أصمم جدولين مترابطين بمفاتيح صحيحة من المحاولة الأولى",
      "أكتب استعلام JOIN بسيط بدون مراجعة المراجع",
    ],
    tasks: [
      makeTask(
        "w10-t1",
        10,
        "دراسة درس PostgreSQL الرسمي من البداية حتى الاستعلامات المتقدمة",
        "study",
        120,
        ["postgresql-tutorial"],
      ),
      makeTask(
        "w10-t2",
        10,
        "إنشاء جداول مكتبة كتب مع قيود وعلاقات وجلب البيانات",
        "exercise",
        120,
        ["postgresql-tutorial"],
      ),
      makeTask(
        "w10-t3",
        10,
        "كتابة 5 استعلامات تجميع لأسئلة حقيقية عن البيانات",
        "exercise",
        60,
        ["postgresql-tutorial"],
      ),
      makeTask(
        "w10-t4",
        10,
        "تسليم سكربت SQL يبني القاعدة من الصفر",
        "deliverable",
        60,
      ),
      makeTask(
        "w10-t5",
        10,
        "مراجعة المرحلة الثانية: تقييم المهارات المكتسبة وتحديد ما يحتاج تعزيزًا",
        "review",
        45,
      ),
    ],
    resourceIds: ["postgresql-tutorial"],
  },
];

export const phase2Bundle: PhaseBundle = { phase, weeks };

import type { Phase, Week } from "@/domain/types";
import { makeTask, type PhaseBundle } from "./bundle";

const phase: Phase = {
  id: "phase-3",
  number: 3,
  title: "تطوير الويب باستخدام Next.js",
  shortTitle: "Next.js",
  description:
    "أربعة أسابيع لبناء واجهات ويب حديثة: App Router ومكونات الخادم والعميل، النماذج والتحقق، ثم دمج API وقاعدة بيانات مع حالات التحميل والأخطاء.",
  objectives: [
    "بناء تطبيق Next.js متعدد الصفحات ببنية نظيفة",
    "دمج واجهة أمامية مع API خلفي وتجربة استخدام صلبة",
  ],
  weekNumbers: [11, 12, 13, 14],
};

const weeks: Week[] = [
  {
    number: 11,
    phaseId: "phase-3",
    title: "App Router وبنية المشروع",
    objectives: [
      "فهم التوجيه المبني على الملفات وتخطيطات (layouts) App Router",
      "تنظيم مشروع Next.js ببنية قابلة للتوسع من أول يوم",
    ],
    topics: [
      "App Router & file routing",
      "Layouts & pages",
      "Linking & navigation",
      "Route organization",
      "Metadata basics",
    ],
    exercises: [
      "بناء 5 مسارات مترابطة مع layout مشترك",
      "تحويل مشروع صفحات ثابت إلى بنية App Router",
    ],
    deliverables: ["مشروع Next.js يعمل بمسارات متعددة وبنية واضحة"],
    masteryCriteria: [
      "أضيف صفحة جديدة وأعرف موقع ملفها الصحيح دون بحث",
      "أشرح الفرق بين layout و page وكيف يتراكبان",
    ],
    tasks: [
      makeTask(
        "w11-t1",
        11,
        "دراسة بنية المشروع و App Router من دليل Next.js",
        "study",
        120,
        ["nextjs-docs"],
      ),
      makeTask(
        "w11-t2",
        11,
        "بناء 5 مسارات مترابطة مع layout مشترك",
        "exercise",
        120,
        ["nextjs-docs"],
      ),
      makeTask(
        "w11-t3",
        11,
        "إضافة تنقل بين الصفحات مع حالة الرابط النشط",
        "exercise",
        60,
        ["nextjs-docs"],
      ),
      makeTask(
        "w11-t4",
        11,
        "تسليم هيكل المشروع مع صفحة رئيسية أولية",
        "deliverable",
        90,
      ),
    ],
    resourceIds: ["nextjs-docs"],
  },
  {
    number: 12,
    phaseId: "phase-3",
    title: "مكونات الخادم والعميل",
    objectives: [
      "التمييز بين Server و Client Components ومتى يُستخدم كل منهما",
      "تمرير البيانات بأمان عبر حدود المكونات دون كشف المنطق الحساس",
    ],
    topics: [
      "Server vs Client Components",
      "'use client' directive",
      "Props across boundaries",
      "Client state",
      "Hydration basics",
    ],
    exercises: [
      "تقسيم صفحة واحدة إلى مكون خادم يغلف مكون عميل تفاعلي",
      "بناء عنصر تفاعلي (سلة أو قائمة مهام) بالحدود الصحيحة",
    ],
    deliverables: ["صفحة تفاعلية تُظهر الفصل الصحيح بين الخادم والعميل"],
    masteryCriteria: [
      "أقرر موقع 'use client' الصحيح من أول محاولة",
      "أفسر خطأ hydration شائعًا وأصلحه دون تخمين",
    ],
    tasks: [
      makeTask(
        "w12-t1",
        12,
        "دراسة فصل Server و Client Components من الدليل",
        "study",
        120,
        ["nextjs-docs"],
      ),
      makeTask(
        "w12-t2",
        12,
        "بناء صفحة فيها مكون خادم يغلف مكون عميل تفاعلي",
        "exercise",
        120,
        ["nextjs-docs"],
      ),
      makeTask(
        "w12-t3",
        12,
        "إعادة هيكلة مكون لم يكن يحتاج 'use client'",
        "exercise",
        60,
        ["nextjs-docs"],
      ),
      makeTask(
        "w12-t4",
        12,
        "تسليم الصفحة التفاعلية مع شرح الحدود في README",
        "deliverable",
        90,
      ),
    ],
    resourceIds: ["nextjs-docs"],
  },
  {
    number: 13,
    phaseId: "phase-3",
    title: "النماذج ومعالجة المدخلات",
    objectives: [
      "بناء نماذج تفاعلية مع تحقق واضح من المدخلات",
      "إدارة الأخطاء وحالات التحميل بتجربة استخدام نظيفة",
    ],
    topics: [
      "Controlled inputs",
      "Form validation",
      "Error states",
      "Accessible forms",
      "Loading states",
    ],
    exercises: [
      "بناء نموذج تسجيل مع رسائل خطأ عربية واضحة",
      "محاكاة حالات الفشل وعرض رسائل مناسبة لكل حالة",
    ],
    deliverables: ["نموذج مكتمل يعمل بالكامل عبر لوحة المفاتيح"],
    masteryCriteria: [
      "أبني نموذجًا كاملًا مع تحقق خلال ساعة واحدة",
      "أجعل كل عناصر النموذج قابلة للوصول دون مكتبات إضافية",
    ],
    tasks: [
      makeTask(
        "w13-t1",
        13,
        "دراسة الأنماط الرسمية للنماذج في Next.js",
        "study",
        60,
        ["nextjs-docs"],
      ),
      makeTask(
        "w13-t2",
        13,
        "بناء نموذج تسجيل مع تحقق ورسائل خطأ",
        "exercise",
        120,
        ["nextjs-docs"],
      ),
      makeTask(
        "w13-t3",
        13,
        "تجربة النموذج بلوحة المفاتيح وقارئ شاشة وإصلاح الملاحظات",
        "exercise",
        60,
      ),
      makeTask(
        "w13-t4",
        13,
        "تسليم النموذج المكتمل مع لقطات لحالات الخطأ",
        "deliverable",
        90,
      ),
    ],
    resourceIds: ["nextjs-docs"],
  },
  {
    number: 14,
    phaseId: "phase-3",
    title: "دمج الـ API وحالات التحميل",
    objectives: [
      "ربط واجهة Next.js بخدمة FastAPI خلفية",
      "عرض حالات loading و error و success باحتراف",
    ],
    topics: [
      "Fetching data",
      "API integration",
      "Loading & error states",
      "Retry patterns",
      "Skeleton UI",
    ],
    exercises: [
      "ربط صفحة قائمة كتب بواجهة FastAPI مع سيناريو فشل الشبكة",
      "إضافة skeleton وحالة خطأ مع زر إعادة المحاولة",
    ],
    deliverables: ["واجهة متكاملة تعرض بيانات حقيقية من الـ API"],
    masteryCriteria: [
      "أربط endpoint جديدًا وأعرض حالاته الثلاث دون نسخ كود",
      "أشخّص أخطاء CORS والشبكة بسرعة وبدون عشوائية",
    ],
    tasks: [
      makeTask(
        "w14-t1",
        14,
        "دراسة جلب البيانات وحالات الواجهة من دليل Next.js",
        "study",
        90,
        ["nextjs-docs"],
      ),
      makeTask(
        "w14-t2",
        14,
        "ربط صفحة القائمة بواجهة FastAPI المحلية",
        "exercise",
        120,
        ["nextjs-docs"],
      ),
      makeTask(
        "w14-t3",
        14,
        "إضافة skeleton وحالة خطأ مع إعادة المحاولة",
        "exercise",
        90,
        ["nextjs-docs"],
      ),
      makeTask(
        "w14-t4",
        14,
        "تسليم الواجهة المتكاملة مع تعليمات التشغيل",
        "deliverable",
        120,
      ),
      makeTask(
        "w14-t5",
        14,
        "مراجعة المرحلة الثالثة: هل كل مسار يعمل من طرف إلى طرف؟",
        "review",
        45,
      ),
    ],
    resourceIds: ["nextjs-docs"],
  },
];

export const phase3Bundle: PhaseBundle = { phase, weeks };

import type { Phase, Week } from "@/domain/types";
import { makeTask, type PhaseBundle } from "./bundle";

const phase: Phase = {
  id: "phase-5",
  number: 5,
  title: "الذكاء الاصطناعي الوكيلي",
  shortTitle: "Agentic AI",
  description:
    "أربعة أسابيع في بناء وكلاء (agents) يفكرون ويستدعون الأدوات ويتعاملون مع الأخطاء، مع حدود صلاحيات واضحة وتقييم صادق للسلوك.",
  objectives: [
    "بناء وكلاء يستخدمون أدوات حقيقية مع إدارة حالة وأخطاء",
    "تقييم سلوك الوكيل ووضع حدود صلاحيات آمنة",
  ],
  weekNumbers: [20, 21, 22, 23],
};

const weeks: Week[] = [
  {
    number: 20,
    phaseId: "phase-5",
    title: "الوكلاء مقابل سير العمل",
    objectives: [
      "التمييز بين workflow ثابت الخطوات و agent يقرر بنفسه",
      "تحديد متى يستحق السيناريو وكيلًا فعلًا بدل سلسلة خطوات",
    ],
    topics: [
      "Agents vs workflows",
      "ReAct pattern",
      "Decision loops",
      "Autonomy levels",
      "When not to use agents",
    ],
    exercises: [
      "تصنيف 8 سيناريوهات: workflow أم agent؟ مع تبرير مكتوب لكل حالة",
      "رسم حلقة قرار لوكيل بسيط قبل كتابة أي كود",
    ],
    deliverables: ["مذكرة قرار: سيناريوهات تستحق وكيلًا وأخرى لا تستحقه"],
    masteryCriteria: [
      "أناقش مقايضات الوكيل مقابل الـ workflow بحجة واضحة",
      "أرفض الحل الوكيلي حين لا يستحقه السيناريو وأشرح البديل",
    ],
    tasks: [
      makeTask(
        "w20-t1",
        20,
        "دراسة فصل الوكلاء مقابل سير العمل من دورة Hugging Face",
        "study",
        120,
        ["hf-agents-course"],
      ),
      makeTask(
        "w20-t2",
        20,
        "تصنيف 8 سيناريوهات مع تبرير مكتوب لكل قرار",
        "exercise",
        90,
        ["hf-agents-course"],
      ),
      makeTask(
        "w20-t3",
        20,
        "رسم حلقة قرار لوكيل بسيط وتوثيق نقاط الفشل المحتملة",
        "exercise",
        60,
        ["hf-agents-course"],
      ),
      makeTask(
        "w20-t4",
        20,
        "تسليم مذكرة القرار مع السيناريوهات الثمانية",
        "deliverable",
        90,
      ),
    ],
    resourceIds: ["hf-agents-course"],
  },
  {
    number: 21,
    phaseId: "phase-5",
    title: "الأدوات واستدعاء الأدوات",
    objectives: [
      "تعريف أدوات (tools) واضحة يستخدمها النموذج بدقة",
      "قراءة بنية tool calling وتشخيص الاستدعاءات الخاطئة",
    ],
    topics: [
      "Tool definitions",
      "Function calling",
      "Argument schemas",
      "Tool results",
      "Tool error handling",
    ],
    exercises: [
      "تعريف ثلاث أدوات بسيطة (حاسبة، طقس، بحث) واختبار استدعائها",
      "كتابة schema وسائط دقيقة ومراقبة السلوك عند مدخلات غريبة",
    ],
    deliverables: ["وكيل صغير يستدعي أدوات مع سجل قرارات قابل للقراءة"],
    masteryCriteria: [
      "أعرّف أداة جديدة من الصفر خلال 20 دقيقة",
      "أشخّص استدعاءً خاطئًا انطلاقًا من وصف الأداة نفسه",
    ],
    tasks: [
      makeTask(
        "w21-t1",
        21,
        "دراسة الأدوات واستدعاء الدوال من دورة Hugging Face",
        "study",
        120,
        ["hf-agents-course"],
      ),
      makeTask(
        "w21-t2",
        21,
        "تعريف ثلاث أدوات واختبار استدعائها عمليًا",
        "exercise",
        150,
        ["hf-agents-course"],
      ),
      makeTask(
        "w21-t3",
        21,
        "تمرين schema وسائط ومدخلات غريبة",
        "exercise",
        60,
        ["hf-agents-course"],
      ),
      makeTask(
        "w21-t4",
        21,
        "تسليم الوكيل الصغير مع سجل القرارات",
        "deliverable",
        120,
      ),
    ],
    resourceIds: ["hf-agents-course"],
  },
  {
    number: 22,
    phaseId: "phase-5",
    title: "حالة الوكيل وتنسيق الأخطاء",
    objectives: [
      "إدارة حالة الجلسة (state) والذاكرة قصيرة المدى للوكيل",
      "التعامل مع فشل الأدوات والاستئناف بعد الخطأ دون إعادة كل شيء",
    ],
    topics: [
      "Conversation state",
      "Short-term memory",
      "Retries & fallbacks",
      "Orchestration basics",
      "Step logging",
    ],
    exercises: [
      "بناء وكيل يحفظ سياق خمس رسائل ويستأنف بعد فشل أداة",
      "إضافة سجل خطوات يوضح كل قرار ونتيجته",
    ],
    deliverables: ["وكيل متعدد الخطوات مع معالجة أخطاء مرئية"],
    masteryCriteria: [
      "أضيف حالة جديدة دون كسر دورة الوكيل الحالية",
      "أستعيد وكيلًا توقف بعد فشل أداة دون تكرار العمل المنجز",
    ],
    tasks: [
      makeTask(
        "w22-t1",
        22,
        "دراسة إدارة الحالة والذاكرة من دورة Hugging Face",
        "study",
        120,
        ["hf-agents-course"],
      ),
      makeTask(
        "w22-t2",
        22,
        "بناء وكيل يحفظ السياق ويستأنف بعد فشل أداة",
        "exercise",
        150,
        ["hf-agents-course"],
      ),
      makeTask(
        "w22-t3",
        22,
        "إضافة سجل خطوات مفصل مع أزمنة ونتائج",
        "exercise",
        90,
        ["hf-agents-course"],
      ),
      makeTask(
        "w22-t4",
        22,
        "تسليم الوكيل متعدد الخطوات مع سيناريوهات الأخطاء",
        "deliverable",
        120,
      ),
    ],
    resourceIds: ["hf-agents-course"],
  },
  {
    number: 23,
    phaseId: "phase-5",
    title: "الصلاحيات والتقييم",
    objectives: [
      "تقييد صلاحيات الوكيل بحدود واضحة لما لا يُسمح له",
      "تقييم أداء الوكيل من آثار التنفيذ (traces) بأمثلة نجاح وفشل",
    ],
    topics: [
      "Permission boundaries",
      "Guardrails",
      "Agent evaluation",
      "Trace review",
      "Safety checks",
    ],
    exercises: [
      "كتابة قائمة صلاحيات (مسموح/ممنوع) واختبار وكيل يحاول تجاوزها",
      "مراجعة 10 آثار تنفيذ وتصنيف الأخطاء المتكررة",
    ],
    deliverables: ["تقرير تقييم وكيل: الناجح والخطير وما يجب تقييده"],
    masteryCriteria: [
      "أصمم حدود صلاحيات لوكيل جديد دون وصاية زائدة",
      "أكتشف خطوة خطرة في trace قبل أن تتحول إلى سلوك",
    ],
    tasks: [
      makeTask(
        "w23-t1",
        23,
        "دراسة الصلاحيات والتقييم من دورة Hugging Face",
        "study",
        120,
        ["hf-agents-course"],
      ),
      makeTask(
        "w23-t2",
        23,
        "كتابة قائمة صلاحيات واختبار تجاوزها عمليًا",
        "exercise",
        120,
        ["hf-agents-course"],
      ),
      makeTask(
        "w23-t3",
        23,
        "مراجعة 10 traces وتصنيف الأخطاء",
        "exercise",
        90,
        ["hf-agents-course"],
      ),
      makeTask(
        "w23-t4",
        23,
        "تسليم تقرير تقييم الوكيل وخطة التقييد",
        "deliverable",
        120,
      ),
      makeTask(
        "w23-t5",
        23,
        "مراجعة المرحلة الخامسة: هل تبني وكيلًا واثقًا من حدوده؟",
        "review",
        45,
      ),
    ],
    resourceIds: ["hf-agents-course"],
  },
];

export const phase5Bundle: PhaseBundle = { phase, weeks };

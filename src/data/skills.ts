import type { Skill } from "@/domain/types";

export const skills: Skill[] = [
  {
    id: "python-engineering",
    name: "هندسة البرمجيات بلغة Python",
    description:
      "تنظيم الوحدات والأنواع والاختبارات وسير عمل Git: Python software engineering.",
  },
  {
    id: "machine-learning",
    name: "تعلم الآلة",
    description:
      "التقييم والتنظيم وتشخيص النماذج بالأرقام: classic machine learning.",
  },
  {
    id: "deep-learning-pytorch",
    name: "التعلم العميق بـ PyTorch",
    description:
      "التنسورات و autograd وتدريب الشبكات العصبية: deep learning with PyTorch.",
  },
  {
    id: "apis-backend",
    name: "بناء واجهات الـ API الخلفية",
    description:
      "خدمات FastAPI بعقود واضحة وأخطاء متوقعة: backend API engineering.",
  },
  {
    id: "sql-databases",
    name: "قواعد البيانات و SQL",
    description:
      "تصميم الجداول والعلاقات والاستعلامات في PostgreSQL: SQL databases.",
  },
  {
    id: "nextjs-typescript",
    name: "واجهات Next.js الأمامية",
    description:
      "App Router والمكونات والنماذج وحالات الواجهة: Next.js frontend development.",
  },
  {
    id: "llms-transformers",
    name: "النماذج اللغوية والمحولات",
    description:
      "التوكنة والتضمينات والانتباه والتوليد: LLMs and transformers.",
  },
  {
    id: "rag-evaluation",
    name: "أنظمة RAG وتقييمها",
    description:
      "البحث المتجهي وكشف الهلاوس وتصميم التقييم: RAG systems and evaluation.",
  },
  {
    id: "agentic-ai",
    name: "الذكاء الاصطناعي الوكيلي",
    description: "بناء الوكلاء بالأدوات والحدود الآمنة: agentic AI engineering.",
  },
  {
    id: "mlops-deployment",
    name: "عمليات النشر و MLOps",
    description: "تتبع التجارب والحاويات و CI والمراقبة: MLOps and deployment.",
  },
  {
    id: "embedded-iot",
    name: "الأنظمة المدمجة وإنترنت الأشياء",
    description:
      "ESP32 والمتحكمات والحساسات وبروتوكولاتها: embedded systems and IoT.",
  },
];

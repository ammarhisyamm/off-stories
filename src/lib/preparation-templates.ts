import type { Priority, Task } from "@/lib/types";

export type PreparationTemplate = {
  id: "kua" | "adat" | "seserahan";
  title: string;
  description: string;
  items: Array<Pick<Task, "title" | "category" | "priority" | "link">>;
};

const dueDate = () => new Date().toISOString().slice(0, 10);

const shoppingLink = (keyword: string) =>
  `https://shopee.co.id/search?keyword=${encodeURIComponent(keyword)}`;

export const preparationTemplates: PreparationTemplate[] = [
  {
    id: "kua",
    title: "KUA & legal documents",
    description: "A practical starting list for the documents most couples prepare before akad.",
    items: [
      "Prepare KTP and KK copies for both partners",
      "Request the RT/RW introduction letter",
      "Prepare the kelurahan marriage documents",
      "Confirm N1–N4 document requirements with the KUA",
      "Prepare recent passport photos",
      "Book the KUA or penghulu schedule",
      "Complete premarital health requirements",
    ].map((title) => ({ title, category: "KUA & Legal", priority: "high" as Priority })),
  },
  {
    id: "adat",
    title: "Traditional ceremony starter",
    description:
      "A flexible base for family discussions; adjust it to your regional ceremony and faith.",
    items: [
      "Confirm the ceremony sequence with both families",
      "List family representatives and ceremony PICs",
      "Confirm traditional attire and accessories",
      "Prepare ceremony offerings and symbolic items",
      "Book the traditional makeup artist",
      "Create a family briefing for ceremony timings",
    ].map((title) => ({ title, category: "Adat", priority: "medium" as Priority })),
  },
  {
    id: "seserahan",
    title: "Seserahan essentials",
    description:
      "A flexible checklist for common Indonesian seserahan items, with quick shopping links.",
    items: [
      ["Alat ibadah", "alat ibadah seserahan"],
      ["Perlengkapan wanita", "perlengkapan wanita seserahan"],
      ["Pakaian atau kain", "kain seserahan"],
      ["Skincare dan makeup", "skincare makeup seserahan"],
      ["Tas atau sepatu", "tas sepatu seserahan"],
      ["Buah dan makanan", "hampers buah makanan seserahan"],
    ].map(([title, keyword]) => ({
      title,
      category: "Seserahan",
      priority: "medium" as Priority,
      link: shoppingLink(keyword),
    })),
  },
];

export function createTemplateTasks(template: PreparationTemplate): Task[] {
  const date = dueDate();
  return template.items.map((item, index) => ({
    id: `template-${template.id}-${index}-${Date.now()}`,
    title: item.title,
    category: item.category,
    due: date,
    priority: item.priority,
    status: "todo",
    link: item.link,
  }));
}

// src/app/utils/initCustomRequests.ts
// Seed demo custom requests so staff dashboard has data to show

const STORAGE_KEY = "customRequests";
const INIT_FLAG = "customRequests-initialized";

if (typeof window !== "undefined") {
  const hasInit = localStorage.getItem(INIT_FLAG);
  if (!hasInit) {
    const existingData = localStorage.getItem(STORAGE_KEY);
    if (!existingData || existingData === "[]") {
      const now = new Date().toISOString();
      const demoRequests = [
        {
          id: "demo-001",
          customerName: "Nguyễn Văn A",
          email: "customer@gmail.com",
          phone: "+84 555 123 456",
          layout: "75%",
          profile: "Cherry",
          theme: "Retro",
          budget: "2.000.000 VNĐ",
          description:
            "Bộ keycap retro style, màu pastel nhẹ nhàng, phù hợp với bàn phím cơ 75%.",
          images: [],
          status: "Pending",
          resultImages: [],
          staffNotes: [],
          customerFeedback: [],
          revisionCount: 0,
          history: [
            {
              id: "hist-001",
              timestamp: now,
              action: "created",
              actor: "customer",
              details: "Request created",
              newStatus: "Pending",
            },
          ],
          createdAt: now,
          updatedAt: now,
        },
        {
          id: "demo-002",
          customerName: "Trần Thị B",
          email: "user@example.com",
          phone: "+84 777 888 999",
          layout: "TKL",
          profile: "OEM",
          theme: "Cyberpunk",
          budget: "3.500.000 VNĐ",
          description:
            "Keycap cyberpunk neon, backlit RGB, chất liệu PBT doubleshot.",
          images: [],
          status: "Pending",
          resultImages: [],
          staffNotes: [],
          customerFeedback: [],
          revisionCount: 0,
          history: [
            {
              id: "hist-002",
              timestamp: now,
              action: "created",
              actor: "customer",
              details: "Request created",
              newStatus: "Pending",
            },
          ],
          createdAt: now,
          updatedAt: now,
        },
      ];

      localStorage.setItem(STORAGE_KEY, JSON.stringify(demoRequests));
      console.log("[initCustomRequests] Seeded 2 demo custom requests");
    }
    localStorage.setItem(INIT_FLAG, "true");
  }
}

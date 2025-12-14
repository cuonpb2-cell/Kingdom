import { GoogleGenAI, Type, Schema } from "@google/genai";
import { KingdomStats, TurnResult, GameSettings, WorldInfo, KingdomHeritage, KingdomBuff, GameLog } from "../types";

const genAI = new GoogleGenAI({ apiKey: process.env.API_KEY });

const personSchema = {
  type: Type.OBJECT,
  properties: {
    id: { type: Type.STRING },
    name: { type: Type.STRING },
    role: { type: Type.STRING },
    age: { type: Type.INTEGER },
    personality: { type: Type.STRING },
    description: { type: Type.STRING },
    status: { type: Type.STRING, enum: ['Alive', 'Dead', 'Missing'] },
    familyRelation: { type: Type.STRING, enum: ['Self', 'Spouse', 'Child', 'Sibling', 'Parent', 'Relative', 'None'], description: "Quan hệ với người chơi. Lãnh đạo chính là 'Self'." }
  },
  required: ['id', 'name', 'role', 'age', 'personality', 'description', 'status']
};

const divisionSchema = {
  type: Type.OBJECT,
  properties: {
    id: { type: Type.STRING },
    name: { type: Type.STRING },
    type: { type: Type.STRING, enum: ['Capital', 'Duchy', 'County', 'Barony', 'Province'] },
    rulerName: { type: Type.STRING },
    description: { type: Type.STRING }
  },
  required: ['id', 'name', 'type', 'rulerName', 'description']
};

const buffSchema = {
  type: Type.OBJECT,
  properties: {
    id: { type: Type.STRING },
    name: { type: Type.STRING },
    type: { type: Type.STRING, enum: ['Positive', 'Negative', 'Neutral'] },
    description: { type: Type.STRING },
    effect: { type: Type.STRING, description: "Mô tả ngắn gọn tác động số liệu (VD: '+500 Vàng/tháng', '-10% Lương thực')" }
  },
  required: ['id', 'name', 'type', 'description', 'effect']
};

const suggestedActionSchema = {
  type: Type.OBJECT,
  properties: {
    label: { type: Type.STRING, description: "Ngắn gọn, hiển thị trên nút bấm (VD: 'Đồng ý', 'Tấn công')" },
    action: { type: Type.STRING, description: "Mô tả đầy đủ hành động để AI xử lý tiếp theo" },
    style: { type: Type.STRING, enum: ['Aggressive', 'Diplomatic', 'Economic', 'Neutral'] }
  },
  required: ['label', 'action', 'style']
};

const rumorSchema = {
  type: Type.OBJECT,
  properties: {
    id: { type: Type.STRING },
    title: { type: Type.STRING, description: "Tiêu đề ngắn gọn (VD: Nhân tài ẩn dật, Mỏ vàng cổ)" },
    content: { type: Type.STRING },
    type: { type: Type.STRING, enum: ['Threat', 'Opportunity', 'Mystery', 'Gossip', 'Talent'] },
    possibleImpact: { type: Type.STRING, description: "Gợi ý tác động (VD: 'Thu phục tướng tài', '+Quân đội', '-Vàng')" },
    isResolved: { type: Type.BOOLEAN }
  },
  required: ['id', 'title', 'content', 'type', 'isResolved']
};

const entityActionSchema = {
  type: Type.OBJECT,
  properties: {
    entityId: { type: Type.STRING, description: "ID of the existing entity performing the action" },
    entityName: { type: Type.STRING },
    actionType: { type: Type.STRING, enum: ['War', 'Diplomacy', 'Expansion', 'Internal', 'Trade', 'Unknown'] },
    description: { type: Type.STRING, description: "What did they do? e.g. 'Declared war on Kingdom B', 'Sent trade caravan to Player'." }
  },
  required: ['entityId', 'entityName', 'actionType', 'description']
};

const responseSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    narrative: { type: Type.STRING },
    eventTitle: { type: Type.STRING },
    monthsPassed: { type: Type.INTEGER, description: "Số THÁNG trôi qua trong lượt này. Mặc định là 1. Nếu tua thời gian (VD: 2 năm) thì tính số tháng tương ứng (24 tháng)." },
    statsChange: {
      type: Type.OBJECT,
      properties: {
        gold: { type: Type.INTEGER },
        food: { type: Type.INTEGER },
        population: { type: Type.INTEGER },
        army: { type: Type.INTEGER },
        happiness: { type: Type.INTEGER },
        wood: { type: Type.INTEGER },
        stone: { type: Type.INTEGER },
        manpower: { type: Type.INTEGER },
        supplies: { type: Type.INTEGER },
        economicPower: { type: Type.INTEGER },
      },
      required: ["gold", "food", "population", "army", "happiness", "wood", "stone", "manpower", "supplies", "economicPower"],
    },
    suggestedActions: {
      type: Type.ARRAY,
      items: suggestedActionSchema,
      description: "Exactly 4 distinct choices relevant to the narrative just generated."
    },
    otherKingdomsActions: {
      type: Type.ARRAY,
      items: entityActionSchema,
      description: "List of significant actions taken by 1-3 other AI kingdoms/entities this turn."
    },
    // --- CẬP NHẬT: Thêm map_grid vào Schema ---
    map_grid: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "A grid represented as an array of strings (e.g. 12x12). Use entity IDs (e.g., 'A', 'B', 'P') for territories, '~' for ocean."
    },
    // ------------------------------------------
    worldUpdate: {
      type: Type.OBJECT,
      properties: {
        newEntities: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING, description: "Single UPPERCASE character ID (e.g., 'A', 'B', 'C')." },
              name: { type: Type.STRING },
              type: { type: Type.STRING, enum: ['Kingdom', 'Empire', 'Tribe', 'City-State', 'Organization'] },
              relation: { type: Type.STRING, enum: ['Hostile', 'Neutral', 'Friendly', 'Ally', 'Unknown'] },
              description: { type: Type.STRING },
              liegeId: { type: Type.STRING, description: "Optional: ID of the Entity this entity is a vassal to (e.g. 'A')." },
              color: { type: Type.STRING, description: "Hex color code (e.g. #FF0000)" }
            },
            required: ['id', 'name', 'type', 'relation', 'description', 'color']
          }
        },
        newPeople: { 
            type: Type.ARRAY, 
            items: personSchema,
            description: "New characters met OR updates to existing characters." 
        },
        newRumors: {
           type: Type.ARRAY,
           items: rumorSchema,
           description: "Generate interesting rumors: Talents to recruit, threats, or opportunities."
        },
        resolvedRumorIds: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          description: "IDs of rumors that are now finished/true/false."
        }
      }
    },
    politicalUpdate: {
      type: Type.OBJECT,
      properties: {
        newFamilyMembers: { type: Type.ARRAY, items: personSchema, description: "Include the Leader (Self) here explicitly on initialization." },
        updatedFamilyMembers: { type: Type.ARRAY, items: personSchema },
        newDivisions: { type: Type.ARRAY, items: divisionSchema, description: "Include the Capital here explicitly on initialization." },
        updatedDivisions: { type: Type.ARRAY, items: divisionSchema },
      }
    },
    buffsUpdate: {
      type: Type.OBJECT,
      properties: {
        newBuffs: { type: Type.ARRAY, items: buffSchema },
        removedBuffIds: { type: Type.ARRAY, items: { type: Type.STRING } }
      }
    },
    initialStats: {
       type: Type.OBJECT,
       properties: {
        year: { type: Type.INTEGER },
        month: { type: Type.INTEGER },
        gold: { type: Type.INTEGER },
        food: { type: Type.INTEGER },
        population: { type: Type.INTEGER },
        army: { type: Type.INTEGER },
        happiness: { type: Type.INTEGER },
        wood: { type: Type.INTEGER },
        stone: { type: Type.INTEGER },
        manpower: { type: Type.INTEGER },
        supplies: { type: Type.INTEGER },
        economicPower: { type: Type.INTEGER },
        taxRate: { type: Type.STRING, enum: ['Tax Haven', 'Low', 'Standard', 'Extortion'] }
       },
    },
    isGameOver: { type: Type.BOOLEAN },
    gameOverReason: { type: Type.STRING },
  },
  required: ["narrative", "statsChange", "isGameOver", "suggestedActions", "map_grid"], // Đã thêm map_grid vào required
};

export const processGameTurn = async (
  currentStats: KingdomStats,
  actionDescription: string,
  settings: GameSettings,
  currentWorldInfo?: WorldInfo,
  currentHeritage?: KingdomHeritage,
  activeBuffs?: KingdomBuff[],
  historyLogs: GameLog[] = [] 
): Promise<TurnResult> => {
  const model = "gemini-2.5-flash";
  const isInit = actionDescription === "KHỞI TẠO";

  const existingEntities = currentWorldInfo ? currentWorldInfo.entities.map(e => `${e.name} (ID:${e.id}, Liege:${e.liegeId || 'None'})`).join(', ') : "Chưa có";
  const currentBuffsList = activeBuffs ? activeBuffs.map(b => `${b.name} (${b.type}: ${b.effect}) [ID:${b.id}]`).join(', ') : "Không có";
  const activeRumors = currentWorldInfo ? currentWorldInfo.rumors.filter(r => !r.isResolved).map(r => `[ID:${r.id}] ${r.title} (${r.type}): ${r.content}`).join('\n') : "Không có";

  const relevantHistory = historyLogs
    .filter(log => log.type !== 'system')
    .slice(-8)
    .map(log => `[${log.timestamp}] ${log.type === 'user' ? 'LÃNH ĐẠO' : log.type === 'world_event' ? 'THẾ GIỚI' : 'GAME MASTER'}: ${log.content}`)
    .join('\n');

  // --- CẬP NHẬT: Prompt khởi tạo tài nguyên dựa trên cốt truyện ---
  let initializationInstruction = "";
  if (isInit) {
    initializationInstruction = `
    ĐÂY LÀ LƯỢT ĐẦU TIÊN (KHỞI TẠO).
    
    NHIỆM VỤ 1: KHỞI TẠO TÀI NGUYÊN (initialStats) DỰA TRÊN CỐT TRUYỆN:
    Hãy đọc kỹ "Bối cảnh khởi đầu": "${settings.background}" và "Mô tả lãnh đạo": "${settings.leaderDescription}".
    - Nếu là "Hoàng tộc/Giàu có/Thương buôn": Vàng > 5000, Lương thực > 10000, EP > 60.
    - Nếu là "Lưu vong/Khởi nghiệp/Hoang tàn": Vàng < 500, Lương thực < 1000, EP < 20.
    - Nếu là "Tướng quân/Chiến tranh": Quân đội > 1000, Vật tư > 2000, nhưng Vàng thấp.
    => Hãy tự đưa ra con số cụ thể phù hợp với logic câu chuyện. Đừng dùng số mặc định.

    NHIỆM VỤ 2: VẼ BẢN ĐỒ (map_grid):
    - Tạo ra một lưới bản đồ (khoảng 12x12).
    - Đặt lãnh thổ người chơi (ID: 'P') ở vị trí phù hợp (Giữa map hoặc ven biển tùy bối cảnh).
    - Tạo 2-3 quốc gia khác (newEntities) và đặt ID của chúng lên bản đồ xung quanh người chơi.
    - Dùng '~' cho biển/hồ.
    
    NHIỆM VỤ 3: CHÍNH TRỊ:
    - Tạo nhân vật Lãnh đạo (${settings.leaderName}) trong newFamilyMembers.
    - Tạo Vùng đất Thủ đô trong newDivisions.
    `;
  }
  // ---------------------------------------------------------------

  const prompt = `
    Bạn là Quản Trò (Game Master) của trò chơi xây dựng vương quốc (Text-based RPG).
    Ngôn ngữ: Tiếng Việt.

    THIẾT LẬP:
    - Thế giới: ${settings.worldTheme}
    - Vương quốc: ${settings.kingdomName} (Vua: ${settings.leaderName})
    - CÁC THẾ LỰC KHÁC: ${existingEntities}
    
    HIỆN TRẠNG TÀI NGUYÊN:
    - Kinh tế: Vàng:${currentStats.gold}, EP (Economic Power):${currentStats.economicPower || 0}, Thuế:${currentStats.taxRate || 'Standard'}.
    - Kho vận: Lương thực:${currentStats.food}, Gỗ:${currentStats.wood || 0}, Đá:${currentStats.stone || 0}, Vật tư quân sự:${currentStats.supplies || 0}.
    - Nhân sự: Dân số:${currentStats.population}, Nhân lực (Manpower):${currentStats.manpower || 0}, Quân đội:${currentStats.army}, Hạnh phúc:${currentStats.happiness}.
    
    BUFFS: ${currentBuffsList}
    TIN ĐỒN: ${activeRumors}
    LỊCH SỬ GẦN ĐÂY:
    ${relevantHistory || "Chưa có lịch sử."}

    HÀNH ĐỘNG CỦA NGƯỜI CHƠI: "${actionDescription}"

    ${initializationInstruction}

    QUY TẮC GAME QUAN TRỌNG (HỆ THỐNG MỚI):

    1. **TÀI NGUYÊN & SỨC MẠNH KINH TẾ (EP)**:
       - **Gỗ & Đá**: Bắt buộc để xây dựng công trình. Nếu hành động là "Xây dựng" mà thiếu Gỗ/Đá -> Thất bại hoặc mua giá đắt.
       - **Nhân lực (Manpower)**: Là dân số trong độ tuổi lao động. \`Manpower\` dùng để tuyển lính hoặc phân bổ làm nông/thợ. Công thức ước lượng: \`Manpower ≈ Dân số * 0.6\`.
       - **Vật tư (Supplies)**: Dùng cho Quân đội hành quân xa (War/Expansion). Nếu Supplies = 0 khi đánh trận -> Thua trận, quân chết.
       - **EP (Economic Power)**: Chỉ số quan trọng ảnh hưởng thu nhập Vàng.
         + Công thức thu nhập Vàng mỗi tháng: \`(Dân số * Hệ số Thuế) * (EP / 100)\`.
         + EP tăng khi xây Chợ, Đường xá, Đầu tư.

    2. **CƠ CHẾ THUẾ (TAX IMPACT)**:
       Dựa trên \`taxRate\` hiện tại (${currentStats.taxRate || 'Standard'}):
       - **Tax Haven (Miễn thuế)**: Vàng thu về = 0. Hạnh phúc ++, Dân số tăng mạnh (Di dân đến).
       - **Low Tax (Thuế thấp)**: Vàng trung bình. Hạnh phúc +, EP tăng nhẹ (+0.5).
       - **Standard (Tiêu chuẩn)**: Vàng cao. Hạnh phúc giảm nhẹ (-1). EP không đổi.
       - **Extortion (Bóc lột)**: Vàng cực cao (+50%). Hạnh phúc giảm mạnh (-10). Dân số giảm (Bỏ đi). Nguy cơ bạo loạn cao.

    3. **CÁC SỰ KIỆN NGẪU NHIÊN THEO ĐIỀU KIỆN (EVENTS)**:
       Hãy kiểm tra các điều kiện sau để kích hoạt sự kiện trong \`narrative\`:
       - **Nạn đói (Famine)**: Nếu Lương thực <= 0 -> Dân chết 10%, Quân đào ngũ 5%, Hạnh phúc -20.
       - **Tham nhũng (Corruption)**: Nếu Vàng > 10,000 nhưng Hạnh phúc < 40 -> Mất 15% Vàng do quan lại biển thủ.
       - **Bạo loạn (Rebellion)**: Nếu Hạnh phúc < 20 -> Dân nổi loạn, phá hủy công trình (giảm EP).

    4. **CƠ CHẾ UPKEEP (DUY TRÌ)**:
       - Quân đội tiêu tốn: Lương thực (ăn) + Vàng (lương) + Vật tư (nếu đang chiến tranh).
       - Hãy tính toán \`statsChange\` hợp lý dựa trên Hành động + Upkeep + Thu nhập (dựa trên EP/Thuế).
    
    5. **BẢN ĐỒ (QUAN TRỌNG)**:
       - Luôn trả về \`map_grid\` cập nhật nếu có thay đổi lãnh thổ (chiếm đất, mất đất). Nếu không đổi, hãy trả về bản đồ cũ.

    Hãy trả về JSON theo đúng Schema.
  `;

  try {
    const response = await genAI.models.generateContent({
      model: model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
        temperature: 0.9, 
      },
    });

    const text = response.text;
    if (!text) throw new Error("No response");
    
    return JSON.parse(text) as TurnResult;

  } catch (error) {
    console.error("Gemini API Error:", error);
    return {
      narrative: "Hệ thống viễn thám gặp sự cố...",
      statsChange: { gold: 0, food: 0, population: 0, army: 0, happiness: 0, wood: 0, stone: 0, manpower: 0, supplies: 0, economicPower: 0 },
      isGameOver: false,
      monthsPassed: 1,
      suggestedActions: []
    };
  }
};
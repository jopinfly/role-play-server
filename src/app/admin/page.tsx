'use client';

import { useState, useEffect, useRef } from 'react';

interface Character {
  id: number;
  nickname: string;
  realName: string;
  avatar: string;
  persona: string;
  voice: string | null;
  createdAt: string;
  moments?: Moment[];
}

interface Moment {
  id: number;
  characterId: number;
  content: string | null;
  mediaType: 'image' | 'video' | 'text' | null;
  mediaUrl: string | null;
}

interface Message {
  id: number;
  role: 'user' | 'assistant';
  content: string;
  createdAt: string;
  voiceUrl?: string;
}

interface Conversation {
  id: number;
  characterId: number;
  nickname: string;
  realName: string;
  avatar: string;
  favorability?: number;
  createdAt: string;
  updatedAt: string;
}

interface FavorabilityLevel {
  level: number;
  title: string;
  nextLevelNeed: number;
}

interface Pagination {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

const voiceOptions = [
  { id: '', name: '不使用语音', language: '' },
  // 中文普通话
  { id: 'male-qn-qingse', name: '青涩青年', language: '中文普通话' },
  { id: 'male-qn-jingying', name: '精英青年', language: '中文普通话' },
  { id: 'male-qn-badao', name: '霸道青年', language: '中文普通话' },
  { id: 'male-qn-daxuesheng', name: '青年大学生', language: '中文普通话' },
  { id: 'female-shaonv', name: '少女', language: '中文普通话' },
  { id: 'female-yujie', name: '御姐', language: '中文普通话' },
  { id: 'female-chengshu', name: '成熟女性', language: '中文普通话' },
  { id: 'female-tianmei', name: '甜美女性', language: '中文普通话' },
  { id: 'male-qn-qingse-jingpin', name: '青涩青年-beta', language: '中文普通话' },
  { id: 'male-qn-jingying-jingpin', name: '精英青年-beta', language: '中文普通话' },
  { id: 'male-qn-badao-jingpin', name: '霸道青年-beta', language: '中文普通话' },
  { id: 'male-qn-daxuesheng-jingpin', name: '青年大学生-beta', language: '中文普通话' },
  { id: 'female-shaonv-jingpin', name: '少女-beta', language: '中文普通话' },
  { id: 'female-yujie-jingpin', name: '御姐-beta', language: '中文普通话' },
  { id: 'female-chengshu-jingpin', name: '成熟女性-beta', language: '中文普通话' },
  { id: 'female-tianmei-jingpin', name: '甜美女性-beta', language: '中文普通话' },
  { id: 'clever_boy', name: '聪明男童', language: '中文普通话' },
  { id: 'cute_boy', name: '可爱男童', language: '中文普通话' },
  { id: 'lovely_girl', name: '萌萌女童', language: '中文普通话' },
  { id: 'cartoon_pig', name: '卡通猪小琪', language: '中文普通话' },
  { id: 'bingjiao_didi', name: '病娇弟弟', language: '中文普通话' },
  { id: 'junlang_nanyou', name: '俊朗男友', language: '中文普通话' },
  { id: 'chunzhen_xuedi', name: '纯真学弟', language: '中文普通话' },
  { id: 'lengdan_xiongzhang', name: '冷淡学长', language: '中文普通话' },
  { id: 'badao_shaoye', name: '霸道少爷', language: '中文普通话' },
  { id: 'tianxin_xiaoling', name: '甜心小玲', language: '中文普通话' },
  { id: 'qiaopi_mengmei', name: '俏皮萌妹', language: '中文普通话' },
  { id: 'wumei_yujie', name: '妩媚御姐', language: '中文普通话' },
  { id: 'diadia_xuemei', name: '嗲嗲学妹', language: '中文普通话' },
  { id: 'danya_xuejie', name: '淡雅学姐', language: '中文普通话' },
  { id: 'Chinese (Mandarin)_Reliable_Executive', name: '沉稳高管', language: '中文普通话' },
  { id: 'Chinese (Mandarin)_News_Anchor', name: '新闻女声', language: '中文普通话' },
  { id: 'Chinese (Mandarin)_Mature_Woman', name: '傲娇御姐', language: '中文普通话' },
  { id: 'Chinese (Mandarin)_Unrestrained_Young_Man', name: '不羁青年', language: '中文普通话' },
  { id: 'Arrogant_Miss', name: '嚣张小姐', language: '中文普通话' },
  { id: 'Robot_Armor', name: '机械战甲', language: '中文普通话' },
  { id: 'Chinese (Mandarin)_Kind-hearted_Antie', name: '热心大婶', language: '中文普通话' },
  { id: 'Chinese (Mandarin)_HK_Flight_Attendant', name: '港普空姐', language: '中文普通话' },
  { id: 'Chinese (Mandarin)_Humorous_Elder', name: '搞笑大爷', language: '中文普通话' },
  { id: 'Chinese (Mandarin)_Gentleman', name: '温润男声', language: '中文普通话' },
  { id: 'Chinese (Mandarin)_Warm_Bestie', name: '温暖闺蜜', language: '中文普通话' },
  { id: 'Chinese (Mandarin)_Male_Announcer', name: '播报男声', language: '中文普通话' },
  { id: 'Chinese (Mandarin)_Sweet_Lady', name: '甜美女声', language: '中文普通话' },
  { id: 'Chinese (Mandarin)_Southern_Young_Man', name: '南方小哥', language: '中文普通话' },
  { id: 'Chinese (Mandarin)_Wise_Women', name: '阅历姐姐', language: '中文普通话' },
  { id: 'Chinese (Mandarin)_Gentle_Youth', name: '温润青年', language: '中文普通话' },
  { id: 'Chinese (Mandarin)_Warm_Girl', name: '温暖少女', language: '中文普通话' },
  { id: 'Chinese (Mandarin)_Kind-hearted_Elder', name: '花甲奶奶', language: '中文普通话' },
  { id: 'Chinese (Mandarin)_Cute_Spirit', name: '憨憨萌兽', language: '中文普通话' },
  { id: 'Chinese (Mandarin)_Radio_Host', name: '电台男主播', language: '中文普通话' },
  { id: 'Chinese (Mandarin)_Lyrical_Voice', name: '抒情男声', language: '中文普通话' },
  { id: 'Chinese (Mandarin)_Straightforward_Boy', name: '率真弟弟', language: '中文普通话' },
  { id: 'Chinese (Mandarin)_Sincere_Adult', name: '真诚青年', language: '中文普通话' },
  { id: 'Chinese (Mandarin)_Gentle_Senior', name: '温柔学姐', language: '中文普通话' },
  { id: 'Chinese (Mandarin)_Stubborn_Friend', name: '嘴硬竹马', language: '中文普通话' },
  { id: 'Chinese (Mandarin)_Crisp_Girl', name: '清脆少女', language: '中文普通话' },
  { id: 'Chinese (Mandarin)_Pure-hearted_Boy', name: '清澈邻家弟弟', language: '中文普通话' },
  { id: 'Chinese (Mandarin)_Soft_Girl', name: '柔和少女', language: '中文普通话' },
  // 中文粤语
  { id: 'Cantonese_ProfessionalHost（F)', name: '专业女主持', language: '中文粤语' },
  { id: 'Cantonese_GentleLady', name: '温柔女声', language: '中文粤语' },
  { id: 'Cantonese_ProfessionalHost（M)', name: '专业男主持', language: '中文粤语' },
  { id: 'Cantonese_PlayfulMan', name: '活泼男声', language: '中文粤语' },
  { id: 'Cantonese_CuteGirl', name: '可爱女孩', language: '中文粤语' },
  { id: 'Cantonese_KindWoman', name: '善良女声', language: '中文粤语' },
  // 英文
  { id: 'Santa_Claus', name: 'Santa Claus', language: '英文' },
  { id: 'Grinch', name: 'Grinch', language: '英文' },
  { id: 'Rudolph', name: 'Rudolph', language: '英文' },
  { id: 'Arnold', name: 'Arnold', language: '英文' },
  { id: 'Charming_Santa', name: 'Charming Santa', language: '英文' },
  { id: 'Charming_Lady', name: 'Charming Lady', language: '英文' },
  { id: 'Sweet_Girl', name: 'Sweet Girl', language: '英文' },
  { id: 'Cute_Elf', name: 'Cute Elf', language: '英文' },
  { id: 'Attractive_Girl', name: 'Attractive Girl', language: '英文' },
  { id: 'Serene_Woman', name: 'Serene Woman', language: '英文' },
  { id: 'English_Trustworthy_Man', name: 'Trustworthy Man', language: '英文' },
  { id: 'English_Graceful_Lady', name: 'Graceful Lady', language: '英文' },
  { id: 'English_Aussie_Bloke', name: 'Aussie Bloke', language: '英文' },
  { id: 'English_Whispering_girl', name: 'Whispering girl', language: '英文' },
  { id: 'English_Diligent_Man', name: 'Diligent Man', language: '英文' },
  { id: 'English_Gentle-voiced_man', name: 'Gentle-voiced man', language: '英文' },
  // 日文
  { id: 'Japanese_IntellectualSenior', name: 'Intellectual Senior', language: '日文' },
  { id: 'Japanese_DecisivePrincess', name: 'Decisive Princess', language: '日文' },
  { id: 'Japanese_LoyalKnight', name: 'Loyal Knight', language: '日文' },
  { id: 'Japanese_DominantMan', name: 'Dominant Man', language: '日文' },
  { id: 'Japanese_SeriousCommander', name: 'Serious Commander', language: '日文' },
  { id: 'Japanese_ColdQueen', name: 'Cold Queen', language: '日文' },
  { id: 'Japanese_DependableWoman', name: 'Dependable Woman', language: '日文' },
  { id: 'Japanese_GentleButler', name: 'Gentle Butler', language: '日文' },
  { id: 'Japanese_KindLady', name: 'Kind Lady', language: '日文' },
  { id: 'Japanese_CalmLady', name: 'Calm Lady', language: '日文' },
  { id: 'Japanese_OptimisticYouth', name: 'Optimistic Youth', language: '日文' },
  { id: 'Japanese_GenerousIzakayaOwner', name: 'Generous Izakaya Owner', language: '日文' },
  { id: 'Japanese_SportyStudent', name: 'Sporty Student', language: '日文' },
  { id: 'Japanese_InnocentBoy', name: 'Innocent Boy', language: '日文' },
  { id: 'Japanese_GracefulMaiden', name: 'Graceful Maiden', language: '日文' },
  // 韩文
  { id: 'Korean_SweetGirl', name: 'Sweet Girl', language: '韩文' },
  { id: 'Korean_CheerfulBoyfriend', name: 'Cheerful Boyfriend', language: '韩文' },
  { id: 'Korean_EnchantingSister', name: 'Enchanting Sister', language: '韩文' },
  { id: 'Korean_ShyGirl', name: 'Shy Girl', language: '韩文' },
  { id: 'Korean_ReliableSister', name: 'Reliable Sister', language: '韩文' },
  { id: 'Korean_StrictBoss', name: 'Strict Boss', language: '韩文' },
  { id: 'Korean_SassyGirl', name: 'Sassy Girl', language: '韩文' },
  { id: 'Korean_ChildhoodFriendGirl', name: 'Childhood Friend Girl', language: '韩文' },
  { id: 'Korean_PlayboyCharmer', name: 'Playboy Charmer', language: '韩文' },
  { id: 'Korean_ElegantPrincess', name: 'Elegant Princess', language: '韩文' },
  { id: 'Korean_BraveFemaleWarrior', name: 'Brave Female Warrior', language: '韩文' },
  { id: 'Korean_BraveYouth', name: 'Brave Youth', language: '韩文' },
  { id: 'Korean_CalmLady', name: 'Calm Lady', language: '韩文' },
  { id: 'Korean_EnthusiasticTeen', name: 'Enthusiastic Teen', language: '韩文' },
  { id: 'Korean_SoothingLady', name: 'Soothing Lady', language: '韩文' },
  { id: 'Korean_IntellectualSenior', name: 'Intellectual Senior', language: '韩文' },
  { id: 'Korean_LonelyWarrior', name: 'Lonely Warrior', language: '韩文' },
  { id: 'Korean_MatureLady', name: 'Mature Lady', language: '韩文' },
  { id: 'Korean_InnocentBoy', name: 'Innocent Boy', language: '韩文' },
  { id: 'Korean_CharmingSister', name: 'Charming Sister', language: '韩文' },
  { id: 'Korean_AthleticStudent', name: 'Athletic Student', language: '韩文' },
  { id: 'Korean_BraveAdventurer', name: 'Brave Adventurer', language: '韩文' },
  { id: 'Korean_CalmGentleman', name: 'Calm Gentleman', language: '韩文' },
  { id: 'Korean_WiseElf', name: 'Wise Elf', language: '韩文' },
  { id: 'Korean_CheerfulCoolJunior', name: 'Cheerful Cool Junior', language: '韩文' },
  { id: 'Korean_DecisiveQueen', name: 'Decisive Queen', language: '韩文' },
  { id: 'Korean_ColdYoungMan', name: 'Cold Young Man', language: '韩文' },
  { id: 'Korean_MysteriousGirl', name: 'Mysterious Girl', language: '韩文' },
  { id: 'Korean_QuirkyGirl', name: 'Quirky Girl', language: '韩文' },
  { id: 'Korean_ConsiderateSenior', name: 'Considerate Senior', language: '韩文' },
  { id: 'Korean_CheerfulLittleSister', name: 'Cheerful Little Sister', language: '韩文' },
  { id: 'Korean_DominantMan', name: 'Dominant Man', language: '韩文' },
  { id: 'Korean_AirheadedGirl', name: 'Airheaded Girl', language: '韩文' },
  { id: 'Korean_ReliableYouth', name: 'Reliable Youth', language: '韩文' },
  { id: 'Korean_FriendlyBigSister', name: 'Friendly Big Sister', language: '韩文' },
  { id: 'Korean_GentleBoss', name: 'Gentle Boss', language: '韩文' },
  { id: 'Korean_ColdGirl', name: 'Cold Girl', language: '韩文' },
  { id: 'Korean_HaughtyLady', name: 'Haughty Lady', language: '韩文' },
  { id: 'Korean_CharmingElderSister', name: 'Charming Elder Sister', language: '韩文' },
  { id: 'Korean_IntellectualMan', name: 'Intellectual Man', language: '韩文' },
  { id: 'Korean_CaringWoman', name: 'Caring Woman', language: '韩文' },
  { id: 'Korean_WiseTeacher', name: 'Wise Teacher', language: '韩文' },
  { id: 'Korean_ConfidentBoss', name: 'Confident Boss', language: '韩文' },
  { id: 'Korean_AthleticGirl', name: 'Athletic Girl', language: '韩文' },
  { id: 'Korean_PossessiveMan', name: 'Possessive Man', language: '韩文' },
  { id: 'Korean_GentleWoman', name: 'Gentle Woman', language: '韩文' },
  { id: 'Korean_CockyGuy', name: 'Cocky Guy', language: '韩文' },
  { id: 'Korean_ThoughtfulWoman', name: 'Thoughtful Woman', language: '韩文' },
  { id: 'Korean_OptimisticYouth', name: 'Optimistic Youth', language: '韩文' },
  // 西班牙文
  { id: 'Spanish_SereneWoman', name: 'Serene Woman', language: '西班牙文' },
  { id: 'Spanish_MaturePartner', name: 'Mature Partner', language: '西班牙文' },
  { id: 'Spanish_CaptivatingStoryteller', name: 'Captivating Storyteller', language: '西班牙文' },
  { id: 'Spanish_Narrator', name: 'Narrator', language: '西班牙文' },
  { id: 'Spanish_WiseScholar', name: 'Wise Scholar', language: '西班牙文' },
  { id: 'Spanish_Kind-heartedGirl', name: 'Kind-hearted Girl', language: '西班牙文' },
  { id: 'Spanish_DeterminedManager', name: 'Determined Manager', language: '西班牙文' },
  { id: 'Spanish_BossyLeader', name: 'Bossy Leader', language: '西班牙文' },
  { id: 'Spanish_ReservedYoungMan', name: 'Reserved Young Man', language: '西班牙文' },
  { id: 'Spanish_ConfidentWoman', name: 'Confident Woman', language: '西班牙文' },
  { id: 'Spanish_ThoughtfulMan', name: 'Thoughtful Man', language: '西班牙文' },
  { id: 'Spanish_Strong-WilledBoy', name: 'Strong-willed Boy', language: '西班牙文' },
  { id: 'Spanish_SophisticatedLady', name: 'Sophisticated Lady', language: '西班牙文' },
  { id: 'Spanish_RationalMan', name: 'Rational Man', language: '西班牙文' },
  { id: 'Spanish_AnimeCharacter', name: 'Anime Character', language: '西班牙文' },
  { id: 'Spanish_Deep-tonedMan', name: 'Deep-toned Man', language: '西班牙文' },
  // 葡萄牙文
  { id: 'Portuguese_SentimentalLady', name: 'Sentimental Lady', language: '葡萄牙文' },
  { id: 'Portuguese_BossyLeader', name: 'Bossy Leader', language: '葡萄牙文' },
  { id: 'Portuguese_Wiselady', name: 'Wise lady', language: '葡萄牙文' },
  { id: 'Portuguese_Strong-WilledBoy', name: 'Strong-willed Boy', language: '葡萄牙文' },
  { id: 'Portuguese_Deep-VoicedGentleman', name: 'Deep-voiced Gentleman', language: '葡萄牙文' },
  // 法文
  { id: 'French_Male_Speech_New', name: 'Level-Headed Man', language: '法文' },
  { id: 'French_Female_News Anchor', name: 'Patient Female Presenter', language: '法文' },
  { id: 'French_CasualMan', name: 'Casual Man', language: '法文' },
  { id: 'French_MovieLeadFemale', name: 'Movie Lead Female', language: '法文' },
  { id: 'French_FemaleAnchor', name: 'Female Anchor', language: '法文' },
  { id: 'French_MaleNarrator', name: 'Male Narrator', language: '法文' },
  // 印尼文
  { id: 'Indonesian_SweetGirl', name: 'Sweet Girl', language: '印尼文' },
  { id: 'Indonesian_ReservedYoungMan', name: 'Reserved Young Man', language: '印尼文' },
  { id: 'Indonesian_CharmingGirl', name: 'Charming Girl', language: '印尼文' },
  { id: 'Indonesian_CalmWoman', name: 'Calm Woman', language: '印尼文' },
  { id: 'Indonesian_ConfidentWoman', name: 'Confident Woman', language: '印尼文' },
  { id: 'Indonesian_CaringMan', name: 'Caring Man', language: '印尼文' },
  { id: 'Indonesian_BossyLeader', name: 'Bossy Leader', language: '印尼文' },
  { id: 'Indonesian_DeterminedBoy', name: 'Determined Boy', language: '印尼文' },
  { id: 'Indonesian_GentleGirl', name: 'Gentle Girl', language: '印尼文' },
  // 德文
  { id: 'German_FriendlyMan', name: 'Friendly Man', language: '德文' },
  { id: 'German_SweetLady', name: 'Sweet Lady', language: '德文' },
  { id: 'German_PlayfulMan', name: 'Playful Man', language: '德文' },
  // 俄文
  { id: 'Russian_HandsomeChildhoodFriend', name: 'Handsome Childhood Friend', language: '俄文' },
  { id: 'Russian_BrightHeroine', name: 'Bright Queen', language: '俄文' },
  { id: 'Russian_AmbitiousWoman', name: 'Ambitious Woman', language: '俄文' },
  { id: 'Russian_ReliableMan', name: 'Reliable Man', language: '俄文' },
  { id: 'Russian_CrazyQueen', name: 'Crazy Girl', language: '俄文' },
  { id: 'Russian_PessimisticGirl', name: 'Pessimistic Girl', language: '俄文' },
  { id: 'Russian_AttractiveGuy', name: 'Attractive Guy', language: '俄文' },
  { id: 'Russian_Bad-temperedBoy', name: 'Bad-tempered Boy', language: '俄文' },
  // 意大利文
  { id: 'Italian_BraveHeroine', name: 'Brave Heroine', language: '意大利文' },
  { id: 'Italian_Narrator', name: 'Narrator', language: '意大利文' },
  { id: 'Italian_WanderingSorcerer', name: 'Wandering Sorcerer', language: '意大利文' },
  { id: 'Italian_DiligentLeader', name: 'Diligent Leader', language: '意大利文' },
  // 阿拉伯文
  { id: 'Arabic_CalmWoman', name: 'Calm Woman', language: '阿拉伯文' },
  { id: 'Arabic_FriendlyGuy', name: 'Friendly Guy', language: '阿拉伯文' },
  // 土耳其文
  { id: 'Turkish_CalmWoman', name: 'Calm Woman', language: '土耳其文' },
  { id: 'Turkish_Trustworthyman', name: 'Trustworthy man', language: '土耳其文' },
  // 乌克兰文
  { id: 'Ukrainian_CalmWoman', name: 'Calm Woman', language: '乌克兰文' },
  { id: 'Ukrainian_WiseScholar', name: 'Wise Scholar', language: '乌克兰文' },
  // 荷兰文
  { id: 'Dutch_kindhearted_girl', name: 'Kind-hearted girl', language: '荷兰文' },
  { id: 'Dutch_bossy_leader', name: 'Bossy leader', language: '荷兰文' },
  // 越南文
  { id: 'Vietnamese_kindhearted_girl', name: 'Kind-hearted girl', language: '越南文' },
  // 泰文
  { id: 'Thai_male_1_sample8', name: 'Serene Man', language: '泰文' },
  { id: 'Thai_male_2_sample2', name: 'Friendly Man', language: '泰文' },
  { id: 'Thai_female_1_sample1', name: 'Confident Woman', language: '泰文' },
  { id: 'Thai_female_2_sample2', name: 'Energetic Woman', language: '泰文' },
  // 波兰文
  { id: 'Polish_male_1_sample4', name: 'Male Narrator', language: '波兰文' },
  { id: 'Polish_male_2_sample3', name: 'Male Anchor', language: '波兰文' },
  { id: 'Polish_female_1_sample1', name: 'Calm Woman', language: '波兰文' },
  { id: 'Polish_female_2_sample3', name: 'Casual Woman', language: '波兰文' },
  // 罗马尼亚文
  { id: 'Romanian_male_1_sample2', name: 'Reliable Man', language: '罗马尼亚文' },
  { id: 'Romanian_male_2_sample1', name: 'Energetic Youth', language: '罗马尼亚文' },
  { id: 'Romanian_female_1_sample4', name: 'Optimistic Youth', language: '罗马尼亚文' },
  { id: 'Romanian_female_2_sample1', name: 'Gentle Woman', language: '罗马尼亚文' },
  // 希腊文
  { id: 'greek_male_1a_v1', name: 'Thoughtful Mentor', language: '希腊文' },
  { id: 'Greek_female_1_sample1', name: 'Gentle Lady', language: '希腊文' },
  { id: 'Greek_female_2_sample3', name: 'Girl Next Door', language: '希腊文' },
  // 捷克文
  { id: 'czech_male_1_v1', name: 'Assured Presenter', language: '捷克文' },
  { id: 'czech_female_5_v7', name: 'Steadfast Narrator', language: '捷克文' },
  { id: 'czech_female_2_v2', name: 'Elegant Lady', language: '捷克文' },
  // 芬兰文
  { id: 'finnish_male_3_v1', name: 'Upbeat Man', language: '芬兰文' },
  { id: 'finnish_male_1_v2', name: 'Friendly Boy', language: '芬兰文' },
  { id: 'finnish_female_4_v1', name: 'Assetive Woman', language: '芬兰文' },
  // 印地文
  { id: 'hindi_male_1_v2', name: 'Trustworthy Advisor', language: '印地文' },
  { id: 'hindi_female_2_v1', name: 'Tranquil Woman', language: '印地文' },
  { id: 'hindi_female_1_v2', name: 'News Anchor', language: '印地文' },
];

// Generate or get user ID from localStorage
function getUserId(): string {
  if (typeof window === 'undefined') return '';
  let userId = localStorage.getItem('chat_user_id');
  if (!userId) {
    userId = 'user_' + Date.now() + '_' + Math.random().toString(36).substring(2, 15);
    localStorage.setItem('chat_user_id', userId);
  }
  return userId;
}

export default function AdminPage() {
  const [characters, setCharacters] = useState<Character[]>([]);
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    nickname: '',
    realName: '',
    avatar: '',
    persona: '',
    voice: '',
  });
  const [momentContents, setMomentContents] = useState<{ content: string; mediaType: string; mediaUrl: string }[]>([]);

  // Chat state
  const [userId, setUserId] = useState<string>('');
  const [currentConversation, setCurrentConversation] = useState<number | null>(null);
  const [chatMessages, setChatMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'characters' | 'chat'>('characters');

  // Favorability state
  const [favorability, setFavorability] = useState<number>(0);
  const [favorabilityLevel, setFavorabilityLevel] = useState<FavorabilityLevel | null>(null);
  const [favorabilityChange, setFavorabilityChange] = useState<number | null>(null);

  // Conversation list state
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [conversationPagination, setConversationPagination] = useState<Pagination | null>(null);
  const [messagePagination, setMessagePagination] = useState<Pagination | null>(null);

  // Audio state
  const [playingMessageId, setPlayingMessageId] = useState<number | null>(null);
  const [synthesizingMessageId, setSynthesizingMessageId] = useState<number | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Initialize user ID
    const id = getUserId();
    setUserId(id);

    fetchCharacters();
    if (id) {
      fetchConversations(id);
    }
  }, []);

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  const fetchCharacters = async () => {
    const res = await fetch('/api/characters');
    const data = await res.json();
    setCharacters(data);
  };

  const fetchConversations = async (uid: string, page = 1) => {
    try {
      const res = await fetch(`/api/chat?userId=${uid}&page=${page}`);
      const data = await res.json();
      setConversations(data.conversations || []);
      setConversationPagination(data.pagination || null);
    } catch (error) {
      console.error('Error fetching conversations:', error);
    }
  };

  const fetchMoreMessages = async (conversationId: number, page: number) => {
    try {
      const res = await fetch(`/api/chat?conversationId=${conversationId}&page=${page}`);
      const data = await res.json();

      if (page === 1) {
        setChatMessages(data.messages || []);
      } else {
        setChatMessages(prev => [...(data.messages || []), ...prev]);
      }
      setMessagePagination(data.pagination || null);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const resetForm = () => {
    setFormData({ nickname: '', realName: '', avatar: '', persona: '', voice: '' });
    setMomentContents([]);
    setShowAddForm(false);
    setEditingId(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await fetch('/api/characters', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          momentContents: momentContents.filter(m => m.content || m.mediaUrl),
        }),
      });

      if (res.ok) {
        resetForm();
        fetchCharacters();
      }
    } catch (error) {
      console.error('Error creating character:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = async (character: Character) => {
    setEditingId(character.id);
    setFormData({
      nickname: character.nickname,
      realName: character.realName,
      avatar: character.avatar,
      persona: character.persona,
      voice: character.voice || '',
    });

    // Fetch moments for this character
    try {
      const res = await fetch(`/api/characters/${character.id}`);
      const data = await res.json();
      if (data.moments && data.moments.length > 0) {
        setMomentContents(data.moments.map((m: Moment) => ({
          content: m.content || '',
          mediaType: m.mediaType || 'text',
          mediaUrl: m.mediaUrl || '',
        })));
      } else {
        setMomentContents([]);
      }
    } catch (error) {
      console.error('Error fetching moments:', error);
      setMomentContents([]);
    }

    setShowAddForm(true);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingId) return;

    setIsLoading(true);
    try {
      const res = await fetch('/api/characters', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingId,
          ...formData,
          moments: momentContents.filter(m => m.content || m.mediaUrl),
        }),
      });

      if (res.ok) {
        resetForm();
        fetchCharacters();
      }
    } catch (error) {
      console.error('Error updating character:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('确定要删除这个角色吗？')) return;

    await fetch(`/api/characters?id=${id}`, { method: 'DELETE' });
    fetchCharacters();
  };

  const startConversation = async (characterId: number) => {
    if (!userId) return;

    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ characterId, userId }),
    });
    const data = await res.json();
    setCurrentConversation(data.conversationId);
    setChatMessages(data.messages || []);
    setSelectedCharacter(data.character);
    setMessagePagination(null);
    setActiveTab('chat');

    // Set favorability
    setFavorability(data.favorability || 0);
    setFavorabilityLevel(data.favorabilityLevel || null);
    setFavorabilityChange(data.isFirstConversation ? 5 : null);

    // Clear favorability change after 2 seconds
    if (data.isFirstConversation) {
      setTimeout(() => setFavorabilityChange(null), 2000);
    }

    // Refresh conversation list
    fetchConversations(userId);
  };

  const loadConversation = async (conversation: Conversation) => {
    setCurrentConversation(conversation.id);

    // Find character from characters list or create minimal character object
    const character = characters.find(c => c.id === conversation.characterId);
    if (character) {
      setSelectedCharacter(character);
    } else {
      setSelectedCharacter({
        id: conversation.characterId,
        nickname: conversation.nickname,
        realName: conversation.realName,
        avatar: conversation.avatar,
        persona: '',
        voice: null,
        createdAt: '',
      });
    }

    setMessagePagination(null);
    setChatMessages([]);
    setActiveTab('chat');

    // Fetch messages
    await fetchMoreMessages(conversation.id, 1);
  };

  const loadMoreMessages = () => {
    if (!currentConversation || !messagePagination) return;
    const nextPage = messagePagination.page + 1;
    if (nextPage <= messagePagination.totalPages) {
      fetchMoreMessages(currentConversation, nextPage);
    }
  };

  const sendMessage = async () => {
    if (!inputMessage.trim() || !currentConversation) return;

    const userMessage: Message = {
      id: Date.now(),
      role: 'user',
      content: inputMessage,
      createdAt: new Date().toISOString(),
    };
    setChatMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationId: currentConversation,
          content: inputMessage,
        }),
      });
      const data = await res.json();

      const assistantMessage: Message = {
        id: Date.now() + 1,
        role: 'assistant',
        content: data.response,
        createdAt: new Date().toISOString(),
      };
      setChatMessages(prev => [...prev, assistantMessage]);
      // Update favorability
      if (data.favorability !== undefined) {
        setFavorability(data.favorability);
        setFavorabilityLevel(data.favorabilityLevel || null);
        setFavorabilityChange(data.favorabilityChange);
        // Clear favorability change after 2 seconds
        setTimeout(() => setFavorabilityChange(null), 2000);
      }
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formDataUpload = new FormData();
    formDataUpload.append('file', file);

    const res = await fetch('/api/upload', {
      method: 'POST',
      body: formDataUpload,
    });
    const data = await res.json();
    setFormData(prev => ({ ...prev, avatar: data.url }));
  };

  const getVoiceName = (voiceId: string) => {
    const voice = voiceOptions.find(v => v.id === voiceId);
    return voice ? voice.name : voiceId;
  };

  // Stop currently playing audio
  const stopAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setPlayingMessageId(null);
  };

  // Play voice for a message
  const playVoice = async (message: Message) => {
    // If same message is playing, stop it
    if (playingMessageId === message.id) {
      stopAudio();
      return;
    }

    // Stop any currently playing audio
    stopAudio();

    // Check if we already have the voice URL
    if (message.voiceUrl) {
      const audio = new Audio(message.voiceUrl);
      audioRef.current = audio;
      setPlayingMessageId(message.id);

      audio.onended = () => {
        setPlayingMessageId(null);
        audioRef.current = null;
      };

      audio.onerror = () => {
        setPlayingMessageId(null);
        audioRef.current = null;
        console.error('Audio playback error');
      };

      audio.play().catch(err => {
        console.error('Audio play error:', err);
        setPlayingMessageId(null);
      });
      return;
    }

    // Need to synthesize voice
    if (!selectedCharacter?.voice) {
      console.error('No voice configured for character');
      return;
    }

    setSynthesizingMessageId(message.id);

    try {
      const res = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: message.content,
          voiceId: selectedCharacter.voice,
          messageId: message.id,
        }),
      });

      const data = await res.json();

      if (data.url) {
        // Update message with voice URL
        setChatMessages(prev => prev.map(msg =>
          msg.id === message.id ? { ...msg, voiceUrl: data.url } : msg
        ));

        // Play the audio
        const audio = new Audio(data.url);
        audioRef.current = audio;
        setPlayingMessageId(message.id);

        audio.onended = () => {
          setPlayingMessageId(null);
          audioRef.current = null;
        };

        audio.onerror = () => {
          setPlayingMessageId(null);
          audioRef.current = null;
          console.error('Audio playback error');
        };

        audio.play().catch(err => {
          console.error('Audio play error:', err);
          setPlayingMessageId(null);
        });
      }
    } catch (error) {
      console.error('TTS error:', error);
    } finally {
      setSynthesizingMessageId(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-50 to-purple-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/25">
              <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">角色管理系统</h1>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-3 mb-6 bg-white/80 backdrop-blur-sm p-1.5 rounded-2xl shadow-lg shadow-slate-200/50 w-fit">
          <button
            onClick={() => setActiveTab('characters')}
            className={`px-6 py-2.5 rounded-xl font-medium transition-all duration-200 ${
              activeTab === 'characters'
                ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg shadow-blue-500/25'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <span className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              角色管理
            </span>
          </button>
          <button
            onClick={() => setActiveTab('chat')}
            className={`px-6 py-2.5 rounded-xl font-medium transition-all duration-200 ${
              activeTab === 'chat'
                ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg shadow-blue-500/25'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <span className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              聊天测试
            </span>
          </button>
        </div>

        {/* Character Management Tab */}
        {activeTab === 'characters' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-slate-800">角色列表</h2>
              <button
                onClick={() => {
                  resetForm();
                  setShowAddForm(true);
                }}
                className="px-5 py-2.5 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl font-medium hover:from-blue-600 hover:to-purple-600 transition-all shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                添加角色
              </button>
            </div>

            {showAddForm && (
              <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg shadow-slate-200/50 mb-6 border border-slate-100">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </div>
                  {editingId ? '编辑角色' : '添加新角色'}
                </h3>
                <form onSubmit={editingId ? handleUpdate : handleSubmit} className="space-y-5">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">昵称</label>
                      <input
                        type="text"
                        value={formData.nickname}
                        onChange={e => setFormData(prev => ({ ...prev, nickname: e.target.value }))}
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">本名</label>
                      <input
                        type="text"
                        value={formData.realName}
                        onChange={e => setFormData(prev => ({ ...prev, realName: e.target.value }))}
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">形象图片</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarUpload}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
                    />
                    {formData.avatar && (
                      <img src={formData.avatar} alt="Avatar preview" className="mt-3 w-20 h-20 object-cover rounded-xl ring-2 ring-blue-500/20" />
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">人设</label>
                    <textarea
                      value={formData.persona}
                      onChange={e => setFormData(prev => ({ ...prev, persona: e.target.value }))}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all h-32 resize-none"
                      placeholder="描述角色的性格、背景、说话风格等..."
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">音色</label>
                    <select
                      value={formData.voice}
                      onChange={e => setFormData(prev => ({ ...prev, voice: e.target.value }))}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
                    >
                      {voiceOptions.map(voice => (
                        <option key={voice.id} value={voice.id}>
                          {voice.language ? `[${voice.language}] ` : ''}{voice.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="border-t border-slate-200 pt-4">
                    <h4 className="font-semibold text-slate-700 mb-3 flex items-center gap-2">
                      <svg className="w-5 h-5 text-pink-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      朋友圈内容（可选）
                    </h4>
                    {momentContents.map((moment, index) => (
                      <div key={index} className="flex gap-2 mb-2">
                        <select
                          value={moment.mediaType}
                          onChange={e => {
                            const newMoments = [...momentContents];
                            newMoments[index].mediaType = e.target.value;
                            setMomentContents(newMoments);
                          }}
                          className="px-3 py-2 border border-slate-200 rounded-lg bg-slate-50"
                        >
                          <option value="text">文字</option>
                          <option value="image">图片</option>
                          <option value="video">视频</option>
                        </select>
                        <input
                          type="text"
                          placeholder="内容"
                          value={moment.content}
                          onChange={e => {
                            const newMoments = [...momentContents];
                            newMoments[index].content = e.target.value;
                            setMomentContents(newMoments);
                          }}
                          className="flex-1 px-3 py-2 border border-slate-200 rounded-lg bg-slate-50"
                        />
                        <button
                          type="button"
                          onClick={() => setMomentContents(prev => prev.filter((_, i) => i !== index))}
                          className="px-3 py-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          删除
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => setMomentContents(prev => [...prev, { content: '', mediaType: 'text', mediaUrl: '' }])}
                      className="text-blue-600 text-sm font-medium hover:text-blue-700 mt-2 flex items-center gap-1"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      添加朋友圈
                    </button>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="px-6 py-2.5 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl font-medium hover:from-blue-600 hover:to-purple-600 disabled:opacity-50 transition-all shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 flex items-center gap-2"
                    >
                      {isLoading ? '保存中...' : '保存'}
                    </button>
                    <button
                      type="button"
                      onClick={resetForm}
                      className="px-6 py-2.5 border border-slate-200 text-slate-600 rounded-xl font-medium hover:bg-slate-50 transition-all flex items-center gap-2"
                    >
                      取消
                    </button>
                  </div>
                </form>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {characters.map(char => (
                <div key={char.id} className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg shadow-slate-200/50 p-6 hover:shadow-xl hover:shadow-slate-300/50 transition-all duration-300 hover:-translate-y-1">
                  <div className="relative">
                    <img
                      src={char.avatar}
                      alt={char.nickname}
                      className="w-24 h-24 object-cover rounded-2xl mx-auto mb-4 ring-4 ring-blue-500/20"
                    />
                    {char.voice && (
                      <div className="absolute bottom-2 right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center ring-2 ring-white">
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/>
                          <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>
                        </svg>
                      </div>
                    )}
                  </div>
                  <h3 className="text-lg font-bold text-center text-slate-800">{char.nickname}</h3>
                  <p className="text-slate-500 text-center text-sm">{char.realName}</p>
                  {char.voice && <p className="text-blue-500 text-center text-xs mt-1 font-medium">音色: {getVoiceName(char.voice)}</p>}
                  <p className="mt-3 text-slate-600 text-sm line-clamp-3">{char.persona}</p>
                  <div className="flex gap-2 mt-5">
                    <button
                      onClick={() => startConversation(char.id)}
                      className="flex-1 px-3 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl text-sm font-medium hover:from-green-600 hover:to-emerald-600 transition-all shadow-lg shadow-green-500/25 hover:shadow-green-500/40"
                    >
                      开始聊天
                    </button>
                    <button
                      onClick={() => handleEdit(char)}
                      className="px-3 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl text-sm font-medium hover:from-amber-600 hover:to-orange-600 transition-all shadow-lg shadow-amber-500/25"
                    >
                      编辑
                    </button>
                    <button
                      onClick={() => handleDelete(char.id)}
                      className="px-3 py-2 bg-gradient-to-r from-red-500 to-rose-500 text-white rounded-xl text-sm font-medium hover:from-red-600 hover:to-rose-600 transition-all shadow-lg shadow-red-500/25"
                    >
                      删除
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Chat Tab */}
        {activeTab === 'chat' && (
          <div className="bg-gradient-to-br from-slate-50 to-blue-50 rounded-2xl shadow-2xl h-[650px] flex overflow-hidden border border-slate-200/50">
            {/* Conversation List Sidebar */}
            <div className="w-72 bg-white/80 backdrop-blur-sm border-r border-slate-200/50 p-4 overflow-y-auto">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <h3 className="font-bold text-slate-800">我的会话</h3>
              </div>
              {conversations.length === 0 ? (
                <p className="text-slate-400 text-sm text-center py-8">暂无会话记录</p>
              ) : (
                <>
                  <div className="space-y-2">
                    {conversations.map(conv => (
                      <div
                        key={conv.id}
                        onClick={() => loadConversation(conv)}
                        className={`p-3 rounded-xl cursor-pointer flex items-center gap-3 transition-all duration-200 ${
                          currentConversation === conv.id
                            ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg shadow-blue-500/25'
                            : 'hover:bg-slate-100 bg-slate-50/50'
                        }`}
                      >
                        <img src={conv.avatar} alt={conv.nickname} className="w-12 h-12 rounded-full object-cover ring-2 ring-white/50" />
                        <div className="flex-1 min-w-0">
                          <p className={`font-semibold text-sm truncate ${currentConversation === conv.id ? 'text-white' : 'text-slate-700'}`}>{conv.nickname}</p>
                          <p className={`text-xs truncate ${currentConversation === conv.id ? 'text-white/70' : 'text-slate-400'}`}>{conv.realName}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  {conversationPagination && conversationPagination.totalPages > 1 && (
                    <button
                      onClick={() => fetchConversations(userId, conversationPagination.page + 1)}
                      className="w-full py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors mt-2"
                    >
                      加载更多
                    </button>
                  )}
                </>
              )}
              <div className="border-t border-slate-200/50 mt-4 pt-4">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-6 h-6 bg-gradient-to-br from-pink-500 to-rose-500 rounded-lg flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                  </div>
                  <h4 className="font-semibold text-slate-700 text-sm">选择角色</h4>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {characters.map(char => (
                    <div
                      key={char.id}
                      onClick={() => startConversation(char.id)}
                      className="p-2 rounded-xl cursor-pointer flex flex-col items-center gap-1 hover:bg-gradient-to-br from-pink-50 to-rose-50 border border-transparent hover:border-pink-200 transition-all duration-200"
                    >
                      <img src={char.avatar} alt={char.nickname} className="w-10 h-10 rounded-full object-cover ring-2 ring-pink-200" />
                      <span className="text-xs text-slate-600 truncate w-full text-center">{char.nickname}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 flex flex-col bg-white/50 backdrop-blur-sm">
              {currentConversation && selectedCharacter ? (
                <>
                  <div className="p-4 border-b border-slate-200/50 flex items-center justify-between bg-white/80 backdrop-blur-sm">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <img src={selectedCharacter.avatar} alt={selectedCharacter.nickname} className="w-12 h-12 rounded-full object-cover ring-2 ring-blue-500/30" />
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                      </div>
                      <div>
                        <p className="font-bold text-slate-800">{selectedCharacter.nickname}</p>
                        <p className="text-sm text-slate-500">{selectedCharacter.realName}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="px-3 py-1.5 bg-gradient-to-r from-amber-50 to-orange-50 rounded-full border border-amber-200/50 flex items-center gap-2">
                        <svg className="w-4 h-4 text-amber-500" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                        </svg>
                        <span className="text-sm font-semibold text-amber-600">{favorability}</span>
                        {favorabilityLevel && (
                          <span className="px-2 py-0.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs rounded-full font-medium">
                            Lv.{favorabilityLevel.level}
                          </span>
                        )}
                      </div>
                      {favorabilityChange !== null && (
                        <span className={`text-sm font-bold animate-bounce ${favorabilityChange >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                          {favorabilityChange >= 0 ? '+' : ''}{favorabilityChange}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-gradient-to-b from-slate-50 to-blue-50/30">
                    {messagePagination && messagePagination.page > 1 && (
                      <button
                        onClick={loadMoreMessages}
                        className="w-full py-2 text-sm text-blue-600 hover:bg-blue-100 rounded-full block mx-auto max-w-xs transition-colors"
                      >
                        加载更多历史消息
                      </button>
                    )}
                    {chatMessages.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-full text-slate-400">
                        <div className="w-20 h-20 mb-4 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center">
                          <svg className="w-10 h-10 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                          </svg>
                        </div>
                        <p>开始发送消息聊天吧</p>
                      </div>
                    ) : (
                      chatMessages.map(msg => (
                        <div
                          key={msg.id}
                          className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}
                        >
                          {msg.role === 'assistant' && (
                            <img src={selectedCharacter.avatar} alt="" className="w-8 h-8 rounded-full object-cover mr-2 self-end" />
                          )}
                          <div
                            className={`max-w-[65%] p-3.5 rounded-2xl shadow-sm ${
                              msg.role === 'user'
                                ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-br-md'
                                : 'bg-white border border-slate-200 text-slate-700 rounded-bl-md'
                            }`}
                          >
                            <p className="text-sm leading-relaxed">{msg.content}</p>
                            <p className={`text-xs mt-1.5 ${msg.role === 'user' ? 'text-white/60' : 'text-slate-400'}`}>
                              {new Date(msg.createdAt).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}
                            </p>
                            {msg.role === 'assistant' && selectedCharacter.voice && (
                              <button
                                onClick={() => playVoice(msg)}
                                disabled={synthesizingMessageId === msg.id}
                                className={`mt-2 p-2 rounded-full transition-all ${
                                  playingMessageId === msg.id
                                    ? 'bg-red-500 text-white'
                                    : 'bg-blue-500 text-white hover:bg-blue-600 hover:scale-110'
                                } disabled:opacity-50 disabled:hover:scale-100`}
                                title={playingMessageId === msg.id ? '停止播放' : '播放语音'}
                              >
                                {synthesizingMessageId === msg.id ? (
                                  <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                  </svg>
                                ) : playingMessageId === msg.id ? (
                                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                                    <rect x="6" y="6" width="4" height="12" rx="1" />
                                    <rect x="14" y="6" width="4" height="12" rx="1" />
                                  </svg>
                                ) : (
                                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M8 5v14l11-7z" />
                                  </svg>
                                )}
                              </button>
                            )}
                          </div>
                          {msg.role === 'user' && (
                            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 ml-2 self-end flex items-center justify-center text-white text-xs font-medium">
                              你
                            </div>
                          )}
                        </div>
                      ))
                    )}
                    {isLoading && (
                      <div className="flex justify-start">
                        <div className="bg-white border border-slate-200 p-3 rounded-2xl rounded-bl-md shadow-sm flex items-center gap-2">
                          <div className="flex gap-1">
                            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                          </div>
                          <span className="text-slate-500 text-sm">正在思考...</span>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="p-4 border-t border-slate-200/50 bg-white/80 backdrop-blur-sm">
                    <div className="flex gap-3 items-end">
                      <div className="flex-1 relative">
                        <input
                          type="text"
                          value={inputMessage}
                          onChange={e => setInputMessage(e.target.value)}
                          onKeyPress={e => e.key === 'Enter' && sendMessage()}
                          placeholder="发送消息..."
                          className="w-full px-5 py-3 bg-slate-100 border-0 rounded-2xl focus:ring-2 focus:ring-blue-500/50 focus:bg-white transition-all duration-200 text-slate-700 placeholder-slate-400"
                        />
                      </div>
                      <button
                        onClick={sendMessage}
                        disabled={isLoading || !inputMessage.trim()}
                        className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-2xl hover:from-blue-600 hover:to-purple-600 disabled:opacity-50 disabled:hover:from-blue-500 disabled:hover:to-purple-500 transition-all duration-200 shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 flex items-center gap-2 font-medium"
                      >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                        </svg>
                        发送
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-slate-400 bg-gradient-to-br from-slate-50 to-blue-50/30">
                  <div className="w-24 h-24 mb-6 bg-gradient-to-br from-slate-200 to-slate-300 rounded-full flex items-center justify-center">
                    <svg className="w-12 h-12 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  </div>
                  <p className="text-lg font-medium text-slate-500 mb-2">选择一个角色开始对话</p>
                  <p className="text-sm">或从左侧选择历史会话</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

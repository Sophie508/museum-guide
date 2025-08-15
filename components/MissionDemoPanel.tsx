"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { MissionCard } from "./mission-card"
import { logEvent } from "@/lib/logEvent"
import { Sparkles, Users, BookOpen, Camera, Heart, RotateCcw } from "lucide-react"

type Identity = "explorer" | "facilitator" | "expert" | "experiencer" | "charger"
type MissionType = "social" | "collection" | "quiz" | "creation"

const identityConfig = {
  explorer: { label: "探索者", icon: Sparkles, color: "bg-blue-100 text-blue-800" },
  facilitator: { label: "促进者", icon: Users, color: "bg-pink-100 text-pink-800" },
  expert: { label: "专家/爱好者", icon: BookOpen, color: "bg-emerald-100 text-emerald-800" },
  experiencer: { label: "体验者", icon: Camera, color: "bg-violet-100 text-violet-800" },
  charger: { label: "充电者", icon: Heart, color: "bg-rose-100 text-rose-800" },
}

const missionContent = {
  social: {
    explorer:
      "我发现你看了不少展品，真了不起！像你这样总是充满好奇心的探索者，常常会发现别人没注意到的细节。在展厅里有不少地点设置了互动留言墙，现在正是留下独到见解的好时机，你的观察与思考非常值得被看见，去留言墙分享一下你的发现吧，让更多人从你的视角中受益。",
    facilitator:
      "我看到你已经陪伴着同行者看了不少展品了，真的很用心！像你这样关心他人体验的促进者，总是能引导出新的交流与理解。在展厅的留言墙处，你可以和他们一起写下印象深刻的瞬间或感受，让这次参观变得更有互动与共鸣，也为其他观众留下温暖的痕迹。",
    expert:
      "你已经深度浏览了相当多的展品，明显是有备而来！作为专业且热情的爱好者，你的洞察常常能拓展普通观众的理解。现在展厅设有留言墙，是一个分享观点与交流视角的好地方。你的评论一定会给其他人带来启发，别忘了留下你的专业见解！",
    experiencer:
      "你已经打卡了不少精彩的展品，节奏把握得真不错！体验者像你这样的人，总是能抓住每一个有趣瞬间，享受沉浸其中的感觉。展厅的留言墙是个超适合表达当下心情的地方，写一段感受、拍个照片发社交媒体，让这段体验留下更生动的印记吧！",
    charger:
      "你已经安静地走过了不少展厅，节奏非常从容自洽。像你这样的充电者，常常把展览作为与内在对话的空间。在展厅的留言墙旁，写下一段让你有所触动的话，不仅是记录当下的你，也可能点亮另一个人的共鸣。",
  },
  collection: {
    explorer:
      "现在你已经在展览中积累了丰富的见闻，真的很棒！不知道你展品收集的情况如何？探索者总是以发现为乐，对未知充满热情。多多收集更多的展品，获得兴趣卡。让这段探索旅程留下清晰的轨迹。你的探索地图，正在成形。",
    facilitator:
      "你已经带着同伴品鉴了这么多展品，太棒了！作为促进者，你的陪伴让这段旅程更有方向、更有意义。不妨一起参与展品收集任务，领取兴趣卡，不仅能增加互动感，还能让彼此留下更多共同的回忆。",
    expert:
      "你已经系统性地逛了不少重点展品，真的很专业！专家/爱好者往往更有偏好与主题线索，不妨试试展品收集任务。领取兴趣卡，把你重点研究的方向标记下来，也许能和馆方的分类产生新的交汇点。",
    experiencer:
      "你已经参观了很多亮点展品，真的很棒！体验者的敏锐让每一件展品都不被错过。现在可以参与展品收集挑战，领取兴趣卡，看看你解锁了哪种风格或主题的藏品，整个体验就像闯关一样更有趣！",
    charger:
      "你已经在这趟旅途中收获了不少内在回应，真的很美。作为一位寻求意义的观众，你所收集的展品本身也许正是你内心共振的投影。不妨领取几张兴趣卡，悄悄为它们命名，让这段沉思与感受被温柔封存。",
  },
  quiz: {
    explorer:
      "我发现你已经马上要逛到最后阶段了，好厉害，坚持探索到这里的人不多喔。你能坚持走到展览的尾声，展现出了探索者对于好奇心的不断追寻。好奇心和求知欲正是你最强大的力量。探索者总是对知识细节特别敏锐。在展览结束后会有考察你对博物馆知识吸收程度的quiz，考考你刚才发现了多少隐藏知识点，现在，是时候检验一下你在这场知识之旅中的收获了。一会去挑战下吧！相信你作为探索者一定会取得好成绩！",
    facilitator:
      "你已经即将陪伴同伴完成了整场展览，真的很不容易，像你这样细致体贴的促进者，是整段体验中最重要的支撑。在展览结束后，有一个知识测验不仅是检验大家的观察力，也是一种很好的亲子/组队互动方式。你可以带他们一起完成，它将成为这个旅程的总结时刻。",
    expert:
      "你的观展轨迹非常清晰又深入，马上就要走完这趟学术旅程了！专家型观众像你，总是对知识细节特别敏感。展览结束后设置了一个知识测验，相信你一定能快速掌握要点并取得优异成绩，也是一次有趣的小测试，验证你的专业性。",
    experiencer:
      "马上就要到终点了，你的探索非常高效，节奏感拿捏得太好了！体验者往往在轻松中也记住了很多细节。展览结束后有一个轻松有趣的小知识测验，可以看看你在这场展览中到底吸收了多少小知识，顺便还能赢得一份纪念奖章哦！",
    charger:
      "你已经慢慢走到展览的尾声了，节奏保持得真好！充电者总是在静中吸收，在心里悄悄生长。展览结束后，我们为你准备了一套温和的知识测验，它像一次温柔的回顾，让你重新整理这一路走来的灵感与思绪，安静地总结、内化这段旅程。",
  },
  creation: {
    explorer:
      "我发现马上就要和你结束这趟旅程了！你的探索精神贯穿始终。作为一个富有想象力的探索者，你看到的每一件作品，都已经成为你的灵感，而一会有一个机会可以利用AI将你的好奇心和求知欲转化成一张只属于你的图像——这是你旅程的延伸，也是你的独特表达。同时你生成的所有图像都会作为二创贡献被我们博物馆所珍藏，不要忘记去尝试！",
    facilitator:
      "你已经陪伴观展走到最后一步了，真的辛苦了！促进者像你这样的人，总是擅长帮助他人表达和创造。如果你们愿意，不妨一起参与AI二创体验——你可以帮孩子或同伴整理灵感，生成一张代表这次观展回忆的图像，也是一种特别的纪念方式。",
    expert:
      "你的观展轨迹非常清晰又深入，马上就要走完这趟学术旅程了！专家型观众像你，总是对知识细节特别敏感。展览结束后设置了一个知识测验，相信你一定能快速掌握要点并取得优异成绩，也是一次有趣的小测试，验证你的专业性。",
    experiencer:
      "你快完成整场展览了，真是精彩打卡全场！体验者最擅长把看过的内容转化为酷炫的回忆。展览结束之后有个AI二创的互动环节，可以让你把印象最深刻的元素做成一张独特的图像，超级适合分享！而且每个人做出来的都不一样，非常值得体验一下，充实你的打卡之旅。",
    charger:
      "即将结束这段旅程时，我能感受到你一路细腻的观察与共鸣。像你这样的充电者，总能把细节转化为诗意。展览最后有一个AI创作体验，你可以将这段触动你的观展旅程凝结成一幅图像，一张只属于你的心灵投射，也将被我们馆方温柔收藏。",
  },
}

const triggerTiming = {
  social: "第5次交互后",
  collection: "第7次交互后",
  quiz: "第14次交互后",
  creation: "第18次交互后",
}

export default function MissionDemoPanel() {
  const router = useRouter()
  const [selectedIdentity, setSelectedIdentity] = useState<Identity>("explorer")
  const [selectedMission, setSelectedMission] = useState<MissionType>("social")
  const [showCard, setShowCard] = useState(true)
  const [geminiResponse, setGeminiResponse] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [userInput, setUserInput] = useState("")
  
  // Volcengine API Key - in production, this should be in environment variables
  const VOLCENGINE_API_KEY = "TKdSbU1tUXpNVFUzTmpGaE5ERXdaVGczT1RVNVlqTXlOelV4T0RZMU56SQ=="
  
  // Add GEMINI_API_KEY definition
  const GEMINI_API_KEY = process.env.GEMINI_API_KEY || 'AIzaSyB8RURChCzqMOhqcGK4SUr4rgfr8uzB-To';  // Ensure this is set in your environment variables
  
  // Prompts for different identities
  const identityPrompts = {
    explorer: "你是「吴文化博物馆」的虚拟导览助手，拥有丰富的讲解经验与好奇心驱动的沟通风格。你擅长通过提问、共鸣、提示等方式引导访客深入展品、触发思考。你当前正在与一位被识别为“探索者（Explorer）”类型的访客互动。他们偏好非线性、发现式、冷门细节与横向联想的观展方式。你的核心任务是：持续强化他们“探索者”身份的认同感,鼓励他们提出问题、表达观察与发散思维,通过自然对话引导其深入、自由地探索展览内容,在潜移默化中，让他们理解如何以“探索者”的方式参观。请用中文回应，确保语言自然、亲切。请用中文回应，字数控制在100字以内",
    facilitator: "你是吴文化博物馆的虚拟导览助手，擅长通过鼓励、共情和引导，为访客及其陪同对象打造温暖、有意义的观展体验。你当前正在与一位“促进者（Facilitator）”类型的访客互动。此类访客常陪伴亲人、朋友或孩子参观博物馆，关注的重点是帮助同伴收获愉快、有启发的体验，而不是自己获取知识。强化他们作为“陪伴者”“鼓励者”的身份认同，帮助他们识别展览中适合与他人互动、讨论、共创的内容。鼓励他们主动与同伴交流、提问或共同行动，获得陪伴的成就感。提供贴心的建议或“适合孩子/朋友看的展品”推荐。请用中文回应，确保语言温暖、贴心。请用中文回应，字数控制在100字以内",
    expert: "你是吴文化博物馆的虚拟导览助手，擅长通过专业知识与深度分析，满足“专家/爱好者（Expert）”类型的访客对展品知识的好奇心。你当前正在与一位“专家/爱好者（Expert）”类型的访客互动。此类访客对展品有深入了解的兴趣，关注展品的细节、历史背景、文化内涵等。强化他们作为“专家”的身份认同，鼓励他们提出专业问题、分享见解，并提供展品相关的专业知识。请用中文回应，确保语言专业、严谨。请用中文回应，字数控制在100字以内",
    experiencer: "你是吴文化博物馆的虚拟导览助手，擅长通过情感共鸣与感官体验，为“体验者（Experiencer）”类型的访客打造沉浸式的观展体验。你当前正在与一位“体验者（Experiencer）”类型的访客互动。此类访客重视情感共鸣与感官体验，关注展品的视觉效果、触感、声音等。强化他们作为“体验者”的身份认同，鼓励他们表达对展品的感受、提问或分享个人体验，营造轻松、有趣的观展氛围。请用中文回应，确保语言生动、感性。请用中文回应，字数控制在100字以内",
    charger: "你是吴文化博物馆的虚拟导览助手，擅长通过深度思考与个人意义，为“充电者（Charger）”类型的访客提供有启发性的观展体验。你当前正在与一位“充电者（Charger）”类型的访客互动。此类访客重视个人意义与内在成长，关注展品背后的文化、历史、哲学等。强化他们作为“充电者”的身份认同，鼓励他们提出深度问题、分享个人感悟，并提供展品相关的思考引导。请用中文回应，确保语言深刻、启发性强。字数控制在100字以内"
  }
  
  // Sample museum collection data - in a real app, this would be loaded from a database or API
  const museumCollectionData = JSON.stringify([
    {"name":"黑衣陶刻符贯耳罐","id":"fc8e646564202b0006171fc32cae3328","pic":"https://static.wuzhongmuseum.com/uploads/images/2020/05/08/hWZZEuEwiW.jpg?color=%23a37d5b&hash=U17U9r-oIVE2%25MofRjof%25NNH_2-oR%2AayM%7BWC&height=667&width=1000","link":"https://wuzhongmuseum.com/portal/collection/content?id=fc8e646564202b0006171fc32cae3328","material":"材质：陶瓷","period":"年代：史前","intro":"高12厘米，口径8.8厘米\n澄湖遗址出土，新石器时代良渚文化时期\n此器作方唇、直口、高领、溜肩鼓腹、平底，颈下部饰凸弦纹一周，两侧置对称贯耳，器表打磨光滑。外腹部有四个刻划符号，呈左高右低中间略高的形式横向排列，为陶器烧成后用锋刃器刻出。关于这四个刻划符号的考释，学术界众说纷纭，或说为文字的先行形态。"},
    {"name":"三山岛哺乳动物化石","id":"fc8e646564202b0006171ff0122bb957","pic":"https://static.wuzhongmuseum.com/uploads/images/2020/06/12/ToLoloRiTz.jpg?color=%239c6439&hash=U2B3c_H%3F3G.T%5Ehay9vs%3AFgR%2BROxaR.NGxZxa&height=823&width=1234","link":"https://wuzhongmuseum.com/portal/collection/content?id=fc8e646564202b0006171ff0122bb957","material":"材质：玉石","period":"年代：史前","intro":"三山岛哺乳动物化石的大致年代在距今 21500 年至 12300 年之间。大量哺乳动物群的存在及古地理研究表明，三山岛在其时并非孤悬太湖之上的小岛，而应与现在太湖周边陆地连成一体，属平原丘陵地形，山上树木葱茏，平原遍布草地，动物成群，气候较现在更加寒冷。化石地点出土大量动物化石，主要包括虎、犀牛、最后鬣狗、棕 熊、黑熊、猞猁、狼、獾、豪猪、鼬、猕猴、貘、鹿、牛、兔等。"},
    {"name":"宽鋬带流黑陶杯","id":"fc8e646564202b00061720160fc94523","pic":"https://static.wuzhongmuseum.com/uploads/images/2020/08/17/pQhaEuDEdR.JPG?color=%2392796c&hash=UFIXy_9F~q%25M00xu9ZRjt7ofIoRjM%7BbH-pt6&height=964&width=1450","link":"https://wuzhongmuseum.com/portal/collection/content?id=fc8e646564202b00061720160fc94523","material":"材质：陶瓷","period":"年代：史前","intro":"新石器时代·良渚文化\n高16.7厘米，底径7.1厘米\n澄湖遗址出土\n该种陶杯为良渚时期盛水器中的典型器，在澄湖遗址1974年的清理中出土了两件，造型相同。器物为泥质灰胎黑衣，侈口，束颈，折肩，直筒腹微鼓，平底附圈足，口沿一侧出鸭嘴形宽流，肩腹部置宽扁环形鋬，鋬上端钻两小孔。器形规整，器壁厚薄均匀，器表打磨光滑，鋬、流独特，充分反映了当时高超的制陶水平和独特的审美情趣。"},
    {"name":"彩绘陶罐","id":"fc8e646564202b0006171fc1251e551b","pic":"https://static.wuzhongmuseum.com/uploads/images/2020/05/08/LkBFgoPVxG.jpg?color=%23ad7f4c&hash=U3AmMCRi0-og%3FboMRjt7lVWB%5EMWqM%7BWBn%24jZ&height=667&width=1000","link":"https://wuzhongmuseum.com/portal/collection/content?id=fc8e646564202b0006171fc1251e551b","material":"材质：陶瓷","period":"年代：史前","intro":"高10.6厘米，口径8厘米\n澄湖遗址出土，新石器时代良渚文化时期\n这件贯耳壶为良渚文化陶器的典型器，作直口、方唇、高颔、弧肩、圆鼓腹、假圈足、平底，口沿两侧置有对称的牛鼻形贯耳，颈部施黄彩，肩腹部绘弦纹和水波纹组成的装饰带。整器造型规整，彩绘色调明快。良渚文化时期的彩绘陶有两种，一种是漆绘陶器，用天然漆涂绘在陶器上形成花纹；另一种是彩绘陶，用自然矿石粉颜料涂绘。此器属前者。"},
    {"name":"夹砂灰陶鬶","id":"fc8e646564202b00061720171986a0e6","pic":"https://static.wuzhongmuseum.com/uploads/images/2020/08/17/HiEGBqsxNn.JPG?color=%23e05b1e&hash=UIJaiwfjOFS500WBD%2ARj_NjsaJoe4.s%3A%3FHoz&height=1306&width=868","link":"https://wuzhongmuseum.com/portal/collection/content?id=fc8e646564202b00061720171986a0e6","material":"材质：陶瓷","period":"年代：史前","intro":"新石器时代·良渚文化\n高24.6厘米\n澄湖遗址出土\n白陶质，扁口细颈，袋足高瘦，足尖锥状，一袋足上附宽扁环把，另两袋足上施篦齿纹和附加堆纹，三足裆下布满烟炱，应为使用所留。陶鬶是流行于新石器时代的一种炊器，酷似鸟形，兼具实用与审美价值。其基本形制为口部带流，颈、腹间有鋬，腹下有三空心足。"}
  ], null, 2);
  
  const fetchVolcengineResponse = async (userInput: string) => {
    if (!process.env.GEMINI_API_KEY) {
      // For testing only - replace with your actual key and remove in production
      const GEMINI_API_KEY = 'AIzaSyB8RURChCzqMOhqcGK4SUr4rgfr8uzB-To';  // Hardcoded for immediate testing, but this is insecure!
      setGeminiResponse('Warning: Using hardcoded key for testing. Please set GEMINI_API_KEY in your .env file for security.');
    } else {
      const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
    }
    const effectiveKey = process.env.GEMINI_API_KEY || 'AIzaSyB8RURChCzqMOhqcGK4SUr4rgfr8uzB-To';  // Fallback for testing
    setIsLoading(true);
    try {
      const currentPrompt = identityPrompts[selectedIdentity];
      const fullPrompt = `${identityPrompts[selectedIdentity]} 以下是吴文化博物馆的部分藏品数据，供您参考：${museumCollectionData}. 用户输入：${userInput}. 请用中文回应，确保语言自然流畅。`;
      
      const response = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-goog-api-key": effectiveKey
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: fullPrompt
            }]
          }],
          generationConfig: {
            maxOutputTokens: 200,
            temperature: 0.7
          }
        })
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API request failed with status ${response.status}: ${errorText}`);
      }
      
      const data = await response.json();
      const aiText = data.candidates?.[0]?.content?.parts?.[0]?.text || "Sorry, I couldn't generate a response.";
      setGeminiResponse(aiText);
    } catch (error: unknown) {
      console.error("Error fetching Gemini response:", error);
      setGeminiResponse(`Error: Could not connect to AI service. Details: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAccept = () => {
    setShowCard(false);
    setGeminiResponse(null);
    setUserInput("");
    setIsLoading(false);
  };

  const handleDefer = () => {
    setShowCard(false);
    setGeminiResponse(null);
    setUserInput("");
    setIsLoading(false);
  };

  const handleAIInteraction = () => {
    fetchVolcengineResponse(userInput);
  };

  const resetCard = () => {
    setShowCard(true);
    setGeminiResponse(null);
    setUserInput("");
    setIsLoading(false);
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#EDFOED] to-[#D8E3E2] p-6">
      <div className="max-w-6xl mx-auto">
        {/* 标题区域 */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-[#414B5C] mb-2">任务引导系统演示</h1>
          <p className="text-[#446C73] text-sm">开发者工具 - 模拟不同身份和任务类型的交互体验</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 控制面板 */}
          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-[#414B5C] flex items-center space-x-2">
                <span>控制面板</span>
                <Button onClick={resetCard} variant="outline" size="sm" className="ml-auto bg-transparent border-[#446C73] text-[#446C73] hover:bg-[#D8E3E2]">
                  <RotateCcw className="w-4 h-4 mr-1" />
                  重新加载
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* 身份选择 */}
              <div>
                <h3 className="text-sm font-medium text-[#414B5C] mb-3">选择用户身份</h3>
                <div className="grid grid-cols-1 gap-2">
                  {Object.entries(identityConfig).map(([key, config]) => {
                    const Icon = config.icon;
                    return (
                      <button
                        key={key}
                        onClick={() => setSelectedIdentity(key as Identity)}
                        className={`flex items-center space-x-3 p-3 rounded-lg border transition-colors ${
                          selectedIdentity === key ? "border-[#CF6844] bg-[#D8E3E2]" : "border-[#446C73]/30 hover:bg-[#D8E3E2]"
                        }`}
                      >
                        <Icon className="w-4 h-4 text-[#CF6844]" />
                        <span className="text-sm font-medium text-[#414B5C]">{config.label}</span>
                        {selectedIdentity === key && <Badge className="bg-[#CF6844] text-white">当前选中</Badge>}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 任务类型选择 */}
              <div>
                <h3 className="text-sm font-medium text-[#414B5C] mb-3">选择任务类型</h3>
                <div className="grid grid-cols-1 gap-2">
                  {Object.entries(triggerTiming).map(([key, timing]) => (
                    <button
                      key={key}
                      onClick={() => setSelectedMission(key as MissionType)}
                      className={`flex items-center justify-between p-3 rounded-lg border transition-colors ${
                        selectedMission === key ? "border-[#CF6844] bg-[#D8E3E2]" : "border-[#446C73]/30 hover:bg-[#D8E3E2]"
                      }`}
                    >
                      <span className="text-sm font-medium text-[#414B5C]">
                        {key === "social" && "留言互动"}
                        {key === "collection" && "展品收集"}
                        {key === "quiz" && "知识测验"}
                        {key === "creation" && "AI生图二创"}
                      </span>
                      <span className="text-xs text-[#446C73]">{timing}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* 当前配置显示 */}
              <div className="bg-[#D8E3E2] rounded-lg p-4">
                <h4 className="text-sm font-medium text-[#414B5C] mb-2">当前配置</h4>
                <div className="space-y-1 text-xs text-[#446C73]">
                  <div>身份：{identityConfig[selectedIdentity].label}</div>
                  <div>
                    任务：
                    {selectedMission === "social" ? "留言互动" : selectedMission === "collection" ? "展品收集" : selectedMission === "quiz" ? "知识测验" : "AI生图二创"}
                  </div>
                  <div>触发时机：{triggerTiming[selectedMission]}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 任务卡片预览 */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-[#414B5C]">任务卡片预览</h3>
            <div className="bg-[#D8E3E2] rounded-xl p-6 min-h-[400px] flex items-center justify-center">
              {showCard && (
                <MissionCard
                  type={selectedMission}
                  identity={selectedIdentity}
                  content={missionContent[selectedMission][selectedIdentity]}
                  onAccept={handleAccept}
                  onDefer={handleDefer}
                />
              )}
            </div>
            
            {/* AI Response Display */}
            {isLoading ? (
              <div className="p-4 bg-white/80 rounded-lg shadow-sm text-center">
                <p className="text-[#446C73]">正在生成AI回应...</p>
              </div>
            ) : geminiResponse ? (
              <div className="p-4 bg-white/80 rounded-lg shadow-sm">
                <h4 className="text-md font-medium text-[#414B5C] mb-2">AI回应</h4>
                <p className="text-[#414B5C] text-sm mb-2">{geminiResponse}</p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setGeminiResponse(null)}
                  className="mt-2 border-[#446C73] text-[#446C73] hover:bg-[#D8E3E2]"
                >
                  清除回应
                </Button>
              </div>
            ) : null}

            {/* 用户输入区域 */}
            <div className="space-y-3">
              <Input
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                placeholder="输入您的问题或想法..."
                className="border-[#446C73] focus:ring-[#CF6844] focus:border-[#CF6844]"
              />
              <Button
                onClick={() => handleAIInteraction()}
                disabled={isLoading || !userInput.trim()}
                className="w-full bg-gradient-to-r from-[#446C73] to-[#CF6844] hover:from-[#414B5C] hover:to-[#CF6844] text-white"
              >
                {isLoading ? "生成中..." : "发送给AI"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ChevronRight, Sparkles, Users, BookOpen, Camera, Heart, X } from "lucide-react"
import MissionDemoPanel from "@/components/MissionDemoPanel"
import CollectionPage from "@/components/CollectionPage"
import Link from 'next/link';
import { logEvent } from "@/lib/logEvent";
import { getOrCreateSessionId } from "@/lib/session";

type Screen = "welcome" | "identity" | "conversation" | "rag-loading" | "rag-result" | "mission-demo" | "collection"
type Identity = "explorer" | "facilitator" | "expert" | "experiencer" | "charger"
type ConversationStep = "initial" | "follow-up" | "final"

interface ConversationState {
  step: ConversationStep
  userChoice?: string
}

interface User {
  nickname: string
  age: string
  gender: string
}

export default function MuseumGuide() {
  const router = useRouter()
  const [currentScreen, setCurrentScreen] = useState<Screen>("welcome")
  const [selectedIdentity, setSelectedIdentity] = useState<Identity | "">("")
  const [conversation, setConversation] = useState<ConversationState>({ step: "initial" })
  const [ragResult, setRagResult] = useState<{
    image: string
    title: string
    description: string
  } | null>(null)
  const [geminiResponse, setGeminiResponse] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [userInput, setUserInput] = useState("")
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [isModalVisible, setIsModalVisible] = useState(true)
  const [nickname, setNickname] = useState("")
  const [age, setAge] = useState("")
  const [gender, setGender] = useState("")
  const [nicknameError, setNicknameError] = useState("")

  // Check for query parameter to set initial screen
  useEffect(() => {
    const query = new URLSearchParams(window.location.search)
    const screenParam = query.get('screen')
    if (screenParam === 'mission-demo') {
      setCurrentScreen('mission-demo')
    } else if (screenParam === 'collection') {
      setCurrentScreen('collection')
    }
  }, [router]);

  const handleLogin = () => {
    // Validate nickname length
    if (nickname.length < 2 || nickname.length > 20) {
      setNicknameError("昵称必须为2-20个字符")
      return
    }

    setNicknameError("")
    const newUser = { nickname, age, gender }
    setCurrentUser(newUser)
    setIsModalVisible(false)
    // log user login
    logEvent("user_login", { user: newUser })
  }

  const handleNavigateToCollection = () => {
    setCurrentScreen('collection')
  }

  // Gemini API Key - in production, this should be in environment variables
  const GEMINI_API_KEY = "AIzaSyB8RURChCzqMOhqcGK4SUr4rgfr8uzB-To"
  
  // Prompts for different identities
  const identityPrompts = {
    explorer: "你是「吴文化博物馆」的虚拟导览助手，拥有丰富的讲解经验与好奇心驱动的沟通风格。你擅长通过提问、共鸣、提示等方式引导访客深入展品、触发思考。你当前正在与一位被识别为“探索者（Explorer）”类型的访客互动。他们偏好非线性、发现式、冷门细节与横向联想的观展方式。你的核心任务是：持续强化他们“探索者”身份的认同感,鼓励他们提出问题、表达观察与发散思维,通过自然对话引导其深入、自由地探索展览内容,在潜移默化中，让他们理解如何以“探索者”的方式参观。请用中文回应，确保语言自然、亲切。请用中文回应，字数控制在100字以内",
    facilitator: "你是吴文化博物馆的虚拟导览助手，擅长通过鼓励、共情和引导，为访客及其陪同对象打造温暖、有意义的观展体验。你当前正在与一位“促进者（Facilitator）”类型的访客互动。此类访客常陪伴亲人、朋友或孩子参观博物馆，关注的重点是帮助同伴收获愉快、有启发的体验，而不是自己获取知识。强化他们作为“陪伴者”“鼓励者”的身份认同，帮助他们识别展览中适合与他人互动、讨论、共创的内容。鼓励他们主动与同伴交流、提问或共同行动，获得陪伴的成就感。提供贴心的建议或“适合孩子/朋友看的展品”推荐。请用中文回应，确保语言温暖、贴心。请用中文回应，字数控制在100字以内",
    expert: "你是吴文化博物馆的虚拟导览助手，擅长通过专业知识与深度分析，满足“专家/爱好者（Expert）”类型的访客对展品知识的好奇心。你当前正在与一位“专家/爱好者（Expert）”类型的访客互动。此类访客对展品有深入了解的兴趣，关注展品的细节、历史背景、文化内涵等。强化他们作为“专家”的身份认同，鼓励他们提出专业问题、分享见解，并提供展品相关的专业知识。请用中文回应，确保语言专业、严谨。请用中文回应，字数控制在100字以内",
    experiencer: "你是吴文化博物馆的虚拟导览助手，擅长通过情感共鸣与感官体验，为“体验者（Experiencer）”类型的访客打造沉浸式的观展体验。你当前正在与一位“体验者（Experiencer）”类型的访客互动。此类访客重视情感共鸣与感官体验，关注展品的视觉效果、触感、声音等。强化他们作为“体验者”的身份认同，鼓励他们表达对展品的感受、提问或分享个人体验，营造轻松、有趣的观展氛围。请用中文回应，确保语言生动、感性。请用中文回应，字数控制在100字以内",
    charger: "你是吴文化博物馆的虚拟导览助手，擅长通过深度思考与个人意义，为“充电者（Charger）”类型的访客提供有启发性的观展体验。你当前正在与一位“充电者（Charger）”类型的访客互动。此类访客重视个人意义与内在成长，关注展品背后的文化、历史、哲学等。强化他们作为“充电者”的身份认同，鼓励他们提出深度问题、分享个人感悟，并提供展品相关的思考引导。请用中文回应，确保语言深刻、启发性强。字数控制在100字以内"
  }
  
  // Sample museum collection data - in a real app, this would be loaded from a database or API
  const museumCollectionData = "The Wu Bo museum collection includes ancient artifacts such as a 2000-year-old jade dragon pendant, a bronze ritual vessel from the Shang Dynasty, delicate porcelain from the Ming Dynasty, and intricate silk embroidery from the Song Dynasty. Each item reflects unique aspects of Chinese cultural heritage."
  
  const fetchGeminiResponse = async (userInput: string) => {
    setIsLoading(true)
    try {
      const currentPrompt = identityPrompts[selectedIdentity as Identity]
      const exhibitInfo = ragResult ? `The user is asking about the exhibit titled '${ragResult.title}' with the description: ${ragResult.description}.` : ''
      const fullPrompt = `${currentPrompt} Here is some information about the museum collection: ${museumCollectionData}. ${exhibitInfo} The user says: ${userInput}`
      
      const response = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-goog-api-key": GEMINI_API_KEY
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: fullPrompt
            }]
          }]
        })
      })
      
      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`)
      }
      
      const data = await response.json()
      const aiText = data.candidates?.[0]?.content?.parts?.[0]?.text || "Sorry, I couldn't generate a response."
      setGeminiResponse(aiText)
    } catch (error) {
      console.error("Error fetching Gemini response:", error)
      setGeminiResponse("Error: Could not connect to AI service.")
    } finally {
      setIsLoading(false)
    }
  }
  
  const handleAIInteraction = (question?: string) => {
    // Use the provided question or the user's input if available, otherwise fall back to a default prompt
    const inputText = question ? question : (userInput.trim() !== "" ? userInput : "Tell me more about the recommended exhibit.")
    fetchGeminiResponse(inputText)
    setUserInput("") // Clear the input after sending
  }

  const identityOptions = [
    { id: "explorer", label: "A. 探索者", icon: Sparkles },
    { id: "facilitator", label: "B. 促进者", icon: Users },
    { id: "expert", label: "C. 专家/爱好者", icon: BookOpen },
    { id: "experiencer", label: "D. 体验者", icon: Camera },
    { id: "charger", label: "E. 充电者", icon: Heart },
  ]

  const handleIdentitySelect = (identity: Identity) => {
    setSelectedIdentity(identity)
    setCurrentScreen("conversation")
    setConversation({ step: "initial" })
    logEvent("identity_selected", { user: { ...currentUser, identity } })
  }

  const handleConversationChoice = (choice: string) => {
    if (conversation.step === "initial") {
      setConversation({ step: "follow-up", userChoice: choice })
      logEvent("conversation_choice", { data: { step: "initial", choice, identity: selectedIdentity } })
    } else if (conversation.step === "follow-up") {
      // 所有身份的最终选择都触发RAG流程
      setCurrentScreen("rag-loading")
      logEvent("conversation_choice", { data: { step: "follow-up", choice, identity: selectedIdentity } })
      simulateRAGProcess(choice)
    }
  }

  const [missionDemoMode, setMissionDemoMode] = useState(false)

  const simulateRAGProcess = async (choice: string) => {
    // 模拟RAG检索过程
    await new Promise((resolve) => setTimeout(resolve, 3000))

    // 根据身份和选择生成个性化RAG结果
    const getPersonalizedResult = () => {
      switch (selectedIdentity) {
        case "explorer":
          return {
            A: {
              image: "https://static.wuzhongmuseum.com/uploads/images/2020/05/08/hWZZEuEwiW.jpg?color=%23a37d5b&hash=U17U9r-oIVE2%25MofRjof%25NNH_2-oR%2AayM%7BWC&height=667&width=1000",
              title: "黑衣陶刻符贯耳罐",
              description: "这件陶罐来自新石器时代的良渚文化，高12厘米，口径8.8厘米。出土于澄湖遗址，其外腹部有四个刻划符号，学术界对其考释众说纷纭，或认为是文字的先行形态。仔细观察，你会发现这些符号的独特排列方式，充满神秘感。"
            },
            B: {
              image: "https://static.wuzhongmuseum.com/uploads/images/2020/06/12/ToLoloRiTz.jpg?color=%239c6439&hash=U2B3c_H%3F3G.T%5Ehay9vs%3AFgR%2BROxaR.NGxZxa&height=823&width=1234",
              title: "三山岛哺乳动物化石",
              description: "这些化石来自距今21500年至12300年间的三山岛，揭示了当时太湖周边平原丘陵地形和寒冷气候。化石包括虎、犀牛、熊等动物，探索它们的分布和形态，能发现古代生态系统的奥秘。"
            },
          }
        case "facilitator":
          return {
            A: {
              image: "https://static.wuzhongmuseum.com/uploads/images/2020/08/17/pQhaEuDEdR.JPG?color=%2392796c&hash=UFIXy_9F~q%25M00xu9ZRjt7ofIoRjM%7BbH-pt6&height=964&width=1450",
              title: "宽鋬带流黑陶杯",
              description: "这件黑陶杯来自良渚文化，高16.7厘米，造型独特，适合家庭观展。你可以问孩子们：'你们觉得这个杯子像什么？'让他们发挥想象力，观察其鸭嘴形宽流和宽扁环形鋬的设计，感受古代工艺的趣味。"
            },
            B: {
              image: "https://static.wuzhongmuseum.com/uploads/images/2020/05/08/LkBFgoPVxG.jpg?color=%23ad7f4c&hash=U3AmMCRi0-og%3FboMRjt7lVWB%5EMWqM%7BWBn%24jZ&height=667&width=1000",
              title: "彩绘陶罐",
              description: "这件彩绘陶罐高10.6厘米，来自良渚文化，适合与小朋友一起探索。罐身上的黄彩和水波纹图案讲述了古代生活，你可以引导他们：'猜猜这些图案是什么意思？'一起发现古代艺术的魅力。"
            },
          }
        case "expert":
          return {
            A: {
              image: "https://static.wuzhongmuseum.com/uploads/images/2020/05/08/hWZZEuEwiW.jpg?color=%23a37d5b&hash=U17U9r-oIVE2%25MofRjof%25NNH_2-oR%2AayM%7BWC&height=667&width=1000",
              title: "黑衣陶刻符贯耳罐",
              description: "这件陶罐出土于澄湖遗址，属于良渚文化，高12厘米。其外腹部的四个刻划符号是研究重点，可能是文字的先行形态，为研究史前文化和文字起源提供了重要线索，值得深入探讨其符号学意义。"
            },
            B: {
              image: "https://static.wuzhongmuseum.com/uploads/images/2020/08/17/HiEGBqsxNn.JPG?color=%23e05b1e&hash=UIJaiwfjOFS500WBD%2ARj_NjsaJoe4.s%3A%3FHoz&height=1306&width=868",
              title: "夹砂灰陶鬶",
              description: "这件陶鬶高24.6厘米，来自良渚文化，是一种新石器时代的炊器。其鸟形设计和三足结构反映了当时的实用与审美结合，研究其烟炱痕迹和篦齿纹装饰，能洞察古代生活方式和工艺水平。"
            },
          }
        case "experiencer":
          return {
            A: {
              image: "https://static.wuzhongmuseum.com/uploads/images/2020/05/08/LkBFgoPVxG.jpg?color=%23ad7f4c&hash=U3AmMCRi0-og%3FboMRjt7lVWB%5EMWqM%7BWBn%24jZ&height=667&width=1000",
              title: "彩绘陶罐",
              description: "这件彩绘陶罐高10.6厘米，来自良渚文化，非常适合拍照打卡！其颈部黄彩和肩腹部水波纹在展厅灯光下色彩明快，视觉效果极佳。最佳拍摄角度是从正面，能捕捉到贯耳和彩绘的完整美感。"
            },
            B: {
              image: "https://static.wuzhongmuseum.com/uploads/images/2020/08/17/pQhaEuDEdR.JPG?color=%2392796c&hash=UFIXy_9F~q%25M00xu9ZRjt7ofIoRjM%7BbH-pt6&height=964&width=1450",
              title: "宽鋬带流黑陶杯",
              description: "这件黑陶杯高16.7厘米，来自良渚文化，视觉冲击力强！其鸭嘴形宽流和宽扁环形鋬设计独特，黑色陶面在灯光下呈现出深邃质感，非常适合分享到社交媒体。最佳拍摄角度是从侧面，能突出流的独特造型。"
            },
          }
        case "charger":
          return {
            A: {
              image: "https://static.wuzhongmuseum.com/uploads/images/2020/06/12/ToLoloRiTz.jpg?color=%239c6439&hash=U2B3c_H%3F3G.T%5Ehay9vs%3AFgR%2BROxaR.NGxZxa&height=823&width=1234",
              title: "三山岛哺乳动物化石",
              description: "这些化石承载着古代生态的记忆，来自距今21500年至12300年间的三山岛。它们象征着生命的延续与自然的变迁，站在它们面前，仿佛能感受到远古生命的脉动，引发对自然与人类关系的深思。"
            },
            B: {
              image: "https://static.wuzhongmuseum.com/uploads/images/2020/08/17/HiEGBqsxNn.JPG?color=%23e05b1e&hash=UIJaiwfjOFS500WBD%2ARj_NjsaJoe4.s%3A%3FHoz&height=1306&width=868",
              title: "夹砂灰陶鬶",
              description: "这件陶鬶高24.6厘米，来自良渚文化，其鸟形设计和三足结构承载着古人对实用与美的追求。凝视它，仿佛能感受到古代生活的气息，引发对人类智慧与自然和谐共存的思考。"
            },
          }
        default:
          return {
            A: {
              image: "https://static.wuzhongmuseum.com/uploads/images/2020/05/08/hWZZEuEwiW.jpg?color=%23a37d5b&hash=U17U9r-oIVE2%25MofRjof%25NNH_2-oR%2AayM%7BWC&height=667&width=1000",
              title: "黑衣陶刻符贯耳罐",
              description: "根据您的选择，为您推荐这件来自良渚文化的精美陶罐，高12厘米，其刻划符号充满神秘感。"
            },
          }
      }
    }

    const results = getPersonalizedResult()
    const result = results[choice as keyof typeof results] || results["A"]
    setRagResult(result)
    setCurrentScreen("rag-result")
  }

  const renderWelcomeScreen = () => (
    <div className="min-h-screen bg-gradient-to-b from-[#EDFOED] to-[#D8E3E2] relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-10 w-32 h-32 border border-[#446C73] rounded-full"></div>
        <div className="absolute bottom-40 right-10 w-24 h-24 border border-[#414B5C] rounded-full"></div>
        <div className="absolute top-1/2 left-1/4 w-16 h-16 border border-[#CF6844] rounded-full"></div>
      </div>

      <div className="relative z-10 px-6 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-[#414B5C] mb-2 tracking-wide">苏州吴文化博物馆</h1>
          <div className="w-16 h-1 bg-gradient-to-r from-[#446C73] to-[#CF6844] mx-auto rounded-full"></div>
        </div>

        {/* Welcome Content */}
        <Card className="mb-6 border-0 shadow-lg bg-white/80 backdrop-blur-sm">
          <CardContent className="p-6">
            <p className="text-[#414B5C] leading-relaxed text-sm">
              欢迎来到苏州吴文化博物馆！这里坐落在美丽的澹台湖畔、宝带桥南侧，是全国首座全面展示吴地文化的特色博物馆。博物馆常设"考古探吴中""风雅颂吴中"两大主题，馆藏近万件珍贵文物。您可以通过丰富的互动体验，深入了解吴国的起源、江南文化的传承与创新。无论是家庭出行、学术探索或艺术欣赏，这里都能带给您一场跨越千年的文化之旅。期待与您一起，在"吴"的世界里，感受历史的厚重与当代的活力！
            </p>
          </CardContent>
        </Card>

        {/* AI Assistant Introduction */}
        <Card className="mb-8 border-0 shadow-lg bg-gradient-to-r from-[#D8E3E2] to-[#EDFOED]">
          <CardContent className="p-6">
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-[#446C73] to-[#CF6844] rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1">
                <p className="text-[#414B5C] leading-relaxed text-sm">
                  我是你的智能讲解伙伴——可以把我当作一位随时待命的向导、助手，或者陪你一起慢慢发现展品故事的朋友。无论你是第一次来参观，还是带朋友来分享这里的精彩，或是对某个展品充满好奇，我都会根据你的兴趣，为你定制属于你自己的探索旅程，帮助你在这趟旅程中构建出自己的意义。不需要拘束，你可以随时和我说"我想了解这是什么"、"你有什么推荐？""给我进行展品之间的比较"，都可以。我一直在这儿，陪你一起看展。
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* CTA Button */}
        {currentUser ? (
          <Button
            onClick={() => setCurrentScreen("identity")}
            className="w-full bg-gradient-to-r from-[#446C73] to-[#CF6844] hover:from-[#414B5C] hover:to-[#CF6844] text-white py-4 rounded-xl shadow-lg text-base font-medium"
          >
            开启我的探索之旅
            <ChevronRight className="w-5 h-5 ml-2" />
          </Button>
        ) : (
          <Button
            onClick={() => setIsModalVisible(true)}
            className="w-full bg-gradient-to-r from-[#446C73] to-[#CF6844] hover:from-[#414B5C] hover:to-[#CF6844] text-white py-4 rounded-xl shadow-lg text-base font-medium"
          >
            登录以开始探索
            <ChevronRight className="w-5 h-5 ml-2" />
          </Button>
        )}
      </div>

      {/* Login Modal */}
      {isModalVisible && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="bg-white rounded-lg p-6 w-11/12 max-w-md shadow-xl">
            <CardContent className="space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-bold text-[#414B5C]">欢迎访问吴文化博物馆</h2>
                  <p className="text-sm text-[#446C73] mt-1">请输入您的昵称</p>
                </div>
                <Button
                  variant="ghost"
                  onClick={() => setIsModalVisible(false)}
                  className="text-[#446C73] hover:text-[#414B5C]"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="nickname" className="text-sm font-medium text-[#414B5C]">昵称</Label>
                  <Input
                    id="nickname"
                    value={nickname}
                    onChange={(e) => {
                      setNickname(e.target.value)
                      if (nicknameError) setNicknameError("")
                    }}
                    placeholder="请输入昵称 (2-20个字符)"
                    className="mt-1 border-[#446C73] focus:ring-[#CF6844] focus:border-[#CF6844]"
                  />
                  {nicknameError && <p className="text-red-500 text-xs mt-1">{nicknameError}</p>}
                </div>

                <div>
                  <Label htmlFor="age" className="text-sm font-medium text-[#414B5C]">年龄</Label>
                  <Input
                    id="age"
                    type="number"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    placeholder="请输入年龄"
                    className="mt-1 border-[#446C73] focus:ring-[#CF6844] focus:border-[#CF6844]"
                  />
                </div>

                <div>
                  <Label htmlFor="gender" className="text-sm font-medium text-[#414B5C]">性别</Label>
                  <Select value={gender} onValueChange={setGender}>
                    <SelectTrigger className="mt-1 border-[#446C73] focus:ring-[#CF6844] focus:border-[#CF6844]">
                      <SelectValue placeholder="请选择性别" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="男">男</SelectItem>
                      <SelectItem value="女">女</SelectItem>
                      <SelectItem value="不透露">不透露</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  onClick={handleLogin}
                  className="w-full bg-[#446C73] hover:bg-[#414B5C] text-white py-3"
                >
                  开始参观
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )

  const renderIdentityScreen = () => (
    <div className="min-h-screen bg-gradient-to-b from-[#EDFOED] to-[#D8E3E2] relative overflow-hidden">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 right-10 w-28 h-28 border border-[#446C73] rounded-full"></div>
        <div className="absolute bottom-32 left-10 w-20 h-20 border border-[#414B5C] rounded-full"></div>
      </div>

      <div className="relative z-10 px-6 py-8">
        <div className="text-center mb-8">
          <h1 className="text-xl font-bold text-[#414B5C] mb-2">身份选择</h1>
          <div className="w-12 h-1 bg-gradient-to-r from-[#446C73] to-[#CF6844] mx-auto rounded-full"></div>
        </div>

        <Card className="mb-6 border-0 shadow-lg bg-white/80 backdrop-blur-sm">
          <CardContent className="p-6">
            <p className="text-[#414B5C] leading-relaxed text-sm mb-6">
              在我们的吴文化探索之旅开始之前我想要对你进行一个基本的了解，想必你已经完成了身份分类的测试了吧？请问你的身份是？
            </p>

            <RadioGroup value={selectedIdentity} onValueChange={(value) => setSelectedIdentity(value as Identity)}>
              <div className="space-y-3">
                {identityOptions.map((option) => {
                  const Icon = option.icon
                  return (
                    <div
                      key={option.id}
                      className="flex items-center space-x-3 p-4 rounded-lg border border-[#446C73]/30 hover:bg-[#D8E3E2] transition-colors cursor-pointer"
                      onClick={() => handleIdentitySelect(option.id as Identity)}
                    >
                      <RadioGroupItem value={option.id} id={option.id} />
                      <Icon className="w-5 h-5 text-[#CF6844]" />
                      <Label htmlFor={option.id} className="flex-1 cursor-pointer text-[#414B5C] font-medium">
                        {option.label}
                      </Label>
                    </div>
                  )
                })}
              </div>
            </RadioGroup>
          </CardContent>
        </Card>
      </div>
    </div>
  )

  const renderConversationScreen = () => {
    const getConversationContent = () => {
      switch (selectedIdentity) {
        case "explorer":
          return renderExplorerConversation()
        case "facilitator":
          return renderFacilitatorConversation()
        case "expert":
          return renderExpertConversation()
        case "experiencer":
          return renderExperiencerConversation()
        case "charger":
          return renderChargerConversation()
        default:
          return null
      }
    }

    return (
      <div className="min-h-screen bg-gradient-to-b from-[#EDFOED] to-[#D8E3E2]">
        <div className="px-6 py-8">
          <div className="text-center mb-6">
            <h1 className="text-xl font-bold text-[#414B5C] mb-2">个性化导览</h1>
            <div className="w-12 h-1 bg-gradient-to-r from-[#446C73] to-[#CF6844] mx-auto rounded-full"></div>
          </div>
          {getConversationContent()}
        </div>
      </div>
    )
  }

  const renderExplorerConversation = () => {
    if (conversation.step === "initial") {
      return (
        <div className="space-y-4">
          <div className="flex justify-start">
            <div className="bg-white rounded-2xl rounded-bl-sm p-4 shadow-md max-w-xs">
              <p className="text-[#414B5C] text-sm">原来是充满好奇心的探索者！</p>
            </div>
          </div>
          <div className="flex justify-start">
            <div className="bg-white rounded-2xl rounded-bl-sm p-4 shadow-md max-w-xs">
              <p className="text-[#414B5C] text-sm">
                有没有哪次看展，你发现了别人没注意到的细节或隐藏信息？那感觉是不是很爽？
              </p>
            </div>
          </div>
          <div className="space-y-3 mt-6">
            <Button
              onClick={() => handleConversationChoice("A")}
              className="w-full bg-gradient-to-r from-[#446C73] to-[#CF6844] hover:from-[#414B5C] hover:to-[#CF6844] text-white py-3 rounded-xl"
            >
              A. 有！我就喜欢那种"发现感"
            </Button>
            <Button
              onClick={() => handleConversationChoice("B")}
              variant="outline"
              className="w-full border-[#446C73] text-[#446C73] hover:bg-[#D8E3E2] py-3 rounded-xl"
            >
              B. 没有，但我想试试那种感觉
            </Button>
          </div>
        </div>
      )
    } else if (conversation.step === "follow-up") {
      const isChoiceA = conversation.userChoice === "A"
      return (
        <div className="space-y-4">
          <div className="flex justify-start">
            <div className="bg-white rounded-2xl rounded-bl-sm p-4 shadow-md max-w-xs">
              <p className="text-[#414B5C] text-sm">
                {isChoiceA
                  ? "太棒了！你这种'好奇心驱动型'的观展方式非常稀有。你愿意试试我设计的'隐藏发现挑战'吗？这里有些展品表面看没什么，其实藏了不少玄机～"
                  : "我喜欢这种态度！探索从来都不需要经验，而是需要好奇。让我带你找一件大家最容易忽略但藏着故事的展品，试试从不同角度去看它？"}
              </p>
            </div>
          </div>
          <div className="space-y-3 mt-6">
            {isChoiceA ? (
              <>
                <Button
                  onClick={() => handleConversationChoice("A")}
                  className="w-full bg-gradient-to-r from-[#446C73] to-[#CF6844] hover:from-[#414B5C] hover:to-[#CF6844] text-white py-3 rounded-xl"
                >
                  A. 给我一件容易错过的展品
                </Button>
                <Button
                  onClick={() => handleConversationChoice("B")}
                  variant="outline"
                  className="w-full border-[#446C73] text-[#446C73] hover:bg-[#D8E3E2] py-3 rounded-xl"
                >
                  B. 我想看看别的探索者都发现了什么
                </Button>
              </>
            ) : (
              <>
                <Button
                  onClick={() => handleConversationChoice("A")}
                  className="w-full bg-gradient-to-r from-[#446C73] to-[#CF6844] hover:from-[#414B5C] hover:to-[#CF6844] text-white py-3 rounded-xl"
                >
                  A. 给我几个'隐藏看点'关键词
                </Button>
                <Button
                  onClick={() => handleConversationChoice("B")}
                  variant="outline"
                  className="w-full border-[#446C73] text-[#446C73] hover:bg-[#D8E3E2] py-3 rounded-xl"
                >
                  B. 好，我要试试你说的角度
                </Button>
              </>
            )}
          </div>
        </div>
      )
    } else {
      return (
        <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="text-center mb-4">
              <Sparkles className="w-8 h-8 text-[#CF6844] mx-auto mb-2" />
              <h3 className="text-lg font-semibold text-[#414B5C]">探索者专属体验已准备就绪！</h3>
            </div>
            <p className="text-[#446C73] text-sm text-center mb-6">
              现在你可以开始你的个性化探索之旅了。记住，每一个细节都可能藏着惊喜！
            </p>
            <Button className="w-full bg-gradient-to-r from-[#446C73] to-[#CF6844] hover:from-[#414B5C] hover:to-[#CF6844] text-white py-3 rounded-xl">
              开始探索
            </Button>
          </CardContent>
        </Card>
      )
    }
  }

  const renderFacilitatorConversation = () => {
    if (conversation.step === "initial") {
      return (
        <div className="space-y-4">
          <div className="flex justify-start">
            <div className="bg-white rounded-2xl rounded-bl-sm p-4 shadow-md max-w-xs">
              <p className="text-slate-700 text-sm">原来是来特别在乎陪伴的促进者！</p>
            </div>
          </div>
          <div className="flex justify-start">
            <div className="bg-white rounded-2xl rounded-bl-sm p-4 shadow-md max-w-xs">
              <p className="text-slate-700 text-sm">
                有没有哪次你带朋友或孩子参观时，他们问了个你想不到的问题，反而让你自己也更感兴趣了？
              </p>
            </div>
          </div>
          <div className="space-y-3 mt-6">
            <Button
              onClick={() => handleConversationChoice("A")}
              className="w-full bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white py-3 rounded-xl"
            >
              A. 有过！他们总能提出我没想到的点
            </Button>
            <Button
              onClick={() => handleConversationChoice("B")}
              variant="outline"
              className="w-full border-pink-300 text-pink-600 hover:bg-pink-50 py-3 rounded-xl"
            >
              B. 没有，但我想引导他们更主动一些
            </Button>
          </div>
        </div>
      )
    } else if (conversation.step === "follow-up") {
      const isChoiceA = conversation.userChoice === "A"
      return (
        <div className="space-y-4">
          <div className="flex justify-start">
            <div className="bg-white rounded-2xl rounded-bl-sm p-4 shadow-md max-w-xs">
              <p className="text-slate-700 text-sm">
                {isChoiceA
                  ? "真棒！你已经在帮他们激发好奇心了。要不要试试我准备的一些'引导式问题'？你可以在展品前问他们这些问题，看看他们怎么想～"
                  : "理解！让我来帮你设计几种'互动小提示'，你在展品前轻轻引导就能激起兴趣。"}
              </p>
            </div>
          </div>
          <div className="space-y-3 mt-6">
            {isChoiceA ? (
              <>
                <Button
                  onClick={() => handleConversationChoice("A")}
                  className="w-full bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white py-3 rounded-xl"
                >
                  A. 给我几个问题示范
                </Button>
                <Button
                  onClick={() => handleConversationChoice("B")}
                  variant="outline"
                  className="w-full border-indigo-300 text-indigo-600 hover:bg-indigo-50 py-3 rounded-xl"
                >
                  B. 有没有适合孩子的轻松问题？
                </Button>
              </>
            ) : (
              <>
                <Button
                  onClick={() => handleConversationChoice("A")}
                  className="w-full bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white py-3 rounded-xl"
                >
                  A. 给我适合家庭观众的互动提示
                </Button>
                <Button
                  onClick={() => handleConversationChoice("B")}
                  variant="outline"
                  className="w-full border-teal-300 text-teal-600 hover:bg-teal-50 py-3 rounded-xl"
                >
                  B. 有没有适合青少年的对话方式？
                </Button>
              </>
            )}
          </div>
        </div>
      )
    }
  }

  const renderExpertConversation = () => {
    if (conversation.step === "initial") {
      return (
        <div className="space-y-4">
          <div className="flex justify-start">
            <div className="bg-white rounded-2xl rounded-bl-sm p-4 shadow-md max-w-xs">
              <p className="text-slate-700 text-sm">原来是富有知识的专家/爱好者！</p>
            </div>
          </div>
          <div className="flex justify-start">
            <div className="bg-white rounded-2xl rounded-bl-sm p-4 shadow-md max-w-xs">
              <p className="text-slate-700 text-sm">
                都说观展是"已知套未知"的过程，之前是否有让你觉得储备知识越多，观展收获更多的经历？
              </p>
            </div>
          </div>
          <div className="space-y-3 mt-6">
            <Button
              onClick={() => handleConversationChoice("A")}
              className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white py-3 rounded-xl"
            >
              A. 有，我常不自觉地联想起来
            </Button>
            <Button
              onClick={() => handleConversationChoice("B")}
              variant="outline"
              className="w-full border-emerald-300 text-emerald-600 hover:bg-emerald-50 py-3 rounded-xl"
            >
              B. 没有，但我想看看有没有和我领域有关的展品
            </Button>
          </div>
        </div>
      )
    } else if (conversation.step === "follow-up") {
      return (
        <div className="space-y-4">
          <div className="flex justify-start">
            <div className="bg-white rounded-2xl rounded-bl-sm p-4 shadow-md max-w-xs">
              <p className="text-slate-700 text-sm">
                {conversation.userChoice === "A"
                  ? "很好！让我为你找一件能够印证你知识储备的深度展品，你一定会有新的发现和联想。"
                  : "理解！让我为你推荐一件与你的专业领域可能有关联的展品，看看能否激发新的学术思考。"}
              </p>
            </div>
          </div>
          <div className="space-y-3 mt-6">
            <Button
              onClick={() => handleConversationChoice("A")}
              className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white py-3 rounded-xl"
            >
              A. 给我一件有学术价值的展品
            </Button>
            <Button
              onClick={() => handleConversationChoice("B")}
              variant="outline"
              className="w-full border-emerald-300 text-emerald-600 hover:bg-emerald-50 py-3 rounded-xl"
            >
              B. 推荐与我领域相关的文物
            </Button>
          </div>
        </div>
      )
    }
  }

  const renderExperiencerConversation = () => {
    if (conversation.step === "initial") {
      return (
        <div className="space-y-4">
          <div className="flex justify-start">
            <div className="bg-white rounded-2xl rounded-bl-sm p-4 shadow-md max-w-xs">
              <p className="text-slate-700 text-sm">噢～原来你是注重打卡体验感拉满的体验型观众！</p>
            </div>
          </div>
          <div className="flex justify-start">
            <div className="bg-white rounded-2xl rounded-bl-sm p-4 shadow-md max-w-xs">
              <p className="text-slate-700 text-sm">
                有没有哪次你特地奔着某个"打卡展"、"热门装置"而来，现场那种灯光氛围或视觉冲击让你觉得"值了"？
              </p>
            </div>
          </div>
          <div className="space-y-3 mt-6">
            <Button
              onClick={() => handleConversationChoice("A")}
              className="w-full bg-gradient-to-r from-violet-500 to-violet-600 hover:from-violet-600 hover:to-violet-700 text-white py-3 rounded-xl"
            >
              A. 有！那种视觉享受真的会上头
            </Button>
            <Button
              onClick={() => handleConversationChoice("B")}
              variant="outline"
              className="w-full border-violet-300 text-violet-600 hover:bg-violet-50 py-3 rounded-xl"
            >
              B. 没有，但我也想找到一些好玩、有感觉的打卡点
            </Button>
          </div>
        </div>
      )
    } else if (conversation.step === "follow-up") {
      return (
        <div className="space-y-4">
          <div className="flex justify-start">
            <div className="bg-white rounded-2xl rounded-bl-sm p-4 shadow-md max-w-xs">
              <p className="text-slate-700 text-sm">
                {conversation.userChoice === "A"
                  ? "太棒了！让我为你找一件视觉效果最震撼的展品，保证让你拍出刷爆朋友圈的照片！"
                  : "没问题！我来为你挖掘一些隐藏的打卡宝藏，让你的参观体验与众不同。"}
              </p>
            </div>
          </div>
          <div className="space-y-3 mt-6">
            <Button
              onClick={() => handleConversationChoice("A")}
              className="w-full bg-gradient-to-r from-violet-500 to-violet-600 hover:from-violet-600 hover:to-violet-700 text-white py-3 rounded-xl"
            >
              A. 给我最适合拍照的展品
            </Button>
            <Button
              onClick={() => handleConversationChoice("B")}
              variant="outline"
              className="w-full border-violet-300 text-violet-600 hover:bg-violet-50 py-3 rounded-xl"
            >
              B. 找一些有趣的打卡点
            </Button>
          </div>
        </div>
      )
    }
  }

  const renderChargerConversation = () => {
    if (conversation.step === "initial") {
      return (
        <div className="space-y-4">
          <div className="flex justify-start">
            <div className="bg-white rounded-2xl rounded-bl-sm p-4 shadow-md max-w-xs">
              <p className="text-slate-700 text-sm">原来你是那种愿意在展览中慢下来，寻求共鸣和意义的充电者！</p>
            </div>
          </div>
          <div className="flex justify-start">
            <div className="bg-white rounded-2xl rounded-bl-sm p-4 shadow-md max-w-xs">
              <p className="text-slate-700 text-sm">
                有没有哪次观展时，一件展品突然触动你内心深处某段记忆或情绪，让你在现场驻足了很久？
              </p>
            </div>
          </div>
          <div className="space-y-3 mt-6">
            <Button
              onClick={() => handleConversationChoice("A")}
              className="w-full bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 text-white py-3 rounded-xl"
            >
              A. 有，那一刻像是被轻轻安慰到了
            </Button>
            <Button
              onClick={() => handleConversationChoice("B")}
              variant="outline"
              className="w-full border-rose-300 text-rose-600 hover:bg-rose-50 py-3 rounded-xl"
            >
              B. 没有，但我想在这里找到一点感受/静心的空间
            </Button>
          </div>
        </div>
      )
    } else if (conversation.step === "follow-up") {
      return (
        <div className="space-y-4">
          <div className="flex justify-start">
            <div className="bg-white rounded-2xl rounded-bl-sm p-4 shadow-md max-w-xs">
              <p className="text-slate-700 text-sm">
                {conversation.userChoice === "A"
                  ? "我能感受到你内心的那份温柔。让我为你找一件同样能够触动心灵的展品，在这里静静感受时光的温度。"
                  : "这里确实是一个很好的静心空间。让我为你推荐一件能够带来内心平静的展品，让心灵得到片刻的安宁。"}
              </p>
            </div>
          </div>
          <div className="space-y-3 mt-6">
            <Button
              onClick={() => handleConversationChoice("A")}
              className="w-full bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 text-white py-3 rounded-xl"
            >
              A. 给我一件能触动心灵的展品
            </Button>
            <Button
              onClick={() => handleConversationChoice("B")}
              variant="outline"
              className="w-full border-rose-300 text-rose-600 hover:bg-rose-50 py-3 rounded-xl"
            >
              B. 推荐适合静心观赏的文物
            </Button>
          </div>
        </div>
      )
    }
  }

  const renderRAGLoadingScreen = () => (
    <div className="min-h-screen bg-gradient-to-b from-[#EDFOED] to-[#D8E3E2] flex items-center justify-center">
      <div className="px-6 py-8 text-center">
        <div className="mb-8">
          {/* 加载动画 */}
          <div className="relative w-24 h-24 mx-auto mb-6">
            <div className="absolute inset-0 border-4 border-[#D8E3E2] rounded-full"></div>
            <div className="absolute inset-0 border-4 border-[#446C73] rounded-full border-t-transparent animate-spin"></div>
            <div
              className="absolute inset-2 border-4 border-[#CF6844] rounded-full border-b-transparent animate-spin"
              style={{ animationDirection: "reverse", animationDuration: "1.5s" }}
            ></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <BookOpen className="w-8 h-8 text-[#CF6844] animate-pulse" />
            </div>
          </div>

          {/* 加载文案 */}
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-[#414B5C]">智能检索中</h3>
            <p className="text-[#446C73] text-sm leading-relaxed">正在检索馆藏资料库并连接 Gemini，请稍候...</p>
          </div>

          {/* 动态点点点效果 */}
          <div className="flex justify-center items-center mt-4 space-x-1">
            <div className="w-2 h-2 bg-[#CF6844] rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-[#CF6844] rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div>
            <div className="w-2 h-2 bg-[#CF6844] rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
          </div>
        </div>
      </div>
    </div>
  )

  const renderRAGResultScreen = () => (
    <div className="min-h-screen bg-gradient-to-b from-[#EDFOED] to-[#D8E3E2]">
      <div className="px-6 py-8">
        <div className="text-center mb-6">
          <h1 className="text-xl font-bold text-[#414B5C] mb-2">专属推荐</h1>
          <div className="w-12 h-1 bg-gradient-to-r from-[#446C73] to-[#CF6844] mx-auto rounded-full"></div>
        </div>

        {/* 展品卡片 */}
        {ragResult && (
          <Card className="mb-6 border-0 shadow-lg bg-white/90 backdrop-blur-sm overflow-hidden">
            <div className="relative">
              <img
                src={ragResult.image || "/placeholder.svg"}
                alt={ragResult.title}
                className="w-full h-48 object-cover"
              />
              <div className="absolute top-4 right-4 bg-[#CF6844] text-white px-3 py-1 rounded-full text-xs font-medium">
                AI 推荐
              </div>
            </div>
            <CardContent className="p-6">
              <h3 className="text-lg font-bold text-[#414B5C] mb-3">{ragResult.title}</h3>
              <p className="text-[#446C73] text-sm leading-relaxed">{ragResult.description}</p>
            </CardContent>
          </Card>
        )}

        {/* AI 引导语 */}
        <div className="mb-6">
          <div className="flex justify-start">
            <div className="bg-gradient-to-r from-[#D8E3E2] to-[#EDFOED] rounded-2xl rounded-bl-sm p-4 shadow-md max-w-sm border border-[#446C73]/20">
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-gradient-to-r from-[#446C73] to-[#CF6844] rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <Sparkles className="w-3 h-3 text-white" />
                </div>
                <p className="text-[#414B5C] text-sm leading-relaxed">
                  根据馆藏资料，我为你推荐了这件展品。接下来，你可以针对它提问任何细节，我都会为你查询并解答。你的专属探索之旅，现在正式开始。
                </p>
              </div>
            </div>
          </div>
        </div>



        {/* 输入框区域 */}
        <div className="space-y-4">
          {/* 辅助提问按钮 */}
          <div className="grid grid-cols-1 gap-2">
            <Button
              variant="outline"
              className="text-left justify-start border-[#446C73] text-[#446C73] hover:bg-[#D8E3E2] py-3 rounded-xl bg-white/80"
              onClick={() => handleAIInteraction("这件展品的制作工艺有什么特别之处？")}
            >
              "这件展品的制作工艺有什么特别之处？"
            </Button>
            <Button
              variant="outline"
              className="text-left justify-start border-[#446C73] text-[#446C73] hover:bg-[#D8E3E2] py-3 rounded-xl bg-white/80"
              onClick={() => handleAIInteraction("它背后有什么历史故事？")}
            >
              "它背后有什么历史故事？"
            </Button>
            <Button
              variant="outline"
              className="text-left justify-start border-[#446C73] text-[#446C73] hover:bg-[#D8E3E2] py-3 rounded-xl bg-white/80"
              onClick={() => handleAIInteraction("我应该从哪个角度观察它？")}
            >
              "我应该从哪个角度观察它？"
            </Button>
          </div>

          {/* 文本输入框 */}
          <div className="relative">
            <Input
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              placeholder="或者直接输入你想了解的内容..."
              className="w-full px-4 py-3 pr-12 border border-[#446C73] rounded-xl bg-white/90 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-[#CF6844] focus:border-transparent text-[#414B5C] placeholder-[#446C73]/60"
              disabled={isLoading}
            />
            <button 
              className="absolute right-3 top-1/2 transform -translate-y-1/2 bg-gradient-to-r from-[#446C73] to-[#CF6844] text-white p-2 rounded-lg hover:from-[#414B5C] hover:to-[#CF6844] transition-colors"
              onClick={() => handleAIInteraction()}
              disabled={isLoading}
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* AI Response Display */}
        {isLoading ? (
          <div className="mt-4 p-4 bg-white/80 rounded-lg shadow-sm text-center">
            <p className="text-[#446C73]">正在生成AI回应...</p>
          </div>
        ) : geminiResponse ? (
          <div className="mt-4 p-4 bg-white/80 rounded-lg shadow-sm">
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

        {/* 底部提示 */}
        <div className="mt-6 text-center">
          <p className="text-[#446C73]/70 text-xs">💡 提示：你可以问我关于这件展品的任何问题</p>
        </div>
        {/* 开发者入口 */}
        <div className="mt-4 text-center">
          <Button
            onClick={() => setCurrentScreen("mission-demo")}
            variant="outline"
            className="text-xs text-[#446C73] hover:text-[#414B5C] border-[#446C73]"
          >
            🔧 查看任务引导系统演示
          </Button>
        </div>
      </div>
    </div>
  )

  const renderMissionDemoScreen = () => {
    return (
      <div>
        <MissionDemoPanel />
        {/* Remove the link to collection page */}
        {/* <div className="mt-4 text-center">
          <Button
            onClick={handleNavigateToCollection}
            variant="outline"
            className="text-xs text-[#446C73] hover:text-[#414B5C] border-[#446C73]"
          >
            前往展品收集
          </Button>
        </div> */}
      </div>
    )
  }

  const renderCollectionScreen = () => {
    return <CollectionPage onBack={() => setCurrentScreen('mission-demo')} />
  }

  return (
    <div className="max-w-md mx-auto bg-white min-h-screen">
      {currentScreen === "welcome" && renderWelcomeScreen()}
      {currentScreen === "identity" && renderIdentityScreen()}
      {currentScreen === "conversation" && renderConversationScreen()}
      {currentScreen === "rag-loading" && renderRAGLoadingScreen()}
      {currentScreen === "rag-result" && renderRAGResultScreen()}
      {currentScreen === "mission-demo" && renderMissionDemoScreen()}
      {currentScreen === "collection" && renderCollectionScreen()}
    </div>
  )
}

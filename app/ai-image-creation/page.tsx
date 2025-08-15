"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Sparkles, Download, Share2, Heart, RefreshCw, Save } from "lucide-react"
import { useRouter } from "next/navigation"
import { RECREATION_DATA } from "@/data/recreationData"
import { logEvent } from "@/lib/logEvent"
import OpenAI from 'openai';  // 确保 OpenAI 包已安装

type Screen = "list" | "detail" | "prompt" | "result"

// 配置 OpenAI 客户端，选择一个模型
const openai = new OpenAI({
  apiKey: process.env.ARK_API_KEY || 'd1fe4420-c82e-421a-8259-7e1e6f1fd9b9',  // 默认使用国内模型，替换为 process.env.ARK_API_KEY 或其他
  baseURL: process.env.ARK_BASE_URL || 'https://ark.cn-beijing.volces.com/api/v3',  // 或 'https://api.chatanywhere.tech/v1'
});

// 更新函数以直接使用 OpenAI 客户端生成图片
async function generateImageOnServer(params: { exhibitId: string; prompt: string; title?: string }) {
  try {
    const exhibit = RECREATION_DATA.find(item => item.id === params.exhibitId);  // 尝试读取展品图片或数据
    if (!exhibit) {
      throw new Error("展品未找到");
    }
    const response = await openai.images.generate({
      prompt: `基于展品 ${exhibit.name} 的图片，${params.prompt}`,  // 整合展品数据到提示
      n: 1,
      size: "1024x1024",
    });
    return {
      newTitle: params.title || 'AI 生成图片',
      newImage: response.data?.[0]?.url || '',  // 确保有默认值
    };
  } catch (error) {
    console.error("API 调用失败:", error);
    throw new Error("生成图片失败，请检查 API 密钥和模型配置");
  }
}

export default function AIImageCreation() {
  const router = useRouter()
  const [currentScreen, setCurrentScreen] = useState<Screen>("list")
  const [selectedExhibitId, setSelectedExhibitId] = useState<string | null>(null)
  const [prompt, setPrompt] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedImage, setGeneratedImage] = useState<string | null>(null)
  const [imageTitle, setImageTitle] = useState("")
  const [artworkName, setArtworkName] = useState("")

  const handleBack = () => {
    if (currentScreen === "list") {
      router.push('/mission-demo');  // 确保使用直接路由
    } else if (currentScreen === "detail") {
      setCurrentScreen("list");
    } else if (currentScreen === "prompt") {
      setCurrentScreen("detail");
    } else if (currentScreen === "result") {
      setCurrentScreen("prompt");
    }
  };

  const handleExhibitSelect = (id: string) => {
    setSelectedExhibitId(id);
    setCurrentScreen("detail");
  };

  const handleConfirmExhibit = () => {
    setCurrentScreen("prompt");
  };

  const handleGenerate = async () => {
    if (!prompt.trim() || !selectedExhibitId) return;
    
    setIsGenerating(true);
    try {
      const result = await generateImageOnServer({ exhibitId: selectedExhibitId, prompt, title: artworkName });
      setGeneratedImage(result.newImage || '');  // 确保有默认值
      setImageTitle(result.newTitle);
      setCurrentScreen("result");
      logEvent("ai_image_generated", { data: { exhibitId: selectedExhibitId, prompt, title: artworkName, newImage: result.newImage, newTitle: result.newTitle } });
    } catch (e) {
      console.error(e);
      alert("生成失败，请检查 API 配置");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = () => {
    alert('图片已保存');
    console.log("下载图片");
  };

  const handleShare = () => {
    console.log("分享图片");
  };

  const handleLike = () => {
    console.log("点赞");
  };

  const handleRegenerate = () => {
    setCurrentScreen("prompt");
    setGeneratedImage(null);
    setImageTitle("");
  };

  const handleSaveResult = (result: any) => {
    alert(`已保存作品: ${result.newTitle}`);
    console.log("保存作品", result);
  };

  const renderListScreen = () => (
    <div className="min-h-screen bg-[#F0F2F5]">
      {/* 顶部导航 */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-[#446C73]/20">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Button variant="ghost" onClick={handleBack} className="flex items-center space-x-2 text-[#446C73] hover:text-[#414B5C]">
              <ArrowLeft className="w-4 h-4" />
              <span>返回</span>
            </Button>
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-[#446C73] to-[#CF6844] rounded-lg flex items-center justify-center">
                <div className="w-4 h-2 bg-white rounded-sm"></div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-[#414B5C]">吴文化博物馆</div>
                <div className="text-xs text-[#446C73]">MUSEUM OF WU</div>
              </div>
            </div>
            <div className="w-20"></div>
          </div>
        </div>
      </div>
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-[#414B5C]">选择您想要二创的展品</h1>
        </div>
        <div className="overflow-x-auto whitespace-nowrap pb-4">
          <div className="inline-flex space-x-4">
            {RECREATION_DATA.map((exhibit) => (
              <Card key={exhibit.id} className="w-64 bg-white rounded-lg shadow-md overflow-hidden inline-block" onClick={() => handleExhibitSelect(exhibit.id)}>
                <CardContent className="p-4">
                  <h3 className="text-lg font-semibold text-[#414B5C] mb-1">{exhibit.name}</h3>
                  <p className="text-sm text-gray-500 mb-3">{exhibit.dynasty}</p>
                  <img src={exhibit.pic} alt={exhibit.name} className="w-full h-40 object-cover rounded-md" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderDetailScreen = () => {
    const selectedExhibit = RECREATION_DATA.find(item => item.id === selectedExhibitId)
    if (!selectedExhibit) return <div className="text-center p-6 text-[#414B5C]">展品未找到</div>

    return (
      <div className="min-h-screen bg-[#F0F2F5]">
        {/* 顶部导航 */}
        <div className="bg-white/80 backdrop-blur-sm border-b border-[#446C73]/20">
          <div className="max-w-4xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <Button
                variant="ghost"
                onClick={handleBack}
                className="flex items-center space-x-2 text-[#446C73] hover:text-[#414B5C]"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>返回</span>
              </Button>
              
              {/* 博物馆Logo */}
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-br from-[#446C73] to-[#CF6844] rounded-lg flex items-center justify-center">
                  <div className="w-4 h-2 bg-white rounded-sm"></div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-[#414B5C]">吴文化博物馆</div>
                  <div className="text-xs text-[#446C73]">MUSEUM OF WU</div>
                </div>
              </div>
              
              <div className="w-20"></div> {/* 占位符，保持居中 */}
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-6 py-8">
          <Card className="border-0 shadow-lg bg-white rounded-lg mt-6">
            <CardContent className="p-6">
              <h2 className="text-2xl font-bold text-[#414B5C] mb-2">{selectedExhibit.name}</h2>
              <p className="text-lg text-[#446C73] mb-4">{selectedExhibit.dynasty}</p>
              <p className="text-[#414B5C] text-sm leading-relaxed mb-6">{selectedExhibit.description}</p>
              <img 
                src={selectedExhibit.pic} 
                alt={selectedExhibit.name} 
                className="w-full h-64 object-cover rounded-md mb-6" 
              />
            </CardContent>
          </Card>

          <div className="fixed bottom-0 left-0 right-0 max-w-4xl mx-auto p-6 bg-transparent">
            <Button
              onClick={handleConfirmExhibit}
              className="w-full bg-[#446C73] hover:bg-[#414B5C] text-white font-medium py-3"
            >
              选择此展品
            </Button>
          </div>
        </div>
      </div>
    )
  }

  const renderPromptScreen = () => {
    const selectedExhibit = RECREATION_DATA.find(item => item.id === selectedExhibitId)
    if (!selectedExhibit) return <div className="text-center p-6 text-[#414B5C]">展品未找到</div>

    return (
      <div className="min-h-screen bg-[#F0F2F5]">
        {/* 顶部导航 */}
        <div className="bg-white/80 backdrop-blur-sm border-b border-[#446C73]/20">
          <div className="max-w-4xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <Button
                variant="ghost"
                onClick={handleBack}
                className="flex items-center space-x-2 text-[#446C73] hover:text-[#414B5C]"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>返回</span>
              </Button>
              
              {/* 博物馆Logo */}
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-br from-[#446C73] to-[#CF6844] rounded-lg flex items-center justify-center">
                  <div className="w-4 h-2 bg-white rounded-sm"></div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-[#414B5C]">吴文化博物馆</div>
                  <div className="text-xs text-[#446C73]">MUSEUM OF WU</div>
                </div>
              </div>
              
              <div className="w-20"></div> {/* 占位符，保持居中 */}
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-6 py-8">
          <Card className="border-0 shadow-lg bg-white rounded-lg mb-6">
            <CardContent className="p-6">
              <h2 className="text-2xl font-bold text-[#414B5C] mb-2">{selectedExhibit.name}</h2>
              <p className="text-lg text-[#446C73] mb-4">{selectedExhibit.dynasty}</p>
              <img 
                src={selectedExhibit.pic} 
                alt={selectedExhibit.name} 
                className="w-full h-48 object-cover rounded-md mb-6" 
              />
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-white rounded-lg">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-[#414B5C] mb-4">请输入提示词</h3>
              <Input
                value={artworkName}
                onChange={(e) => setArtworkName(e.target.value)}
                placeholder="为您的作品命名"
                className="mb-4 border-[#446C73] focus:ring-[#CF6844] focus:border-[#CF6844]"
              />
              <Textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="描述想如何调整图片，例如：让这个展品风格变得赛博朋克一点"
                className="min-h-[120px] resize-none border-[#446C73] focus:ring-[#CF6844] focus:border-[#CF6844]"
              />
            </CardContent>
          </Card>

          <div className="fixed bottom-0 left-0 right-0 max-w-4xl mx-auto p-6 bg-transparent">
            <Button
              onClick={handleGenerate}
              disabled={!prompt.trim() || isGenerating}
              className="w-full bg-[#446C73] hover:bg-[#414B5C] text-white font-medium py-3"
            >
              {isGenerating ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>正在生成中...</span>
                </div>
              ) : (
                <span>点击生成</span>
              )}
            </Button>
          </div>
        </div>
      </div>
    )
  }

  const renderResultScreen = () => (
    <div className="min-h-screen bg-[#F0F2F5]">
      {/* 顶部导航 */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-[#446C73]/20">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={handleBack}
              className="flex items-center space-x-2 text-[#446C73] hover:text-[#414B5C]"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>返回</span>
            </Button>
            
            {/* 博物馆Logo */}
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-[#446C73] to-[#CF6844] rounded-lg flex items-center justify-center">
                <div className="w-4 h-2 bg-white rounded-sm"></div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-[#414B5C]">吴文化博物馆</div>
                <div className="text-xs text-[#446C73]">MUSEUM OF WU</div>
              </div>
            </div>
            
            <div className="w-20"></div> {/* 占位符，保持居中 */}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-[#414B5C]">您生成的展品</h2>
        </div>

        <Card className="border-0 shadow-lg bg-white rounded-lg overflow-hidden">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-[#414B5C] mb-4">{artworkName || 'AI艺术品'}</h3>
            {generatedImage && (
              <img 
                src={generatedImage} 
                alt={artworkName || 'AI生成的艺术品'} 
                className="w-full h-64 object-cover rounded-md mb-6" 
              />
            )}
            <div className="flex space-x-4 mt-4">
              <Button
                onClick={handleRegenerate}
                variant="outline"
                className="flex-1 flex items-center justify-center space-x-2 border-[#446C73] text-[#446C73] hover:bg-[#D8E3E2]"
              >
                <RefreshCw className="w-4 h-4" />
                <span>再次生成</span>
              </Button>
              <Button
                onClick={handleDownload}
                className="flex-1 flex items-center justify-center space-x-2 bg-[#446C73] hover:bg-[#414B5C] text-white"
              >
                <Save className="w-4 h-4" />
                <span>保存图片</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )

  return (
    <>
      {currentScreen === "list" && renderListScreen()}
      {currentScreen === "detail" && renderDetailScreen()}
      {currentScreen === "prompt" && renderPromptScreen()}
      {currentScreen === "result" && renderResultScreen()}
    </>
  )
} 
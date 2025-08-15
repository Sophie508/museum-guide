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

type Screen = "list" | "detail" | "prompt" | "result"

// 调用后端接口进行AI图片生成（已支持占位上游API）
async function generateImageOnServer(params: { exhibitId: string; prompt: string; title?: string }) {
  const res = await fetch("/api/ai/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ exhibitId: params.exhibitId, prompt: params.prompt, title: params.title }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || "生成失败");
  }
  return (await res.json()) as { newTitle: string; newImage: string };
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
      router.push('/?screen=mission-demo')
    } else if (currentScreen === "detail") {
      setCurrentScreen("list")
    } else if (currentScreen === "prompt") {
      setCurrentScreen("detail")
    } else if (currentScreen === "result") {
      setCurrentScreen("prompt")
    }
  }

  const handleExhibitSelect = (id: string) => {
    setSelectedExhibitId(id)
    setCurrentScreen("detail")
  }

  const handleConfirmExhibit = () => {
    setCurrentScreen("prompt")
  }

  const handleGenerate = async () => {
    if (!prompt.trim() || !selectedExhibitId) return
    
    setIsGenerating(true)
    try {
      const result = await generateImageOnServer({ exhibitId: selectedExhibitId, prompt, title: artworkName })
      setGeneratedImage(result.newImage)
      setImageTitle(result.newTitle)
      setCurrentScreen("result")
      logEvent("ai_image_generated", { data: { exhibitId: selectedExhibitId, prompt, title: artworkName, newImage: result.newImage, newTitle: result.newTitle } })
    } catch (e) {
      console.error(e)
      alert("生成失败，请稍后重试")
    } finally {
      setIsGenerating(false)
    }
  }

  const handleDownload = () => {
    // Simulate downloading image
    alert('图片已保存')
    console.log("下载图片")
  }

  const handleShare = () => {
    // Share logic placeholder
    console.log("分享图片")
  }

  const handleLike = () => {
    // Like logic placeholder
    console.log("点赞")
  }

  const handleRegenerate = () => {
    setCurrentScreen("prompt")
    setGeneratedImage(null)
    setImageTitle("")
  }

  const handleSaveResult = (result: any) => {
    // Simulate saving result
    alert(`已保存作品: ${result.newTitle}`);
    console.log("保存作品", result);
  };

  const renderListScreen = () => (
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
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-[#414B5C]">选择您想要二创的展品</h1>
        </div>

        {/* 水平滚动的展品列表 */}
        <div className="overflow-x-auto whitespace-nowrap pb-4">
          <div className="inline-flex space-x-4">
            {RECREATION_DATA.map((exhibit) => (
              <Card 
                key={exhibit.id} 
                className="w-64 bg-white rounded-lg shadow-md overflow-hidden inline-block"
                onClick={() => handleExhibitSelect(exhibit.id)}
              >
                <CardContent className="p-4">
                  <h3 className="text-lg font-semibold text-[#414B5C] mb-1">{exhibit.name}</h3>
                  <p className="text-sm text-gray-500 mb-3">{exhibit.dynasty}</p>
                  <img 
                    src={exhibit.pic} 
                    alt={exhibit.name} 
                    className="w-full h-40 object-cover rounded-md" 
                  />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  )

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
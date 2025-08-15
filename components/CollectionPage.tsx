"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowLeft } from "lucide-react"
import { logEvent } from "@/lib/logEvent"

interface CollectionPageProps {
  onBack: () => void
}

export default function CollectionPage({ onBack }: CollectionPageProps) {
  const [currentItemIndex, setCurrentItemIndex] = useState(0)
  const [unlockedItems, setUnlockedItems] = useState<Set<number>>(() => {
    // 从localStorage读取已解锁的展品
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('unlockedItems')
      return saved ? new Set(JSON.parse(saved)) : new Set()
    }
    return new Set()
  })
  const [inputValue, setInputValue] = useState("")
  const [showOverlay, setShowOverlay] = useState(false)
  const [codeInput, setCodeInput] = useState(["", "", ""])
  const [isCodeCorrect, setIsCodeCorrect] = useState(false)

  const items = [
    {
      id: 1,
      title: "双鸾瑞兽纹铜镜",
      dynasty: "唐",
      image: "https://static.wuzhongmuseum.com/uploads/images/2020/06/12/UtHFWEiGle.jpg",
      code: ["A", "0", "1"],
      description: "铜镜是以铜锡合金为原料铸造，镜面光素用以照容，镜背装饰花纹或铭文。该镜呈八瓣菱花形，镜背分三层纹饰布局，镜背中央伏卧一兽，腹下有一孔，形成镜纽。内切圆将纹饰分为内外两区，外区分饰八组飞鸟、蝴蝶和花草纹，内区饰双鸾双兽，间饰缠枝莲纹。鸾鸟瑞兽纹铜镜是盛唐时期最流行的镜类，从纪年镜的资料中可知，大约成镜于武则天长寿年间，菱花镜也始铸于这一时期。此镜中鸾鸟、瑞兽和花鸟线条简练流畅，鸟羽细腻分明，是唐镜中的精品。"
    },
    {
      id: 2,
      title: "釉里红云龙纹盖罐",
      dynasty: "元",
      origin: "通安华山出土",
      image: "https://static.wuzhongmuseum.com/uploads/images/2020/05/08/nYWcSQEMhA.jpg",
      code: ["B", "0", "2"],
      description: "这件龙纹盖罐直口短颈，丰肩鼓腹，胫部微收，带有底面旋挖而成的假圈足，足端面宽平。盖部有宝珠形纽，盖设里外两口，便于密封。以盖纽为中心施有对称的锦葵花叶一周，纽基部及盖外边缘都施釉里红，花叶上也散涂铜红呈色剂。腹部浅刻盘龙两条，组成主体纹饰。该罐在构图艺术上极有特色，罐表以盘曲升腾的白龙为主体纹饰，龙体上下之间的空白处以艳红的呈色衬托，似为飘动的彩云。两条白龙蜿蜒升腾在片片红云之中，红云白龙，相得益彰，以强烈的色调对比，烘托白龙在红云中升腾的动态美。整器造型端庄，胎白质坚，装饰别致，呈色艳丽，极为难得，是国内外罕见的早期釉里红瓷器。"
    },
    {
      id: 3,
      title: "青花束莲纹盘",
      dynasty: "明宣德时期",
      image: "https://777a-wzmuse-4gcvvt77cf4e3c3e-1312543314.tcb.qcloud.la/admin-uploads/d6b23bdd639acd7d0018a893072234ab/2024-05-30/30d62d54e6984c79be42343944581e78.jpeg?color=%23426bbc&hash=U49aEat500xvMxRjt7j%5B00tR_4M%7BtSofRiWB&height=1179&width=1766",
      code: ["C", "0", "3"],
      description: "此器为明宣德时期景德镇官窑所出。形制为圆唇，敞口，浅弧壁，圈足，平底，沿袭了元末明初的式样。盘心绘一束莲主题纹饰，内外口沿下饰卷草纹，内外壁绘缠枝牡丹菊花纹。使用的青料为进口钴料\"苏渤泥青\"，青花色泽浓艳，并夹有闪烁着金属光泽的黑色斑点，即铁锈斑。局部由于用料过浓或温度过高，青花晕散，具有较强的质感。整器硕大，造型规整，以束莲纹为主体纹样，构图简洁，主题鲜明，且发色浓艳，属明宣德官窑器中的精品。"
    },
    {
      id: 4,
      title: "青瓷扁壶",
      dynasty: "魏晋南北朝",
      origin: "枫桥狮子山一号墓出土",
      image: "https://static.wuzhongmuseum.com/uploads/images/2020/05/08/EVZEbZOEvb.jpg",
      code: ["D", "0", "4"],
      description: "扁壶是一种水器。此壶器身扁圆形，方唇直口，饰凹弦纹一道，肩部以圆圈和菱形组成装饰带。前、后腹面以圆圈环带联成鸡心状，并贴塑铺首衔环各一个。肩部左右有一系，腹部各有系二。椭圆形高圈足，外撇。表面施茶绿色透明釉，圈足底内不施釉，露胎处呈褐红色。 此壶1976年出土于枫桥狮子山一号墓，同墓伴出有\"元康五年七月十八日\"纪年砖，是一件有绝对纪年可考的器物。这件扁壶形体浑厚，釉色滋润，装饰精细，制作精湛，作为有绝对纪年的断代标准器，历史、艺术、文物价值极高。"
    },
    {
      id: 5,
      title: "至正乙酉朱碧山造银槎杯",
      dynasty: "元",
      image: "https://static.wuzhongmuseum.com/uploads/images/2020/05/08/DAljGaUNFh.jpg",
      code: ["E", "0", "5"],
      description: "此器以仙人乘槎凌空飞越到达银河的神话故事为题材，将银酒杯巧制成树槎形的一叶扁舟，有一老人背靠槎尾而坐。槎背部有细瘦阴刻铭文\"至正乙酉朱碧山造\"，为元代银工朱碧山制作。 这件作品设计精巧，造型奇特，在制作工艺上成功地运用了镂刻、焊等多种技法，结合圆雕、浮雕工艺将人与舟、舟与云气、人与槎树间的层次交待得既简练清晰又融为一体。人物镂刻生动逼真，面部丰颐宽额，隆准凤目，飘动的长须根根分明，细腻而流畅，达到了完美的艺术效果，属难得的工艺珍品。"
    }
  ]

  const currentItem = items[currentItemIndex]
  const isCurrentItemUnlocked = unlockedItems.has(currentItemIndex)

  // 保存解锁状态到localStorage
  const saveUnlockedItems = (newUnlockedItems: Set<number>) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('unlockedItems', JSON.stringify(Array.from(newUnlockedItems)))
    }
  }

  const handleCodeInput = (index: number, value: string) => {
    if (value.length > 1) return
    
    const newCode = [...codeInput]
    newCode[index] = value.toUpperCase()
    setCodeInput(newCode)
    
    // 检查是否输入完整且正确
    if (newCode.every((char, i) => char === currentItem.code[i])) {
      setIsCodeCorrect(true)
      setTimeout(() => {
        setShowOverlay(false)
        const newUnlockedItems = new Set([...unlockedItems, currentItemIndex])
        setUnlockedItems(newUnlockedItems)
        saveUnlockedItems(newUnlockedItems)
          logEvent("collection_unlocked", { data: { itemId: currentItem.id, title: currentItem.title } })
        setCodeInput(["", "", ""])
        setIsCodeCorrect(false)
      }, 1000)
    }
  }

  // 当切换展品时重置输入框
  useEffect(() => {
    setCodeInput(["", "", ""])
    setIsCodeCorrect(false)
  }, [currentItemIndex])

  return (
    <div className="min-h-screen relative" style={{ backgroundColor: "#EDF0ED" }}>
      {/* 顶部标题栏 */}
      <div className="flex items-center justify-between p-6 pt-12">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={onBack}
            className="flex items-center space-x-2 border-[#446C73] text-[#446C73] hover:bg-[#D8E3E2]"
          >
            <ArrowLeft className="w-4 h-4" />
            返回
          </Button>
          <img src="/placeholder-logo.svg" alt="Check" className="w-6 h-6" />
          <span className="text-xl font-medium text-gray-800">展品收集 ({unlockedItems.size}/{items.length})</span>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => {
              setUnlockedItems(new Set())
              saveUnlockedItems(new Set())
            }}
            className="p-2 text-xs text-gray-500 hover:text-gray-700 transition-colors"
            title="重置进度"
          >
            <img src="/placeholder.svg" alt="Reset" className="w-5 h-5" />
          </button>
          <button onClick={onBack} className="p-2">
            <img src="/placeholder.svg" alt="Back" className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* 进度条 */}
      <div className="flex justify-center gap-3 px-6 mb-8">
        {items.map((_, index) => (
          <div
            key={index}
            className="w-16 h-3 rounded-full"
            style={{
              backgroundColor: index === currentItemIndex ? "#446C73" : "#D8E3E2"
            }}
          />
        ))}
      </div>

      {/* 展品卡片 */}
      <div className="px-6 mb-8 relative">
        {/* 左右切换箭头 */}
        <button 
          className="absolute left-0 top-1/2 transform -translate-y-1/2 z-10 p-3"
          onClick={() => setCurrentItemIndex(prev => prev > 0 ? prev - 1 : items.length - 1)}
        >
          <img src="/placeholder.svg" alt="Previous" className="w-6 h-6" />
        </button>
        <button 
          className="absolute right-0 top-1/2 transform -translate-y-1/2 z-10 p-3"
          onClick={() => setCurrentItemIndex(prev => prev < items.length - 1 ? prev + 1 : 0)}
        >
          <img src="/placeholder.svg" alt="Next" className="w-6 h-6" />
        </button>
        
        <Card className="bg-white rounded-3xl shadow-lg overflow-hidden">
          <CardContent className="p-6">
            <h2 className="text-2xl font-bold text-center mb-2" style={{ color: "#446C73" }}>
              {currentItem.title}
            </h2>
            <p className="text-lg text-gray-600 text-center mb-6">{currentItem.dynasty}</p>
            {currentItem.origin && (
              <p className="text-sm text-gray-500 text-center mb-6">{currentItem.origin}</p>
            )}
            
            {isCurrentItemUnlocked && (
              <div className="mb-6 p-4 bg-gray-50 rounded-2xl">
                <p className="text-sm text-gray-700 leading-relaxed">
                  {currentItem.description}
                </p>
              </div>
            )}
            
            <div className="relative">
              <img 
                src={currentItem.image} 
                alt={currentItem.title} 
                className="w-full h-80 object-cover rounded-2xl"
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 解锁/讲解按钮 */}
      <div className="px-6 mb-6">
        <Button
          onClick={isCurrentItemUnlocked ? undefined : () => setShowOverlay(true)}
          className="w-full h-12 rounded-2xl text-white font-medium flex items-center justify-center gap-3"
          style={{ backgroundColor: "#446C73" }}
        >
          <img src="/placeholder.svg" alt="Action" className="w-5 h-5" />
          {isCurrentItemUnlocked ? "前往智能讲解界面" : "找到并输入展品编号以解锁更多信息"}
        </Button>
      </div>

      {/* 底部按钮 */}
      <div className="px-6 mb-4">
        <div className="flex gap-4">
          <Button 
            variant="outline" 
            className="flex-1 h-12 bg-white border-gray-200 text-gray-700 rounded-2xl flex items-center justify-center gap-2"
          >
            <img src="/placeholder.svg" alt="Select" className="w-5 h-5" />
            选择展品
          </Button>
          <Button 
            variant="outline" 
            className="flex-1 h-12 bg-white border-gray-200 text-gray-700 rounded-2xl flex items-center justify-center gap-2"
          >
            <img src="/placeholder.svg" alt="Help" className="w-5 h-5" />
            帮助
          </Button>
        </div>
      </div>

      {/* 底部输入框 */}
      <div className="px-6 mb-20">
        <div className="relative">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="输入消息..."
            className="w-full h-12 px-4 pr-12 rounded-2xl border border-gray-200 bg-white text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button className="absolute right-3 top-1/2 transform -translate-y-1/2 p-2">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M2 21L23 12L2 3V10L17 12L2 14V21Z" fill="#446C73"/>
            </svg>
          </button>
        </div>
      </div>

      {/* 编号输入 Overlay */}
      {showOverlay && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end justify-center z-50">
          <div 
            className="w-full max-w-sm mx-auto animate-slide-up"
            style={{
              width: "393px",
              height: "407px",
              borderRadius: "40px 40px 0 0",
              backgroundColor: "#EDF0ED"
            }}
          >
            <div className="p-8 h-full flex flex-col">
              {/* 顶部拖拽指示器 - 可点击关闭 */}
              <div 
                className="w-12 h-1 bg-gray-300 rounded-full mx-auto mb-8 cursor-pointer hover:bg-gray-400 transition-colors"
                onClick={() => setShowOverlay(false)}
              ></div>
              
              {/* Overlay 内容 */}
              <div className="flex-1 flex flex-col justify-center items-center">
                <div className="text-center w-full">
                  <h3 className="text-xl font-medium mb-2 text-gray-800">
                    请输入展品编码
                  </h3>
                  <p className="text-gray-600 mb-12">
                    (展柜 • 展品)
                  </p>
                  
                  {/* 编号输入框 */}
                  <div className="flex items-center justify-center mb-8">
                    <input
                      type="text"
                      value={codeInput[0]}
                      onChange={(e) => handleCodeInput(0, e.target.value)}
                      className="w-16 h-16 text-center text-2xl font-medium border-2 border-gray-300 rounded-2xl bg-white focus:outline-none focus:border-gray-500"
                      maxLength={1}
                      style={{ color: "#446C73" }}
                    />
                    <span className="mx-3 text-2xl text-gray-400">•</span>
                    <input
                      type="text"
                      value={codeInput[1]}
                      onChange={(e) => handleCodeInput(1, e.target.value)}
                      className="w-16 h-16 text-center text-2xl font-medium border-2 border-gray-300 rounded-2xl bg-white focus:outline-none focus:border-gray-500"
                      maxLength={1}
                      style={{ color: "#446C73" }}
                    />
                    <span className="mx-3 text-2xl text-gray-400">•</span>
                    <input
                      type="text"
                      value={codeInput[2]}
                      onChange={(e) => handleCodeInput(2, e.target.value)}
                      className="w-16 h-16 text-center text-2xl font-medium border-2 border-gray-300 rounded-2xl bg-white focus:outline-none focus:border-gray-500"
                      maxLength={1}
                      style={{ color: "#446C73" }}
                    />
                    
                    {/* 确认按钮 */}
                    <button 
                      className="w-12 h-12 rounded-full flex items-center justify-center ml-6"
                      style={{ backgroundColor: "#446C73" }}
                      onClick={() => {
                        if (codeInput.every((char, i) => char === currentItem.code[i])) {
                          setIsCodeCorrect(true)
                          setTimeout(() => {
                            setShowOverlay(false)
                            const newUnlockedItems = new Set([...unlockedItems, currentItemIndex])
                            setUnlockedItems(newUnlockedItems)
                            saveUnlockedItems(newUnlockedItems)
                          }, 1000)
                        }
                      }}
                    >
                      <img src="/placeholder.svg" alt="Confirm" className="w-6 h-6" />
                    </button>
                  </div>
                  
                  {isCodeCorrect && (
                    <p className="text-green-600 text-sm">验证成功！</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes slide-up {
          from {
            transform: translateY(100%);
          }
          to {
            transform: translateY(0);
          }
        }
        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
      `}</style>
    </div>
  )
} 
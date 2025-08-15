"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MessageCircle, Star, HelpCircle, Wand2 } from "lucide-react"
import { useRouter } from 'next/navigation';

interface MissionCardProps {
  type: "social" | "collection" | "quiz" | "creation"
  identity: "explorer" | "facilitator" | "expert" | "experiencer" | "charger"
  content: string
  onAccept?: () => void
  onDefer?: () => void
  className?: string
}

const missionConfig = {
  social: {
    icon: MessageCircle,
    title: "任务引导：留言互动",
    color: "from-[#446C73] to-[#CF6844]",
    bgColor: "from-[#D8E3E2] to-[#EDFOED]",
    path: ""
  },
  collection: {
    icon: Star,
    title: "任务引导：展品收集",
    color: "from-[#446C73] to-[#CF6844]",
    bgColor: "from-[#D8E3E2] to-[#EDFOED]",
    path: "/collection"
  },
  quiz: {
    icon: HelpCircle,
    title: "任务引导：知识测验",
    color: "from-[#446C73] to-[#CF6844]",
    bgColor: "from-[#D8E3E2] to-[#EDFOED]",
    path: "/quiz"
  },
  creation: {
    icon: Wand2,
    title: "任务引导：AI生图二创",
    color: "from-[#446C73] to-[#CF6844]",
    bgColor: "from-[#D8E3E2] to-[#EDFOED]",
    path: ""
  },
}

export function MissionCard({ type, identity, content, onAccept, onDefer, className = "" }: MissionCardProps) {
  const router = useRouter();
  const config = missionConfig[type]
  const Icon = config.icon

  const handleNavigate = () => {
    if (config.path) {
      router.push(config.path);
    }
  };

  return (
    <div className={`w-full max-w-sm mx-auto ${className}`}>
      {/* 滑入动画容器 */}
      <div className="animate-in slide-in-from-bottom-4 duration-500">
        <Card className={`border-0 shadow-xl bg-gradient-to-br ${config.bgColor} backdrop-blur-sm overflow-hidden`}>
          {/* 任务标题 */}
          <div className={`bg-gradient-to-r ${config.color} px-4 py-3`}>
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                <Icon className="w-4 h-4 text-white" />
              </div>
              <h3 className="text-white font-semibold text-sm">{config.title}</h3>
            </div>
          </div>

          {/* 个性化内容 */}
          <CardContent className="p-4">
            <div className="mb-4">
              <p className="text-[#414B5C] text-sm leading-relaxed">{content}</p>
            </div>

            {/* 行动按钮 */}
            <div className="flex space-x-3">
              <Button
                onClick={onAccept}
                className={`flex-1 bg-gradient-to-r ${config.color} hover:opacity-90 text-white py-2 rounded-lg text-sm font-medium`}
              >
                立即前往
              </Button>
              <Button
                onClick={onDefer}
                variant="outline"
                className="flex-1 border-[#446C73] text-[#446C73] hover:bg-[#D8E3E2] py-2 rounded-lg text-sm bg-transparent"
              >
                稍后提醒我
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

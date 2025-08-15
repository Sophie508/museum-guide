"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowLeft } from "lucide-react"
import { EXPO_DATA } from "@/data/expoData"

export default function ExhibitListPage() {
  const router = useRouter()

  const handleExhibitClick = (id: string) => {
    router.push(`/message-interaction/${id}`)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#EDFOED] to-[#D8E3E2] p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Navigation Header */}
        <div className="flex items-center justify-between bg-white/80 backdrop-blur-sm p-4 rounded-lg shadow-sm border border-[#446C73]/20">
          <Button
            variant="outline"
            onClick={() => router.push('/?screen=mission-demo')} // Navigate to the root route with a query parameter to return to the mission demo screen
            className="flex items-center space-x-2 border-[#446C73] text-[#446C73] hover:bg-[#D8E3E2]"
          >
            <ArrowLeft className="w-4 h-4" />
            返回
          </Button>
          <h1 className="text-xl font-bold text-[#414B5C]">展品选择</h1>
        </div>

        {/* Guidance Text */}
        <div className="text-center text-[#414B5C] text-lg mb-6">
          点击你眼前的展品，看看大家都在讨论什么？
        </div>

        {/* Exhibit List */}
        <div className="space-y-6">
          {EXPO_DATA.map((item) => (
            <Card 
              key={item.id} 
              className="border-0 shadow-lg bg-white/80 backdrop-blur-sm overflow-hidden cursor-pointer hover:shadow-xl transition-shadow"
              onClick={() => handleExhibitClick(item.id)}
            >
              <CardContent className="p-0">
                <div className="relative h-48 bg-[#D8E3E2] overflow-hidden">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3">
                    <h3 className="text-white font-bold text-lg">{item.name}</h3>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
} 
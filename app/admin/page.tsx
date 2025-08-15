"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Download } from "lucide-react";

export default function AdminPage() {
  const router = useRouter();
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await fetch("/api/events");
        if (!response.ok) throw new Error("Failed to fetch events");
        const data = await response.json();
        setEvents(data.events);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching events:", error);
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  const handleExport = () => {
    const jsonString = JSON.stringify(events, null, 2);
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `museum_events_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#EDFOED] to-[#D8E3E2]">加载中...</div>;
  }

  const userSessions = Array.from(new Set(events.map(e => e.sessionId)));
  const totalEvents = events.length;
  const eventTypes = Array.from(new Set(events.map(e => e.type))).sort();
  const quizCompletions = events.filter(e => e.type === "quiz_complete");
  const aiImages = events.filter(e => e.type === "ai_image_generated");
  const averageQuizScore = quizCompletions.length > 0 ? 
    (quizCompletions.reduce((sum, e) => sum + (e.data?.score || 0), 0) / quizCompletions.length).toFixed(2) : 
    "暂无数据";

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#EDFOED] to-[#D8E3E2] p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between bg-white/80 backdrop-blur-sm p-4 rounded-lg shadow-sm border border-[#446C73]/20">
          <Button
            variant="outline"
            onClick={() => router.push('/?screen=mission-demo')}
            className="flex items-center space-x-2 border-[#446C73] text-[#446C73] hover:bg-[#D8E3E2]"
          >
            <ArrowLeft className="w-4 h-4" />
            返回
          </Button>
          <h1 className="text-xl font-bold text-[#414B5C]">吴文化博物馆管理后台</h1>
        </div>

        <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-[#414B5C]">数据概览</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-[#D8E3E2] rounded-lg">
                <p className="text-sm text-[#446C73]">用户会话数</p>
                <p className="text-2xl font-bold text-[#414B5C]">{userSessions.length}</p>
              </div>
              <div className="p-4 bg-[#D8E3E2] rounded-lg">
                <p className="text-sm text-[#446C73]">总交互事件</p>
                <p className="text-2xl font-bold text-[#414B5C]">{totalEvents}</p>
              </div>
              <div className="p-4 bg-[#D8E3E2] rounded-lg">
                <p className="text-sm text-[#446C73]">事件类型数</p>
                <p className="text-2xl font-bold text-[#414B5C]">{eventTypes.length}</p>
              </div>
              <div className="p-4 bg-[#D8E3E2] rounded-lg">
                <p className="text-sm text-[#446C73]">测验完成次数</p>
                <p className="text-2xl font-bold text-[#414B5C]">{quizCompletions.length}</p>
              </div>
              <div className="p-4 bg-[#D8E3E2] rounded-lg">
                <p className="text-sm text-[#446C73]">平均测验得分</p>
                <p className="text-2xl font-bold text-[#414B5C]">{averageQuizScore}</p>
              </div>
              <div className="p-4 bg-[#D8E3E2] rounded-lg">
                <p className="text-sm text-[#446C73]">AI生成图片数</p>
                <p className="text-2xl font-bold text-[#414B5C]">{aiImages.length}</p>
              </div>
            </div>
            <div className="mt-4">
              <Button
                onClick={handleExport}
                className="bg-gradient-to-r from-[#446C73] to-[#CF6844] hover:from-[#414B5C] hover:to-[#CF6844] text-white"
              >
                <Download className="w-4 h-4 mr-2" />
                导出JSON数据
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-[#414B5C]">用户交互事件</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {events.length === 0 ? (
              <p className="text-center text-[#446C73]">暂无数据</p>
            ) : (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {events.slice(-50).reverse().map((event: any) => (
                  <div key={event.id} className="p-3 bg-gray-50 rounded-lg border border-[#446C73]/10">
                    <div className="flex justify-between items-start mb-1">
                      <span className="font-medium text-[#414B5C] text-sm">{event.type}</span>
                      <span className="text-xs text-[#446C73]">{new Date(event.timestamp).toLocaleTimeString()}</span>
                    </div>
                    <div className="text-xs text-[#446C73]">
                      会话: {event.sessionId?.slice(-8)}
                    </div>
                    {event.user && (
                      <div className="text-xs text-[#446C73] mt-1">
                        用户: {event.user.nickname || '未知'} {event.user.identity ? `(${event.user.identity})` : ''}
                      </div>
                    )}
                    {event.data && Object.keys(event.data).length > 0 && (
                      <pre className="text-xs text-[#414B5C] mt-1 overflow-x-auto">
                        {JSON.stringify(event.data, null, 2)}
                      </pre>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-[#414B5C]">AI生成图片</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {aiImages.length === 0 ? (
              <p className="text-center text-[#446C73]">暂无AI生成图片</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
                {aiImages.slice(-10).reverse().map((event: any) => (
                  <div key={event.id} className="p-3 bg-gray-50 rounded-lg border border-[#446C73]/10">
                    <img src={event.data.newImage} alt="AI Generated" className="w-full h-40 object-cover rounded-md mb-2" />
                    <p className="text-sm font-medium text-[#414B5C]">{event.data.newTitle}</p>
                    <p className="text-xs text-[#446C73]">提示词: {event.data.prompt}</p>
                    <p className="text-xs text-[#446C73]">展品ID: {event.data.exhibitId}</p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

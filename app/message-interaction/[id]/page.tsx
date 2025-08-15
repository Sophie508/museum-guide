"use client"

import { useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ArrowLeft, Heart, MessageSquare, Send, ChevronDown, ChevronUp } from "lucide-react"
import { EXPO_DATA } from "@/data/expoData"
import { logEvent } from "@/lib/logEvent"

type Comment = {
  id: string
  user: { name: string; avatar?: string }
  text: string
  likes: number
  replies: Comment[]
}

type Exhibit = {
  id: string
  name: string
  image: string
  topic: {
    question: string
    description: string
  }
  comments: Comment[]
}

export default function ExhibitDetailPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string
  const exhibit = EXPO_DATA.find(item => item.id === id) as Exhibit
  const [comments, setComments] = useState<Comment[]>(exhibit?.comments || [])
  const [newComment, setNewComment] = useState("")
  const [replyTo, setReplyTo] = useState<string | null>(null)
  const [replyContent, setReplyContent] = useState("")
  const [expandedReplies, setExpandedReplies] = useState<Record<string, boolean>>({})
  const [likedComments, setLikedComments] = useState<Record<string, boolean>>({})

  if (!exhibit) {
    return <div className="text-center p-6 text-[#414B5C]">展品未找到</div>
  }

  const handleLike = (commentId: string, isReply: boolean = false, parentId?: string) => {
    setLikedComments(prev => ({
      ...prev,
      [commentId]: !prev[commentId]
    }));
    setComments(comments.map(comment => {
      if (isReply && parentId && comment.id === parentId) {
        return {
          ...comment,
          replies: comment.replies.map(reply => {
            if (reply.id === commentId) {
              return {
                ...reply,
                likes: likedComments[commentId] ? reply.likes - 1 : reply.likes + 1
              }
            }
            return reply
          })
        }
      } else if (!isReply && comment.id === commentId) {
        return {
          ...comment,
          likes: likedComments[commentId] ? comment.likes - 1 : comment.likes + 1
        }
      }
      return comment
    }));
    logEvent("message_like", { data: { commentId, isReply, parentId } })
  }

  const toggleReplies = (commentId: string) => {
    setExpandedReplies(prev => ({
      ...prev,
      [commentId]: !prev[commentId]
    }));
  }

  const handlePostComment = () => {
    if (!newComment.trim()) return

    const comment: Comment = {
      id: `comment_${Date.now()}`,
      user: { name: "当前用户", avatar: "游" },
      text: newComment,
      likes: 0,
      replies: []
    }

    setComments([comment, ...comments])
    setNewComment("")
    logEvent("message_post", { data: { exhibitId: id, text: comment.text } })
  }

  const handlePostReply = (parentId: string) => {
    if (!replyContent.trim() || replyTo === null) return

    const reply: Comment = {
      id: `reply_${Date.now()}`,
      user: { name: "当前用户", avatar: "游" },
      text: replyContent,
      likes: 0,
      replies: []
    }

    setComments(comments.map(comment => {
      if (comment.id === parentId) {
        return { ...comment, replies: [...comment.replies, reply] }
      }
      return comment
    })) 
    setReplyContent("")
    setReplyTo(null)
    logEvent("message_reply", { data: { exhibitId: id, parentId, text: reply.text } })
  }

  const renderComment = (comment: Comment, isReply: boolean = false, parentId?: string) => (
    <div key={comment.id} className={`py-3 ${isReply ? 'ml-6 border-l-2 border-[#446C73]/30' : 'border-b border-[#446C73]/20'}`}>
      <div className="flex items-start space-x-3 mb-2">
        <div className="w-8 h-8 bg-[#446C73] rounded-full flex items-center justify-center text-white font-medium text-sm flex-shrink-0">
          {comment.user.avatar || comment.user.name.charAt(0)}
        </div>
        <div className="flex-1">
          <div className="flex justify-between items-start">
            <span className="font-medium text-[#414B5C] text-sm">{comment.user.name}</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleLike(comment.id, isReply, parentId)}
              className="text-[#446C73] hover:text-[#CF6844] p-0"
            >
              <Heart className={`w-4 h-4 mr-1 ${likedComments[comment.id] ? 'fill-[#CF6844] text-[#CF6844]' : ''}`} />
              {comment.likes > 0 && <span className="text-xs">{comment.likes}</span>}
            </Button>
          </div>
          <p className="text-[#414B5C] text-sm mt-1">{comment.text}</p>
          {!isReply && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setReplyTo(comment.id)}
              className="text-[#446C73] hover:text-[#414B5C] text-xs p-1 mt-1"
            >
              <MessageSquare className="w-3 h-3 mr-1" />
              回复
            </Button>
          )}
        </div>
      </div>
      {replyTo === comment.id && (
        <div className="mt-2 flex gap-2 ml-11">
          <Input
            value={replyContent}
            onChange={(e) => setReplyContent(e.target.value)}
            placeholder="写下你的回复..."
            className="flex-1 border-[#446C73] focus:ring-[#CF6844] focus:border-[#CF6844]"
          />
          <Button
            size="sm"
            onClick={() => handlePostReply(comment.id)}
            className="bg-gradient-to-r from-[#446C73] to-[#CF6844] hover:from-[#414B5C] hover:to-[#CF6844] text-white"
          >
            <Send className="w-3 h-3 mr-1" />
            发送
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              setReplyTo(null)
              setReplyContent("")
            }}
            className="border-[#446C73] text-[#446C73]"
          >
            取消
          </Button>
        </div>
      )}
      {comment.replies.length > 0 && (
        <>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => toggleReplies(comment.id)}
            className="text-[#446C73] text-xs p-1 ml-11 mt-1"
          >
            {expandedReplies[comment.id] ? <ChevronUp className="w-3 h-3 mr-1" /> : <ChevronDown className="w-3 h-3 mr-1" />}
            {comment.replies.length}条回复
          </Button>
          {expandedReplies[comment.id] && (
            <div className="mt-2 space-y-2">
              {comment.replies.map(reply => renderComment(reply, true, comment.id))}
            </div>
          )}
        </>
      )}
    </div>
  )

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#EDFOED] to-[#D8E3E2] p-6">
      <div className="max-w-4xl mx-auto space-y-0">
        {/* Navigation Header */}
        <div className="flex items-center justify-between bg-white/80 backdrop-blur-sm p-4 rounded-lg shadow-sm border border-[#446C73]/20 mb-4">
          <Button
            variant="outline"
            onClick={() => router.push('/message-interaction')}
            className="flex items-center space-x-2 border-[#446C73] text-[#446C73] hover:bg-[#D8E3E2]"
          >
            <ArrowLeft className="w-4 h-4" />
            返回
          </Button>
          <h1 className="text-xl font-bold text-[#414B5C]">{exhibit.name}</h1>
        </div>

        {/* Exhibit Image */}
        <div className="relative h-64 bg-[#D8E3E2] rounded-md overflow-hidden mb-4">
          <img
            src={exhibit.image}
            alt={exhibit.name}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Content Area */}
        <Card className="border-0 shadow-lg bg-white rounded-t-3xl overflow-hidden pt-6">
          <CardContent className="p-6 space-y-6">
            {/* Topic Focus Section */}
            <div className="space-y-3">
              <h2 className="text-lg font-semibold text-[#414B5C]">观点聚焦</h2>
              <h3 className="text-xl font-bold text-[#414B5C]">{exhibit.topic.question}</h3>
              <p className="text-[#414B5C] text-sm leading-relaxed">{exhibit.topic.description}</p>
            </div>

            {/* Comments Section */}
            <div className="space-y-3">
              <h2 className="text-lg font-semibold text-[#414B5C]">留言区</h2>
              <div className="space-y-2">
                {comments.map(comment => renderComment(comment))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Fixed Comment Input Bar */}
        <div className="fixed bottom-4 left-0 right-0 max-w-4xl mx-auto px-6">
          <div className="flex items-center bg-white/90 backdrop-blur-sm p-3 rounded-lg shadow-md border border-[#446C73]/20">
            <div className="w-8 h-8 bg-[#446C73] rounded-full flex items-center justify-center text-white font-medium text-sm flex-shrink-0 mr-3">
              游
            </div>
            <Input
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="你的观点值得被看到"
              className="flex-1 border-0 focus:ring-0 focus:border-0"
            />
            <Button
              variant="ghost"
              size="sm"
              onClick={handlePostComment}
              disabled={!newComment.trim()}
              className="text-[#CF6844] hover:text-[#414B5C] p-1"
            >
              <Send className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
} 
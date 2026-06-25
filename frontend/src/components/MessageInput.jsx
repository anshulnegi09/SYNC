import React, { useState } from 'react'
import { Send, Smile } from 'lucide-react'

const QUICK_EMOJIS = ['👍', '❤️', '😂', '🔥', '👀', '🎉']

const MessageInput = ({ onSendMessage }) => {
  const [content, setContent] = useState('')
  const [showEmojis, setShowEmojis] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!content.trim()) return
    onSendMessage(content)
    setContent('')
    setShowEmojis(false)
  }

  const handleKeyDown = (e) => {
    // Send on Enter, new line on Shift+Enter
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  const addEmoji = (emoji) => {
    setContent((prev) => prev + emoji)
    setShowEmojis(false)
  }

  return (
    <div className="relative px-4 pb-4 pt-2 bg-gray-900 border-t border-white/5">

      {/* Emoji picker */}
      {showEmojis && (
        <div className="absolute bottom-full mb-2 left-4 flex gap-2 p-2 rounded-xl glass-strong shadow-lg"
          style={{ animation: 'fadeIn 0.15s ease forwards' }}>
          {QUICK_EMOJIS.map((e) => (
            <button
              key={e}
              type="button"
              onClick={() => addEmoji(e)}
              className="text-xl hover:scale-125 transition-transform duration-150 p-1 border-0 bg-transparent"
            >
              {e}
            </button>
          ))}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex items-center gap-2">
        {/* Emoji toggle */}
        <button
          type="button"
          onClick={() => setShowEmojis(!showEmojis)}
          className={`flex-shrink-0 p-2.5 rounded-xl border-0 transition-all duration-200 ${
            showEmojis
              ? 'bg-purple-500/20 text-purple-400'
              : 'bg-white/5 text-gray-500 hover:text-gray-300 hover:bg-white/10'
          }`}
        >
          <Smile size={18} />
        </button>

        {/* Text input */}
        <div className="flex-grow relative">
          <textarea
            rows={1}
            value={content}
            onChange={(e) => {
              setContent(e.target.value)
              // Auto-grow
              e.target.style.height = 'auto'
              e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px'
            }}
            onKeyDown={handleKeyDown}
            placeholder="Type a message… (Enter to send)"
            className="w-full bg-white/5 text-gray-100 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-1 focus:ring-purple-500/50 border border-white/10 focus:border-purple-500/50 placeholder-gray-600 resize-none scrollbar-hide transition-all duration-200 text-sm leading-relaxed"
            style={{ maxHeight: '120px', overflowY: 'auto' }}
          />
        </div>

        {/* Send button */}
        <button
          type="submit"
          disabled={!content.trim()}
          className="flex-shrink-0 p-2.5 rounded-xl btn-glow text-white transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none border-0"
        >
          <Send size={18} />
        </button>
      </form>

      <p className="text-[10px] text-gray-700 mt-1.5 ml-12">Enter to send · Shift+Enter for new line</p>
    </div>
  )
}

export default MessageInput
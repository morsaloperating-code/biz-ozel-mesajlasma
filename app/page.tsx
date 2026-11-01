"use client"
import { useEffect, useState, useRef } from 'react'
import { supabase } from '@/lib/supabase'

type Message = {
  id: string
  sender_id: string
  text: string
  type: string
  media_url?: string
  file_name?: string
  reaction?: { emoji: string, count: number } | null
  edited?: boolean
  created_at: string
}

export default function Home() {
  const [myId, setMyId] = useState<'ben'|'test'>('ben')
  const [messages, setMessages] = useState<Message[]>([])
  const [text, setText] = useState('')
  const [theme, setTheme] = useState('mor')
  const [dark, setDark] = useState(false)
  const [showMenu, setShowMenu] = useState(false)
  const [activePage, setActivePage] = useState<string|null>(null)
  const [reactionPicker, setReactionPicker] = useState<string|null>(null)
  const [pickerPos, setPickerPos] = useState({top:0})
  const [pencilFor, setPencilFor] = useState<string|null>(null)
  const [editMenuFor, setEditMenuFor] = useState<string|null>(null)
  const [editingId, setEditingId] = useState<string|null>(null)
  const [editText, setEditText] = useState('')
  const [deleteFor, setDeleteFor] = useState<string|null>(null)
  const listRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const longPressTimer = useRef<any>(null)
  const [isLongPress, setIsLongPress] = useState(false)

  const themes: any = {
    mor: { primary: '#6C5CE7', bg: '#f5f3ff', light: '#a29bfe' },
    pembe: { primary: '#e84393', bg: '#ffe0f0', light: '#fd79a8' },
    mavi: { primary: '#0984e3', bg: '#e0f0ff', light: '#74b9ff' },
    koyu: { primary: '#2d3436', bg: '#2d3436' }
  }

  useEffect(() => {
    const savedTheme = localStorage.getItem('biz_theme') || 'mor'
    const savedId = localStorage.getItem('biz_myId') || 'ben'
    const savedDark = localStorage.getItem('biz_dark') === 'true'
    setTheme(savedTheme)
    setMyId(savedId as any)
    setDark(savedDark)
    loadMessages()
    const channel = supabase.channel('messages').on('postgres_changes', { event: '*', schema: 'public', table: 'messages' }, (payload) => {
      if(payload.eventType === 'INSERT') setMessages(prev => [...prev, payload.new as Message])
      if(payload.eventType === 'UPDATE') setMessages(prev => prev.map(m => m.id === payload.new.id ? payload.new as Message : m))
      if(payload.eventType === 'DELETE') setMessages(prev => prev.filter(m => m.id !== payload.old.id))
    }).subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [])

  useEffect(() => {
    if(listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight
  }, [messages])

  useEffect(() => {
    localStorage.setItem('biz_theme', theme)
  }, [theme])

  useEffect(() => {
    localStorage.setItem('biz_dark', String(dark))
  }, [dark])

  async function loadMessages() {
    const { data } = await supabase.from('messages').select('*').order('created_at', {ascending:true}).limit(300)
    if(data) setMessages(data)
  }

  async function sendMessage() {
    if(!text.trim()) return
    await supabase.from('messages').insert({ sender_id: myId, text, type: 'text' })
    setText('')
  }

  async function handleFile(e: any) {
    const file = e.target.files[0]
    if(!file) return
    const fileName = `${Date.now()}-${file.name}`
    const { data, error } = await supabase.storage.from('media').upload(fileName, file)
    if(error) { alert('Yükleme hatası: '+error.message + '\nStorage > media bucket public mi kontrol et'); return }
    const { data: urlData } = supabase.storage.from('media').getPublicUrl(fileName)
    const type = file.type.startsWith('image') ? 'image' : file.type.startsWith('video') ? 'video' : file.type.startsWith('audio') ? 'audio' : 'file'
    await supabase.from('messages').insert({ sender_id: myId, text: '', type, media_url: urlData.publicUrl, file_name: file.name })
  }

  async function setReaction(id: string, emoji: string) {
    const msg = messages.find(m=>m.id===id)
    const newReaction = msg?.reaction?.emoji === emoji ? null : { emoji, count: 1 }
    await supabase.from('messages').update({ reaction: newReaction }).eq('id', id)
    setReactionPicker(null)
  }

  async function handleDoubleClick(id: string) {
    const msg = messages.find(m=>m.id===id)
    const newReaction = msg?.reaction?.emoji === '❤️' ? null : { emoji: '❤️', count: 1 }
    await supabase.from('messages').update({ reaction: newReaction }).eq('id', id)
  }

  async function deleteMessage(id: string) {
    await supabase.from('messages').delete().eq('id', id)
    setDeleteFor(null)
  }

  async function saveEdit() {
    if(!editText.trim() || !editingId) return
    await supabase.from('messages').update({ text: editText, edited: true }).eq('id', editingId)
    setEditingId(null)
  }

  function handlePressStart(e: any, id: string) {
    e.preventDefault()
    setIsLongPress(false)
    const rect = e.currentTarget.getBoundingClientRect()
    setPickerPos({top: rect.top + rect.height/2})
    longPressTimer.current = setTimeout(()=>{
      setIsLongPress(true)
      setReactionPicker(id)
      if(navigator.vibrate) navigator.vibrate(50)
    }, 600)
  }

  function handlePressEnd() {
    clearTimeout(longPressTimer.current)
  }

  function handleMessageClick(id: string, e: any) {
    if(isLongPress) return
    if(pencilFor === id) {
      setPencilFor(null)
      setEditMenuFor(null)
    } else {
      const msg = messages.find(m=>m.id===id)
      if(msg && msg.sender_id === myId) {
        setPencilFor(id)
      }
    }
  }

  return (
    <div style={{ background: dark ? '#111' : themes[theme].bg }} className={`min-h-screen flex flex-col ${dark ? 'text-white' : 'text-black'}`}>
      <header style={{ background: themes[theme].primary }} className="p-3 text-white flex justify-between items-center sticky top-0 z-20 shrink-0">
        <div className="flex gap-2 items-center">
          <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center">❤️</div>
          <div>
            <div className="font-bold text-[15px]">Biz - {myId === 'ben' ? 'Ben' : 'Test'}</div>
            <div className="text-[11px] opacity-80">Mor tema • Online • Çevrimiçi</div>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={()=>{
            const newId = myId==='ben'?'test':'ben'
            setMyId(newId as any)
            localStorage.setItem('biz_myId', newId)
          }} className="px-3 py-1.5 rounded-full bg-white/20 text-xs">Rol değiştir</button>
          <button onClick={()=>setShowMenu(!showMenu)} className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center">⋮</button>
        </div>
      </header>

      {showMenu && (
        <div className="absolute top-14 right-2 w-64 bg-white text-black rounded-2xl shadow-2xl z-30 overflow-hidden border">
          <button onClick={()=>{setActivePage('profile'); setShowMenu(false)}} className="w-full text-left px-4 py-3 hover:bg-gray-50 flex gap-3">👤 Profil</button>
          <button onClick={()=>{setActivePage('theme'); setShowMenu(false)}} className="w-full text-left px-4 py-3 hover:bg-gray-50 flex gap-3">🎨 Tema Ayarları</button>
          <button onClick={()=>{setActivePage('about'); setShowMenu(false)}} className="w-full text-left px-4 py-3 hover:bg-gray-50 flex gap-3">ℹ️ Hakkında</button>
          <button onClick={async()=>{
            if(confirm('Tüm mesajlar silinsin mi?')) {
              const { error } = await supabase.from('messages').delete().neq('id','00000000-0000-0000-0000-000000000000')
              if(error) alert(error.message)
            }
            setShowMenu(false)
          }} className="w-full text-left px-4 py-3 hover:bg-gray-50 text-red-500 flex gap-3">🗑️ Sohbeti Temizle</button>
        </div>
      )}

      <div ref={listRef} className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((m) => (
          <div key={m.id} className={`relative max-w-[75%] ${m.sender_id===myId ? 'ml-auto' : ''} select-none`}>
            <div
              onMouseDown={(e)=>handlePressStart(e, m.id)}
              onMouseUp={handlePressEnd}
              onTouchStart={(e)=>handlePressStart(e, m.id)}
              onTouchEnd={handlePressEnd}
              onClick={(e)=>handleMessageClick(m.id, e)}
              onDoubleClick={()=>handleDoubleClick(m.id)}
              style={{ background: m.sender_id===myId ? themes[theme].primary : dark ? '#2d3436' : 'white', color: m.sender_id===myId ? 'white' : dark ? 'white' : 'black' }}
              className="relative rounded-[18px] px-4 py-2.5 shadow-sm cursor-pointer"
            >
              {m.type==='text' && <div className="text-[14px] leading-[1.4]">{m.text} {m.edited && <span className="text-[10px] opacity-60">✏️ değiştirildi</span>}</div>}
              {m.type==='image' && <img src={m.media_url} className="rounded-xl max-w-[200px] cursor-pointer" onClick={()=>window.open(m.media_url, '_blank')} />}
              {m.type==='video' && <video src={m.media_url} controls className="rounded-xl max-w-[250px]" />}
              {m.type==='audio' && <audio src={m.media_url} controls className="w-[200px]" />}
              {m.type==='file' && <a href={m.media_url} target="_blank" className="underline text-sm">{m.file_name || 'Dosya'}</a>}
              <div className="text-[10px] opacity-60 mt-1 flex gap-1">{new Date(m.created_at).toLocaleTimeString('tr-TR', {hour:'2-digit', minute:'2-digit'})} {m.sender_id===myId && <span>✓✓</span>}</div>
              {m.reaction && (
                <div className="absolute -top-2 -right-2 bg-white rounded-full px-1.5 py-0.5 shadow-md border text-[11px] text-black animate-[scaleIn_0.2s]">{m.reaction.emoji} 1</div>
              )}
            </div>
            
            {pencilFor === m.id && m.sender_id===myId && (
              <button 
                onClick={(e)=>{
                  e.stopPropagation()
                  setEditMenuFor(editMenuFor===m.id ? null : m.id)
                }}
                className="absolute -top-1 -right-1 w-6 h-6 bg-white rounded-full shadow-lg border border-violet-100 flex items-center justify-center text-[12px] z-10"
              >
                ✏️
              </button>
            )}

            {editMenuFor === m.id && (
              <div className="absolute -top-8 right-0 bg-white rounded-2xl shadow-xl border p-1 z-20 flex gap-1">
                <button onClick={()=>{
                  setEditText(m.text)
                  setEditingId(m.id)
                  setEditMenuFor(null)
                  setPencilFor(null)
                }} className="px-3 py-1.5 hover:bg-gray-50 rounded-xl text-xs">✏️ Düzenle</button>
                <button onClick={()=>{
                  setDeleteFor(m.id)
                  setEditMenuFor(null)
                  setPencilFor(null)
                }} className="px-3 py-1.5 hover:bg-gray-50 rounded-xl text-xs text-red-500">🗑️ Sil</button>
              </div>
            )}
          </div>
        ))}
      </div>

      {reactionPicker && (
        <div style={{ top: `${pickerPos.top}px`, transform: 'translate(-50%, -50%)' }} className="fixed left-1/2 z-[100] bg-white rounded-full shadow-2xl border border-gray-200 px-3 py-2 flex gap-1.5 items-center max-w-[90vw]">
          {['❤️','😂','😡','😢','😮','🙏','👍'].map(e=>(
            <button key={e} onClick={()=>setReaction(reactionPicker, e)} className="w-10 h-10 text-xl hover:scale-125 transition-transform">{e}</button>
          ))}
          <button onClick={()=>setReactionPicker(null)} className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center ml-1">×</button>
        </div>
      )}

      <div className="shrink-0 bg-white border-t p-3 flex gap-2 items-center z-20 sticky bottom-0">
        <button onClick={()=>fileInputRef.current?.click()} className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">📎</button>
        <input ref={fileInputRef} type="file" accept="image/*,video/*,audio/*,.pdf,.doc,.docx" onChange={handleFile} hidden />
        <input value={text} onChange={e=>setText(e.target.value)} onKeyDown={e=>e.key==='Enter' && sendMessage()} placeholder={`${myId} olarak yaz...`} className="flex-1 rounded-full bg-gray-100 px-4 py-2.5 outline-none text-black text-[14px]" />
        <button onClick={sendMessage} style={{ background: themes[theme].primary }} className="w-10 h-10 rounded-full text-white flex items-center justify-center shrink-0">↑</button>
      </div>

      {editingId && (
        <div className="fixed inset-0 bg-black/50 z-[200] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-5 w-full max-w-sm text-black">
            <h3 className="font-bold mb-3">Mesajı Düzenle</h3>
            <input value={editText} onChange={e=>setEditText(e.target.value)} className="w-full border rounded-xl px-3 py-2 mb-3 outline-none" />
            <div className="flex gap-2">
              <button onClick={()=>setEditingId(null)} className="flex-1 py-2.5 rounded-full bg-gray-100">İptal</button>
              <button onClick={saveEdit} style={{ background: themes[theme].primary }} className="flex-1 py-2.5 rounded-full text-white">Kaydet</button>
            </div>
          </div>
        </div>
      )}

      {deleteFor && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
          <div className="bg-white rounded-[28px] p-6 w-full max-w-sm shadow-2xl text-center text-black">
            <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-3 text-2xl">🗑️</div>
            <h3 className="font-bold text-lg mb-2">Bu mesaj silinsin mi?</h3>
            <p className="bg-gray-50 rounded-xl p-3 text-sm text-gray-600 mb-4 text-left truncate">{messages.find(m=>m.id===deleteFor)?.text?.substring(0,100) || 'Medya'}</p>
            <div className="flex gap-3">
              <button onClick={()=>setDeleteFor(null)} className="flex-1 py-3 rounded-full border">Hayır</button>
              <button onClick={()=>deleteMessage(deleteFor)} className="flex-1 py-3 rounded-full bg-[#ff3b5c] text-white">Evet sil</button>
            </div>
          </div>
        </div>
      )}

      {activePage==='profile' && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white text-black rounded-2xl p-6 w-full max-w-sm">
            <h2 className="font-bold text-lg mb-4">👤 Profil</h2>
            <div className="space-y-3">
              <div><label className="text-sm text-gray-500">Rol</label><div className="font-medium">{myId === 'ben' ? 'Ben' : 'Test'}</div></div>
              <div><label className="text-sm text-gray-500">Durum</label><div className="font-medium">Çevrimiçi 💜</div></div>
              <p className="text-sm text-gray-500">Profil fotoğrafı yakında eklenecek. Şu an 2 kişilik özel modda.</p>
            </div>
            <button onClick={()=>setActivePage(null)} className="mt-4 w-full py-2.5 rounded-full bg-gray-100">Kapat</button>
          </div>
        </div>
      )}

      {activePage==='theme' && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white text-black rounded-2xl p-6 w-full max-w-sm">
            <h2 className="font-bold text-lg mb-4">🎨 Tema Ayarları</h2>
            <div className="mb-4">
              <p className="text-sm text-gray-500 mb-2">Renk</p>
              <div className="grid grid-cols-4 gap-3">
                {Object.keys(themes).map(t=>(
                  <button key={t} onClick={()=>setTheme(t)} style={{ background: themes[t].primary }} className={`h-12 rounded-2xl ${theme===t ? 'ring-2 ring-offset-2 ring-black' : ''} flex items-center justify-center text-white text-xs capitalize`}>{t}</button>
                ))}
              </div>
            </div>
            <div className="flex gap-2 mb-4">
              <button onClick={()=>setDark(false)} className={`flex-1 py-2.5 rounded-full ${!dark ? 'bg-black text-white' : 'bg-gray-100'}`}>☀️ Açık</button>
              <button onClick={()=>setDark(true)} className={`flex-1 py-2.5 rounded-full ${dark ? 'bg-black text-white' : 'bg-gray-100'}`}>🌙 Koyu</button>
            </div>
            <button onClick={()=>setActivePage(null)} className="w-full py-2.5 rounded-full bg-black text-white">Tamam</button>
          </div>
        </div>
      )}

      {activePage==='about' && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white text-black rounded-2xl p-6 w-full max-w-sm text-center">
            <div className="text-4xl mb-2">❤️</div>
            <h2 className="font-bold text-lg">Biz - Özel Mesajlaşma</h2>
            <p className="text-sm text-gray-500">v2.0 Online • Mor tema • Emoji ortada hizada • Kalem menü</p>
            <p className="text-sm mt-4 text-left">Supabase + Vercel ile %100 ücretsiz, anlık mesajlaşma. Mesajlar anında iletilir, resim/video/müzik paylaşılır. Tam WhatsApp gibi.</p>
            <p className="text-xs mt-2 text-gray-400">Supabase URL: dqbnsdlkdarmmrcrqoug</p>
            <button onClick={()=>setActivePage(null)} className="mt-4 w-full py-2.5 rounded-full bg-black text-white">Kapat</button>
          </div>
        </div>
      )}
    </div>
  )
}

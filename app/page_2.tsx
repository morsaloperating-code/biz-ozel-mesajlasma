
"use client"
// PWA
if (typeof window !== 'undefined' && 'serviceWorker' in navigator) { navigator.serviceWorker.register('/sw.js').catch(()=>{}) }
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
  const listRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const themes: any = {
    mor: { primary: '#6C5CE7', bg: '#f5f3ff' },
    pembe: { primary: '#e84393', bg: '#ffe0f0' },
    mavi: { primary: '#0984e3', bg: '#e0f0ff' },
    koyu: { primary: '#2d3436', bg: '#2d3436' }
  }

  useEffect(() => {
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

  async function loadMessages() {
    const { data } = await supabase.from('messages').select('*').order('created_at', {ascending:true}).limit(200)
    if(data) setMessages(data)
  }

  async function sendMessage() {
    if(!text.trim()) return
    const { data } = await supabase.from('messages').insert({ sender_id: myId, text, type: 'text' }).select().single()
    setText('')
  }

  async function sendMedia(url: string, type: string, name?: string) {
    await supabase.from('messages').insert({ sender_id: myId, text: '', type, media_url: url, file_name: name })
  }

  async function handleFile(e: any) {
    const file = e.target.files[0]
    if(!file) return
    const fileName = `${Date.now()}-${file.name}`
    const { data, error } = await supabase.storage.from('media').upload(fileName, file)
    if(error) { alert('Yukleme hatasi: '+error.message); return }
    const { data: urlData } = supabase.storage.from('media').getPublicUrl(fileName)
    const type = file.type.startsWith('image') ? 'image' : file.type.startsWith('video') ? 'video' : file.type.startsWith('audio') ? 'audio' : 'file'
    await sendMedia(urlData.publicUrl, type, file.name)
  }

  async function setReaction(id: string, emoji: string) {
    const msg = messages.find(m=>m.id===id)
    const newReaction = msg?.reaction?.emoji === emoji ? null : { emoji, count: 1 }
    await supabase.from('messages').update({ reaction: newReaction }).eq('id', id)
    setReactionPicker(null)
  }

  async function deleteMessage(id: string) {
    if(!confirm('Silinsin mi?')) return
    await supabase.from('messages').delete().eq('id', id)
  }

  return (
    <div style={{ background: dark ? '#111' : themes[theme].bg, color: dark ? '#fff' : '#000' }} className="min-h-screen flex flex-col">
      <header style={{ background: themes[theme].primary }} className="p-3 text-white flex justify-between items-center sticky top-0 z-20">
        <div className="flex gap-2 items-center">
          <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">❤️</div>
          <div>
            <div className="font-bold">Biz - {myId === 'ben' ? 'Ben' : 'Test'}</div>
            <div className="text-xs opacity-80">Çevrimiçi • {messages.length} mesaj • sabit picker</div>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={()=>setMyId(myId==='ben'?'test':'ben')} className="px-3 py-1 rounded-full bg-white/20 text-xs">Rol değiştir</button>
          <button onClick={()=>setShowMenu(!showMenu)} className="w-8 h-8 rounded-full bg-white/20">⋮</button>
        </div>
      </header>

      {showMenu && (
        <div className="absolute top-14 right-2 w-64 bg-white text-black rounded-2xl shadow-2xl z-30 overflow-hidden border">
          <button onClick={()=>{setActivePage('profile'); setShowMenu(false)}} className="w-full text-left px-4 py-3 hover:bg-gray-50">👤 Profil</button>
          <button onClick={()=>{setActivePage('theme'); setShowMenu(false)}} className="w-full text-left px-4 py-3 hover:bg-gray-50">🎨 Tema Ayarları</button>
          <button onClick={()=>{setActivePage('about'); setShowMenu(false)}} className="w-full text-left px-4 py-3 hover:bg-gray-50">ℹ️ Hakkında</button>
          <button onClick={async()=>{if(confirm('Tüm mesajlar silinsin mi?')) await supabase.from('messages').delete().neq('id','00000000-0000-0000-0000-000000000000')}} className="w-full text-left px-4 py-3 hover:bg-gray-50 text-red-500">🗑️ Sohbeti Temizle</button>
        </div>
      )}

      <div ref={listRef} className="flex-1 overflow-y-auto p-4 space-y-3 pb-24">
        {messages.map((m, idx) => (
          <div key={m.id} className={`relative max-w-[75%] ${m.sender_id===myId ? 'ml-auto' : ''}`}>
            <div
              onMouseDown={(e)=>{ const r=e.currentTarget.getBoundingClientRect(); setPickerPos({top: r.top + r.height/2}); setTimeout(()=>setReactionPicker(m.id), 600)}}
              onMouseUp={()=>{}}
              onTouchStart={(e)=>{ const r=e.currentTarget.getBoundingClientRect(); setPickerPos({top: r.top + r.height/2}); setTimeout(()=>setReactionPicker(m.id), 600)}}
              style={{ background: m.sender_id===myId ? themes[theme].primary : dark ? '#2d3436' : 'white', color: m.sender_id===myId ? 'white' : dark ? 'white' : 'black' }}
              className="rounded-[18px] px-4 py-2 shadow-sm relative"
            >
              {m.type==='text' && <div>{m.text} {m.edited && <span className="text-[10px] opacity-60"> (değiştirildi)</span>}</div>}
              {m.type==='image' && <img src={m.media_url} className="rounded-xl max-w-[200px] cursor-pointer" onClick={()=>window.open(m.media_url, '_blank')} />}
              {m.type==='video' && <video src={m.media_url} controls className="rounded-xl max-w-[250px]" />}
              {m.type==='audio' && <audio src={m.media_url} controls className="w-[200px]" />}
              {m.type==='file' && <a href={m.media_url} target="_blank" className="underline">{m.file_name}</a>}
              <div className="text-[10px] opacity-60 mt-1">{new Date(m.created_at).toLocaleTimeString('tr-TR', {hour:'2-digit', minute:'2-digit'})} {m.sender_id===myId && '✓✓'}</div>
              {m.reaction && (
                <div className="absolute -top-2 -right-2 bg-white rounded-full px-1.5 py-0.5 shadow-md border text-[11px] text-black">{m.reaction.emoji} 1</div>
              )}
            </div>
            {m.sender_id===myId && (
              <div className="flex gap-1 justify-end mt-1">
                <button onClick={()=>deleteMessage(m.id)} className="text-[10px] opacity-40">Sil</button>
              </div>
            )}
          </div>
        ))}
      </div>

      {reactionPicker && (
        <div style={{ top: pickerPos.top, transform: 'translate(-50%, -50%)' }} className="fixed left-1/2 z-[100] bg-white rounded-full shadow-2xl border px-3 py-2 flex gap-2 text-black">
          {['❤️','😂','😡','😢','😮','🙏','👍'].map(e=>(
            <button key={e} onClick={()=>setReaction(reactionPicker, e)} className="w-8 h-8 hover:scale-125">{e}</button>
          ))}
          <button onClick={()=>setReactionPicker(null)} className="w-6 h-6 rounded-full bg-gray-100">×</button>
        </div>
      )}

      <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t p-3 flex gap-2 z-20">
        <button onClick={()=>fileInputRef.current?.click()} className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">📎</button>
        <input ref={fileInputRef} type="file" accept="image/*,video/*,audio/*,.pdf,.doc,.docx" onChange={handleFile} hidden />
        <input value={text} onChange={e=>setText(e.target.value)} onKeyDown={e=>e.key==='Enter' && sendMessage()} placeholder={`${myId} olarak yaz...`} className="flex-1 rounded-full bg-gray-100 px-4 py-2 outline-none text-black" />
        <button onClick={sendMessage} style={{ background: themes[theme].primary }} className="w-10 h-10 rounded-full text-white">↑</button>
      </div>

      {activePage==='profile' && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white text-black rounded-2xl p-6 w-full max-w-sm">
            <h2 className="font-bold text-lg mb-4">👤 Profil</h2>
            <p>Rol: {myId}</p>
            <p className="text-sm text-gray-500 mt-2">Bu 2 kişilik özel app. Profil fotoğrafı yakında Supabase Storage ile eklenecek.</p>
            <button onClick={()=>setActivePage(null)} className="mt-4 w-full py-2 rounded-full bg-gray-100">Kapat</button>
          </div>
        </div>
      )}
      {activePage==='theme' && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white text-black rounded-2xl p-6 w-full max-w-sm">
            <h2 className="font-bold text-lg mb-4">🎨 Tema</h2>
            <div className="grid grid-cols-4 gap-2 mb-4">
              {Object.keys(themes).map(t=>(
                <button key={t} onClick={()=>setTheme(t)} style={{ background: themes[t].primary }} className={`h-10 rounded-full ${theme===t ? 'ring-2 ring-offset-2 ring-black' : ''}`}></button>
              ))}
            </div>
            <button onClick={()=>setDark(!dark)} className="w-full py-2 rounded-full bg-gray-100 mb-2">{dark ? '☀️ Açık Mod' : '🌙 Koyu Mod'}</button>
            <button onClick={()=>setActivePage(null)} className="w-full py-2 rounded-full bg-black text-white">Tamam</button>
          </div>
        </div>
      )}
      {activePage==='about' && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white text-black rounded-2xl p-6 w-full max-w-sm text-center">
            <div className="text-4xl mb-2">❤️</div>
            <h2 className="font-bold text-lg">Biz - Özel Mesajlaşma</h2>
            <p className="text-sm text-gray-500">v2.0 - Sadece ikiniz için</p>
            <p className="text-sm mt-4">Supabase + Vercel ile ücretsiz, güvenli, anlık mesajlaşma. Mesajlar anlık iletilir, resim/video/müzik paylaşılır.</p>
            <button onClick={()=>setActivePage(null)} className="mt-4 w-full py-2 rounded-full bg-black text-white">Kapat</button>
          </div>
        </div>
      )}
    </div>
  )
}

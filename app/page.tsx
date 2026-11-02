"use client"
import { useEffect, useState, useRef } from 'react'
import { supabase } from '@/lib/supabase'

const LANGUAGES: any = {
  en: { chats:'Chats', contacts:'Contacts', search:'Search', settings:'Settings', block:'Block', unblock:'Unblock', add:'Add', requestSent:'Request Sent', pending:'Pending', accept:'Accept', message:'Message', blockedUsers:'Blocked Users', noBlocked:'No blocked users', changePhoto:'Change Photo', language:'Language', theme:'Theme', dark:'Dark', light:'Light', logout:'Logout', signIn:'Sign In', signUp:'Sign Up', email:'Email', password:'Password', username:'Username', forgot:'Forgot Password?', continueGoogle:'Continue with Google (Gmail)', online:'Online', offline:'Offline' },
  tr: { chats:'Sohbetler', contacts:'Kişiler', search:'Arama', settings:'Ayarlar', block:'Engelle', unblock:'Engeli Kaldır', add:'Ekle', requestSent:'İstek Gönderildi', pending:'Beklemede', accept:'Kabul Et', message:'Mesaj', blockedUsers:'Engellenenler', noBlocked:'Engellenen yok', changePhoto:'Fotoğraf Değiştir', language:'Dil', theme:'Tema', dark:'Koyu', light:'Açık', logout:'Çıkış', signIn:'Giriş Yap', signUp:'Kayıt Ol', email:'E-posta', password:'Şifre', username:'Kullanıcı Adı', forgot:'Şifremi Unuttum?', continueGoogle:'Google ile Devam Et', online:'Çevrimiçi', offline:'Çevrimdışı' }
}
const LANG_LIST = [{code:'en', name:'English', flag:'🇺🇸'}, {code:'tr', name:'Türkçe', flag:'🇹🇷'}, {code:'es', name:'Español', flag:'🇪🇸'}, {code:'fr', name:'Français', flag:'🇫🇷'}, {code:'de', name:'Deutsch', flag:'🇩🇪'}, {code:'it', name:'Italiano', flag:'🇮🇹'}, {code:'pt', name:'Português', flag:'🇵🇹'}, {code:'ru', name:'Русский', flag:'🇷🇺'}, {code:'ar', name:'العربية', flag:'🇸🇦'}, {code:'zh', name:'中文', flag:'🇨🇳'}, {code:'ja', name:'日本語', flag:'🇯🇵'}, {code:'ko', name:'한국어', flag:'🇰🇷'}, {code:'nl', name:'Nederlands', flag:'🇳🇱'}, {code:'pl', name:'Polski', flag:'🇵🇱'}, {code:'hi', name:'हिंदी', flag:'🇮🇳'}]

export default function MuryLuxury(){
  const [user,setUser]=useState<any>(null)
  const [email,setEmail]=useState('')
  const [password,setPassword]=useState('')
  const [username,setUsername]=useState('')
  const [isLogin,setIsLogin]=useState(true)
  const [messages,setMessages]=useState<any[]>([
    {id:'1', sender_id:'me', content:'Welcome to Mury Luxury!', created_at:new Date().toISOString(), is_read:true, reaction:null},
  ])
  const [text,setText]=useState('')
  const [friends,setFriends]=useState<any[]>([{id:'2', username:'Mury Demo', email:'demo@mury.app', avatar_url:'/mury_logo_black.png', bio:'Luxury messaging'}])
  const [blocked,setBlocked]=useState<any[]>([])
  const [tab,setTab]=useState('chats')
  const [search,setSearch]=useState('')
  const [dark,setDark]=useState(false)
  const [lang,setLang]=useState('en')
  const [showProfile,setShowProfile]=useState<any>(null)
  const [sentRequests,setSentRequests]=useState<string[]>([])
  const [accepting,setAccepting]=useState<string|null>(null)
  const [selectedId,setSelectedId]=useState<string|null>(null)
  const listRef=useRef<HTMLDivElement>(null)
  const t = (LANGUAGES[lang] || LANGUAGES.en)

  useEffect(()=>{
    const savedLang=localStorage.getItem('mury_lang')||'en'
    setLang(savedLang)
    const savedDark=localStorage.getItem('mury_dark')==='true'
    setDark(savedDark)
    const savedSent=JSON.parse(localStorage.getItem('mury_sent')||'[]')
    setSentRequests(savedSent)
    checkUser()
  },[])
  useEffect(()=>{ if(listRef.current) listRef.current.scrollTop=listRef.current.scrollHeight },[messages])
  async function checkUser(){ const {data}=await supabase.auth.getSession(); if(data.session) setUser(data.session.user); }
  async function handleAuth(){
    if(isLogin){
      const {data, error}=await supabase.auth.signInWithPassword({email,password});
      if(error) alert(error.message); else setUser(data.user);
    } else {
      const {data, error}=await supabase.auth.signUp({email,password, options:{data:{username}}});
      if(error) alert(error.message); else alert('Check your email for confirmation!');
    }
  }
  async function handleReset(){ if(!email){alert('Enter email');return} const {error}=await supabase.auth.resetPasswordForEmail(email); if(error) alert(error.message); else alert('Password reset link sent to Gmail!'); }
  async function handleGoogle(){ const {error}=await supabase.auth.signInWithOAuth({provider:'google'}); if(error) alert(error.message); }
  async function logout(){ await supabase.auth.signOut(); setUser(null); }
  function sendMessage(){
    if(!text.trim()) return;
    const newMsg={id:Date.now().toString(), sender_id:'me', content:text, created_at:new Date().toISOString(), is_read:false, reaction:null}
    setMessages(prev=>{ if(prev.find((m:any)=>m.id===newMsg.id)) return prev; return [...prev, newMsg]; });
    setText('');
    setTimeout(()=>{ setMessages(prev=>prev.map(m=>m.id===newMsg.id?{...m,is_read:true}:m)) },1500)
  }
  function handleDoubleTap(id:string){ setMessages(prev=>prev.map(m=>m.id===id?{...m,reaction:m.reaction?.emoji==='❤️'?null:{emoji:'❤️'}}:m)) }
  function handleSingleTap(id:string){ setSelectedId(selectedId===id?null:id) }
  function handleBlock(f:any){ setFriends(prev=>prev.filter(x=>x.id!==f.id)); setBlocked(prev=>[...prev,f]); }
  function handleUnblock(f:any){ setBlocked(prev=>prev.filter(x=>x.id!==f.id)); setFriends(prev=>[...prev,f]); }
  function handleAdd(id:string){ if(sentRequests.includes(id)) return; const ns=[...sentRequests,id]; setSentRequests(ns); localStorage.setItem('mury_sent', JSON.stringify(ns)); }
  function handleAccept(id:string){ if(accepting) return; setAccepting(id); setTimeout(()=>{ setAccepting(null); },600); }

  if(!user){
    return (
      <div className={`min-h-screen flex items-center justify-center p-4 ${dark?'bg-zinc-900':'bg-[#f5f3ff]'}`}>
        <div className={`w-full max-w-sm rounded-[32px] shadow-2xl p-7 border ${dark?'bg-zinc-800 border-zinc-700':'bg-white border-zinc-100'}`}>
          <div className="text-center mb-6">
            <img src="/mury_logo_black.png" alt="Mury" className="w-24 h-24 mx-auto rounded-full mb-4 shadow-xl border-2 border-[#D4AF37]" />
            <h1 className={`text-3xl font-black tracking-widest ${dark?'text-white':'text-zinc-900'}`}>MURY</h1>
            <p className="text-[11px] tracking-[0.3em] text-[#D4AF37] font-bold mt-1">LUXURY MESSAGING</p>
          </div>
          <div className={`flex gap-2 mb-5 rounded-full p-1.5 ${dark?'bg-zinc-700':'bg-zinc-100'}`}>
            <button onClick={()=>setIsLogin(true)} className={`flex-1 py-2.5 rounded-full text-sm font-medium transition-all ${isLogin?'bg-black text-white shadow':'text-zinc-500'}`}>{t.signIn}</button>
            <button onClick={()=>setIsLogin(false)} className={`flex-1 py-2.5 rounded-full text-sm font-medium transition-all ${!isLogin?'bg-black text-white shadow':'text-zinc-500'}`}>{t.signUp}</button>
          </div>
          {!isLogin && <input value={username} onChange={e=>setUsername(e.target.value)} placeholder={t.username} className={`w-full mb-3 px-5 py-3.5 rounded-2xl border text-sm ${dark?'bg-zinc-700 border-zinc-600 text-white placeholder:text-zinc-400':'bg-zinc-50 border-zinc-100'}`} />}
          <input value={email} onChange={e=>setEmail(e.target.value)} placeholder={t.email} className={`w-full mb-3 px-5 py-3.5 rounded-2xl border text-sm ${dark?'bg-zinc-700 border-zinc-600 text-white placeholder:text-zinc-400':'bg-zinc-50 border-zinc-100'}`} />
          <input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder={t.password} className={`w-full mb-5 px-5 py-3.5 rounded-2xl border text-sm ${dark?'bg-zinc-700 border-zinc-600 text-white placeholder:text-zinc-400':'bg-zinc-50 border-zinc-100'}`} />
          <button onClick={handleAuth} className="w-full py-4 rounded-full bg-[#6C5CE7] text-white font-bold shadow-lg shadow-[#6C5CE7]/20 hover:shadow-xl transition-all">{isLogin?`${t.signIn} →`:t.signUp}</button>
          <button onClick={handleGoogle} className={`w-full py-3.5 rounded-full border mt-3 text-sm font-medium ${dark?'border-zinc-600 text-white':'border-zinc-200'}`}>{t.continueGoogle}</button>
          <button onClick={handleReset} className="w-full text-xs text-zinc-400 mt-3 hover:text-zinc-600">{t.forgot}</button>
        </div>
      </div>
    )
  }

  return (
    <div className={`h-screen flex flex-col ${dark?'bg-zinc-900 text-white':'bg-[#f5f3ff] text-zinc-900'}`} style={{paddingTop:'var(--safe-area-inset-top)'}}>
      <div data-safe-area-inset-root className="h-0" />
      <header className="h-[64px] shrink-0 flex items-center px-5 bg-[#6C5CE7] text-white shadow-lg z-10" style={{position:'sticky', top:'var(--safe-area-inset-top)'}}>
        <img src="/mury_logo_white.png" alt="M" className="w-9 h-9 rounded-full mr-3 border border-white/20 shadow" />
        <span className="font-black tracking-widest text-[16px]">MURY</span>
        <span className="ml-2 text-[10px] bg-white/20 px-2 py-0.5 rounded-full">LUXURY</span>
        <div className="ml-auto flex gap-2">
          <button onClick={()=>{const nd=!dark; setDark(nd); localStorage.setItem('mury_dark', String(nd));}} className="w-9 h-9 rounded-full bg-white/15 flex items-center justify-center">{dark?'☀️':'🌙'}</button>
          <button onClick={logout} className="px-4 py-1.5 rounded-full bg-white/15 text-xs font-medium">{t.logout}</button>
        </div>
      </header>

      <div ref={listRef} className="flex-1 overflow-y-auto p-4 space-y-3" style={{paddingBottom:'140px'}}>
        {tab==='chats' && messages.map(m=>(
          <div key={m.id} className={`relative max-w-[78%] ${m.sender_id==='me'?'ml-auto':''}`}>
            <div onDoubleClick={()=>handleDoubleTap(m.id)} onClick={()=>handleSingleTap(m.id)} className={`rounded-[20px] px-4 py-3 cursor-pointer shadow-sm relative ${m.sender_id==='me'?'bg-[#6C5CE7] text-white rounded-br-[6px]':'bg-white text-zinc-900 rounded-bl-[6px] dark:bg-zinc-800 dark:text-white'} `}>
              {m.sender_id!=='me' && <div className="absolute -top-1.5 -left-1.5 w-5 h-5 bg-white rounded-full shadow border flex items-center justify-center text-[10px]">✨</div>}
              <div className="text-[14.5px] leading-[1.4]">{m.content}</div>
              <div className={`text-[11px] mt-1.5 flex gap-1 justify-end items-center ${m.sender_id==='me'?'text-white/70':'text-zinc-400'}`}>
                {new Date(m.created_at).toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'})}
                {m.sender_id==='me' && <span className={`${m.is_read?'text-[#53bdeb]':'text-white/50'} font-bold`}>{m.is_read?'✓✓':'✓'}</span>}
              </div>
              {m.reaction && <div className="absolute -top-2.5 -left-2 bg-white rounded-full px-2 py-0.5 shadow-lg border text-[12px]">{m.reaction.emoji}</div>}
            </div>
            {selectedId===m.id && m.sender_id==='me' && <button className="absolute -top-2 -right-2 w-7 h-7 bg-white rounded-full shadow-lg border text-[13px] flex items-center justify-center">✏️</button>}
          </div>
        ))}
        {tab==='contacts' && (
          <div className="space-y-3">
            <div className="flex gap-2">
              <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search users..." className={`flex-1 px-5 py-3 rounded-full text-sm ${dark?'bg-zinc-800 text-white border-zinc-700 border':'bg-white border border-zinc-100'}`} />
            </div>
            {friends.map(f=>(
              <div key={f.id} onClick={()=>setShowProfile(f)} className={`flex items-center gap-3 p-4 rounded-[20px] cursor-pointer shadow-sm border ${dark?'bg-zinc-800 border-zinc-700':'bg-white border-zinc-100'}`}>
                <img src={f.avatar_url||'/mury_logo_black.png'} className="w-12 h-12 rounded-full border border-[#D4AF37]/30" />
                <div className="flex-1"><div className="font-bold text-sm">{f.username}</div><div className="text-xs text-zinc-500">{f.email}</div></div>
                {!sentRequests.includes(f.id) ? <button onClick={(e)=>{e.stopPropagation(); handleAdd(f.id);}} className="text-xs px-4 py-1.5 rounded-full bg-[#6C5CE7] text-white font-medium">{t.add}</button> : <span className="text-xs px-3 py-1 rounded-full bg-zinc-100 text-zinc-500">{t.requestSent} ✓</span>}
              </div>
            ))}
            <div className={`mt-6 p-5 rounded-[24px] border ${dark?'bg-zinc-800 border-zinc-700':'bg-white border-zinc-100'}`}>
              <h3 className="font-black text-sm mb-3 tracking-widest">{t.blockedUsers}</h3>
              {blocked.length===0 ? <div className="text-xs text-zinc-400">{t.noBlocked}</div> : blocked.map(b=>(
                <div key={b.id} className="flex items-center gap-3 py-3 border-b last:border-0 border-zinc-100 dark:border-zinc-700">
                  <img src={b.avatar_url||'/mury_logo_black.png'} className="w-10 h-10 rounded-full" />
                  <div className="flex-1 text-sm font-medium">{b.username}</div>
                  <button onClick={()=>handleUnblock(b)} className="text-xs px-4 py-1.5 rounded-full bg-green-50 text-green-600 border border-green-200 font-bold">{t.unblock}</button>
                </div>
              ))}
            </div>
          </div>
        )}
        {tab==='settings' && (
          <div className="space-y-4">
            <div className={`p-6 rounded-[28px] border shadow-sm ${dark?'bg-zinc-800 border-zinc-700':'bg-white border-zinc-100'}`}>
              <div className="flex items-center gap-4">
                <div className="relative">
                  <img src="/mury_logo_black.png" className="w-20 h-20 rounded-full border-2 border-[#D4AF37] shadow-lg" />
                  <button className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-[#6C5CE7] text-white flex items-center justify-center text-xs shadow">📷</button>
                </div>
                <div><div className="font-black">{user.email}</div><div className="text-xs text-[#D4AF37] font-bold tracking-widest">MURY LUXURY</div><div className="text-xs text-zinc-400 mt-1">{t.online} • Marble + Gold</div></div>
              </div>
            </div>
            <div className={`p-5 rounded-[24px] border ${dark?'bg-zinc-800 border-zinc-700':'bg-white border-zinc-100'}`}>
              <h4 className="font-bold text-sm mb-3">{t.language}</h4>
              <div className="grid grid-cols-2 gap-2">
                {LANG_LIST.map(l=>(
                  <button key={l.code} onClick={()=>{setLang(l.code); localStorage.setItem('mury_lang', l.code);}} className={`p-3 rounded-2xl border text-left flex items-center gap-2 text-sm ${lang===l.code?'bg-[#6C5CE7] text-white border-[#6C5CE7]':'bg-zinc-50 dark:bg-zinc-700 border-zinc-100 dark:border-zinc-600'}`}>
                    <span>{l.flag}</span><span className="font-medium">{l.name}</span>
                  </button>
                ))}
              </div>
            </div>
            <div className={`p-5 rounded-[24px] border ${dark?'bg-zinc-800 border-zinc-700':'bg-white border-zinc-100'}`}>
              <h4 className="font-bold text-sm mb-2">{t.theme}</h4>
              <div className="flex gap-2">
                <button onClick={()=>{setDark(false); localStorage.setItem('mury_dark','false');}} className={`flex-1 py-3 rounded-full text-sm font-medium ${!dark?'bg-black text-white':'bg-zinc-100 dark:bg-zinc-700'}`}>{t.light} ☀️</button>
                <button onClick={()=>{setDark(true); localStorage.setItem('mury_dark','true');}} className={`flex-1 py-3 rounded-full text-sm font-medium ${dark?'bg-white text-black':'bg-zinc-900 text-white'}`}>{t.dark} 🌙</button>
              </div>
            </div>
          </div>
        )}
      </div>

      {tab==='chats' && (
        <div className={`shrink-0 p-3 border-t flex gap-2 ${dark?'bg-zinc-800 border-zinc-700':'bg-white border-zinc-100'}`} style={{position:'fixed', bottom:'72px', left:0, right:0}}>
          <button className="w-11 h-11 rounded-full bg-zinc-100 dark:bg-zinc-700 flex items-center justify-center">😊</button>
          <input value={text} onChange={e=>setText(e.target.value)} onKeyDown={e=>e.key==='Enter'&&sendMessage()} placeholder="Write as Ben..." className={`flex-1 rounded-full px-5 py-3 text-sm ${dark?'bg-zinc-700 text-white':'bg-zinc-100'}`} />
          <button onClick={sendMessage} className="w-11 h-11 rounded-full bg-[#6C5CE7] text-white flex items-center justify-center shadow-lg">↑</button>
        </div>
      )}

      <nav className={`h-[72px] shrink-0 border-t flex justify-around items-center px-2 ${dark?'bg-zinc-900 border-zinc-700':'bg-white border-zinc-100'}`} style={{position:'fixed', bottom:0, left:0, right:0, paddingBottom:'env(safe-area-inset-bottom)'}}>
        {[{id:'chats', icon:'💬', label:t.chats},{id:'contacts', icon:'👥', label:t.contacts},{id:'search', icon:'🔍', label:t.search},{id:'settings', icon:'⚙️', label:t.settings}].map(item=>(
          <button key={item.id} onClick={()=>setTab(item.id)} className={`flex flex-col items-center gap-1 px-4 py-1.5 rounded-2xl transition-all ${tab===item.id?'text-[#6C5CE7] bg-[#6C5CE7]/10':'text-zinc-400'}`}>
            <span className="text-[20px]">{item.icon}</span><span className="text-[10px] font-bold tracking-widest">{item.label.toUpperCase()}</span>
          </button>
        ))}
      </nav>

      {showProfile && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-6" onClick={()=>setShowProfile(null)}>
          <div className={`rounded-[32px] p-8 w-full max-w-sm text-center shadow-2xl ${dark?'bg-zinc-800':'bg-white'}`} onClick={e=>e.stopPropagation()}>
            <img src={showProfile.avatar_url||'/mury_logo_black.png'} className="w-28 h-28 rounded-full mx-auto mb-4 border-2 border-[#D4AF37] shadow-xl" />
            <h2 className="font-black text-lg">{showProfile.username}</h2>
            <p className="text-xs text-zinc-400">{showProfile.email}</p>
            <p className="text-sm mt-3 text-zinc-500">{showProfile.bio||'Luxury messaging with Mury'}</p>
            <button onClick={()=>{setShowProfile(null); setTab('chats');}} className="mt-6 w-full py-4 rounded-full bg-[#6C5CE7] text-white font-bold shadow-lg">{t.message}</button>
            <button onClick={()=>{handleBlock(showProfile); setShowProfile(null);}} className="mt-2 w-full py-3 rounded-full bg-red-50 text-red-500 text-sm font-medium">{t.block}</button>
          </div>
        </div>
      )}
    </div>
  )
}

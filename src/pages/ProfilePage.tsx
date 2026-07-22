import { ArrowLeft, Mail, Briefcase, User, Phone, Smartphone, Lock, Eye, EyeOff, Check, X } from 'lucide-react'
import { useState } from 'react'
import type { AuthUser } from '../services/auth'
import { changePassword } from '../services/auth'
import coverUrl from '../assets/perfil-sede.webp'

interface Props {
  user: AuthUser
  onBack: () => void
  onUserChange?: (u: AuthUser) => void
}

function InfoCard({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
  return (
    <div className="flex-1 min-w-0 bg-surface border border-border rounded-[14px] px-[20px] py-[16px] flex items-center gap-[14px]">
      <div className="w-[38px] h-[38px] rounded-[10px] bg-tile-bg flex items-center justify-center flex-shrink-0">
        <Icon size={18} strokeWidth={1.7} className="text-icon-default" />
      </div>
      <div className="min-w-0">
        <div className="font-archivo font-semibold text-[11px] tracking-[0.08em] uppercase text-label mb-[2px]">{label}</div>
        <div className="font-hanken text-[14px] text-ink truncate">{value || '—'}</div>
      </div>
    </div>
  )
}

export function ProfilePage({ user, onBack }: Props) {
  // Senha
  const [showChange, setShowChange] = useState(false)
  const [current, setCurrent] = useState('')
  const [next, setNext] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNext, setShowNext] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [pwError, setPwError] = useState<string | null>(null)

  const canSave = current.length > 0 && next.length >= 6 && next === confirm && !saving

  const closeModal = () => {
    if (saving) return
    setShowChange(false)
    setCurrent(''); setNext(''); setConfirm('')
    setPwError(null)
  }

  const handleSave = async () => {
    if (!canSave) return
    setSaving(true)
    setPwError(null)
    const res = await changePassword(current, next)
    setSaving(false)
    if (res.ok) {
      setSaved(true)
      setTimeout(() => {
        setSaved(false)
        setShowChange(false)
        setCurrent(''); setNext(''); setConfirm('')
      }, 1800)
    } else {
      setPwError(res.detail ?? 'Não foi possível alterar a senha.')
    }
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Top bar */}
      <div className="flex items-center gap-[14px] px-[24px] py-[16px] border-b border-border flex-shrink-0">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-[6px] border-none bg-transparent cursor-pointer font-hanken font-medium text-[13px] text-text-muted hover:text-ink transition-colors duration-150 p-0"
        >
          <ArrowLeft size={15} strokeWidth={2} />
          Voltar
        </button>
        <span className="text-border">|</span>
        <span className="font-archivo font-semibold text-[20px] text-ink">Meu Perfil</span>
      </div>

      <div className="flex-1 overflow-y-auto relative">
        {/* Wallpaper — cobre toda a área visível (não um valor fixo em px),
            pra sempre chegar perto do fim da tela, independente da altura
            do viewport. Some com fade só nos ~30% finais. Recuo à direita
            (24px) espelha o mesmo respiro que já existe entre o menu e o
            início do conteúdo — só aqui no Meu Perfil, não vai até a borda. */}
        <div
          className="absolute inset-y-0 left-0 right-[24px] bg-cover bg-center pointer-events-none"
          style={{ backgroundImage: `url(${coverUrl})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-[rgba(22,20,18,0.15)] from-0% via-[rgba(244,243,241,0.2)] via-75% to-bg-app to-95%" />
        </div>

        <div className="relative px-[24px] py-[32px]">
        <div className="max-w-[900px] mx-auto flex gap-[24px] items-stretch">

          <div className="flex-1 min-w-0 max-w-[480px] flex flex-col gap-[24px]">

            {/* Avatar — só aparece aqui em telas estreitas; em telas largas vira a coluna da direita */}
            <div className="flex lg:hidden flex-col items-center">
              <div className="w-[80px] h-[80px] rounded-full bg-avatar-bg text-white flex items-center justify-center font-archivo font-semibold text-[28px] flex-shrink-0 border-[3px] border-surface shadow-card-hover">
                {user.initials}
              </div>
            </div>

            {/* Info */}
            <div className="flex flex-col gap-[10px]">
              <InfoCard icon={User}     label="Nome"   value={user.name} />
              <InfoCard icon={Briefcase} label="Cargo" value={user.role} />
              <InfoCard icon={Mail}     label="E-mail" value={user.email} />

              {/* Ramal + Celular: somente leitura — edição é feita pelo administrador */}
              <div className="flex gap-[10px]">
                <InfoCard icon={Phone} label="Ramal" value={user.phoneExtension} />
                <InfoCard icon={Smartphone} label="Celular" value={user.mobile} />
              </div>
            </div>

            {/* Trocar senha */}
            <div className="bg-surface border border-border rounded-[14px] overflow-hidden">
              <button
                onClick={() => setShowChange(true)}
                className="w-full flex items-center gap-[14px] px-[20px] py-[16px] border-none bg-transparent cursor-pointer text-left transition-colors duration-150 hover:bg-tile-bg"
              >
                <div className="w-[38px] h-[38px] rounded-[10px] bg-tile-bg flex items-center justify-center flex-shrink-0">
                  <Lock size={18} strokeWidth={1.7} className="text-icon-default" />
                </div>
                <div className="flex-1">
                  <div className="font-archivo font-semibold text-[11px] tracking-[0.08em] uppercase text-label mb-[2px]">Segurança</div>
                  <div className="font-hanken text-[14px] text-ink">Trocar senha</div>
                </div>
                <span className="font-hanken text-[12px] text-text-faint">Alterar</span>
              </button>
            </div>

          </div>

          {/* Foto/avatar do colaborador — à direita dos cards, centralizada na altura deles */}
          <div className="hidden lg:flex flex-1 min-w-0 items-center justify-center">
            <div className="w-[220px] h-[220px] rounded-full bg-avatar-bg text-white flex items-center justify-center font-archivo font-semibold text-[68px] flex-shrink-0 border-[5px] border-surface shadow-card-hover">
              {user.initials}
            </div>
          </div>

        </div>
        </div>
      </div>

      {showChange && (
        <div
          className="fixed inset-0 z-[50] flex items-center justify-center bg-[rgba(22,20,18,0.45)] px-[16px]"
          onClick={closeModal}
        >
          <div
            className="w-full max-w-[420px] bg-surface border border-border rounded-[16px] shadow-card-hover overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center gap-[12px] px-[20px] py-[16px] border-b border-border">
              <div className="w-[38px] h-[38px] rounded-[10px] bg-tile-bg flex items-center justify-center flex-shrink-0">
                <Lock size={18} strokeWidth={1.7} className="text-icon-default" />
              </div>
              <span className="flex-1 font-archivo font-semibold text-[15px] text-ink">Trocar senha</span>
              <button
                onClick={closeModal}
                className="w-[30px] h-[30px] rounded-[9px] flex items-center justify-center cursor-pointer text-text-faint hover:bg-tile-bg hover:text-ink border-none bg-transparent transition-colors duration-150"
              >
                <X size={16} strokeWidth={1.8} />
              </button>
            </div>

            <form
              onSubmit={e => { e.preventDefault(); handleSave() }}
              className="px-[20px] pb-[20px] pt-[16px] flex flex-col gap-[12px]"
            >
              {/* Campo de usuário oculto — sem ele, navegadores (Chrome/Edge)
                  perdem a referência de "pra qual login são essas senhas" e
                  chegam a autopreencher o e-mail salvo em outro campo de texto
                  da página (ex.: a busca do Header), fora deste formulário. */}
              <input
                type="text"
                name="username"
                autoComplete="username"
                value={user.email}
                readOnly
                hidden
              />

              {(['Senha atual', 'Nova senha', 'Confirmar nova senha'] as const).map((label, i) => {
                const val    = [current, next, confirm][i]
                const setVal = [setCurrent, setNext, setConfirm][i]
                const show   = [showCurrent, showNext, showConfirm][i]
                const toggle = [() => setShowCurrent(v => !v), () => setShowNext(v => !v), () => setShowConfirm(v => !v)][i]
                const isError = i === 2 && confirm.length > 0 && confirm !== next
                const autoCompleteValue = i === 0 ? 'current-password' : 'new-password'

                return (
                  <div key={label}>
                    <label className="block font-archivo font-semibold text-[11px] tracking-[0.08em] uppercase text-label mb-[6px]">{label}</label>
                    <div className={`flex items-center bg-bg-app border rounded-[10px] px-[14px] gap-[8px] transition-colors ${isError ? 'border-red-400' : 'border-border'}`}>
                      <input
                        type={show ? 'text' : 'password'}
                        value={val}
                        onChange={e => setVal(e.target.value)}
                        name={autoCompleteValue}
                        autoComplete={autoCompleteValue}
                        className="flex-1 bg-transparent py-[11px] font-hanken text-[14px] text-ink outline-none border-none"
                        placeholder="••••••••"
                        autoFocus={i === 0}
                      />
                      <button type="button" onClick={toggle} className="border-none bg-transparent cursor-pointer text-text-faint hover:text-ink p-0">
                        {show ? <EyeOff size={16} strokeWidth={1.7} /> : <Eye size={16} strokeWidth={1.7} />}
                      </button>
                    </div>
                    {isError && <p className="font-hanken text-[12px] text-red-500 mt-[4px]">As senhas não coincidem</p>}
                    {i === 1 && next.length > 0 && next.length < 6 && <p className="font-hanken text-[12px] text-text-faint mt-[4px]">Mínimo 6 caracteres</p>}
                  </div>
                )
              })}

              {pwError && <p className="font-hanken text-[13px] text-red-500">{pwError}</p>}

              <button
                type="submit"
                disabled={!canSave}
                className="mt-[4px] inline-flex items-center justify-center gap-[8px] bg-accent text-white border-none rounded-[10px] px-[20px] py-[11px] font-hanken font-semibold text-[14px] cursor-pointer transition-all duration-150 hover:brightness-[0.93] disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {saved ? <><Check size={16} strokeWidth={2} /> Senha alterada!</>
                  : saving ? 'Salvando…' : 'Salvar nova senha'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

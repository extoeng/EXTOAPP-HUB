import { useState, type FormEvent } from 'react'
import { Eye, EyeOff, ArrowRight, Loader2 } from 'lucide-react'
import type { AuthUser, LoginCredentials } from '../services/auth'
import { login } from '../services/auth'
import logoUrl from '../assets/exto-logo-transparent.png'
import sedeUrl from '../assets/exto-sede.jpg'

interface Props {
  onLogin: (user: AuthUser) => void
}

export function LoginPage({ onLogin }: Props) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const credentials: LoginCredentials = { email, password }
      const user = await login(credentials)
      onLogin(user)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao entrar.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">

      {/* Left — branding */}
      <div
        className="hidden lg:flex flex-1 flex-col justify-center p-[48px] relative overflow-hidden"
        style={{
          backgroundImage: `url(${sedeUrl})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        {/* overlay escuro */}
        <div className="absolute inset-0" style={{ background: 'rgba(20,18,16,0.55)' }} />
        <div className="relative z-10">
          <div className="font-archivo font-semibold text-[11px] tracking-[0.16em] uppercase mb-[16px]" style={{ color: 'rgba(255,255,255,0.35)' }}>
            EXTOAPP
          </div>
          <h2 className="font-archivo font-semibold text-[36px] leading-[1.2] text-white mb-[16px]">
            Vocação para<br />fazer bem feito.
          </h2>
          <p className="font-hanken font-normal text-[15px] leading-[1.6]" style={{ color: 'rgba(255,255,255,0.5)', maxWidth: '380px' }}>
            Acesse seus aplicativos, acompanhe obras, gerencie solicitações e muito mais — direto do hub da Exto.
          </p>
        </div>

      </div>

      {/* Right — form */}
      <div className="w-full lg:w-[480px] flex-shrink-0 bg-surface flex flex-col items-center justify-center px-[48px] py-[48px]">
        <div className="w-full max-w-[360px]">
          <div className="flex justify-center mb-[36px]">
            <img src={logoUrl} alt="Exto" className="h-[130px] w-auto" />
          </div>

          <h1 className="font-archivo font-semibold text-[24px] leading-[1.2] text-ink mb-[6px]">
            Bem-vindo de volta
          </h1>
          <p className="font-hanken font-normal text-[14px] text-text-muted mb-[32px]">
            Entre com sua conta Exto para continuar.
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-[18px]">
            {/* Email */}
            <div className="flex flex-col gap-[6px]">
              <label className="font-hanken font-medium text-[13px] text-ink-soft">
                E-mail corporativo
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="voce@exto.com.br"
                required
                autoComplete="email"
                className="
                  h-[46px] border border-border-2 bg-bg-app rounded-[11px]
                  px-[14px] font-hanken font-normal text-[14px] text-ink
                  outline-none transition-all duration-150
                  focus:border-accent focus:shadow-[0_0_0_3px_rgba(174,58,35,0.12)]
                  focus:bg-surface
                "
              />
            </div>

            {/* Password */}
            <div className="flex flex-col gap-[6px]">
              <div className="flex items-center justify-between">
                <label className="font-hanken font-medium text-[13px] text-ink-soft">
                  Senha
                </label>
                <button
                  type="button"
                  className="font-hanken text-[12px] text-accent hover:text-[#8a2e1b] transition-colors duration-150 border-none bg-transparent cursor-pointer"
                >
                  Esqueci minha senha
                </button>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                  className="
                    w-full h-[46px] border border-border-2 bg-bg-app rounded-[11px]
                    pl-[14px] pr-[44px] font-hanken font-normal text-[14px] text-ink
                    outline-none transition-all duration-150
                    focus:border-accent focus:shadow-[0_0_0_3px_rgba(174,58,35,0.12)]
                    focus:bg-surface
                  "
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  className="absolute right-[13px] top-1/2 -translate-y-1/2 text-text-faint hover:text-text-muted border-none bg-transparent cursor-pointer transition-colors duration-150"
                >
                  {showPassword ? <EyeOff size={17} strokeWidth={1.7} /> : <Eye size={17} strokeWidth={1.7} />}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="font-hanken text-[13px] text-accent bg-[rgba(174,58,35,0.08)] px-[14px] py-[10px] rounded-[10px] animate-ex-float">
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="
                mt-[4px] h-[48px] w-full flex items-center justify-center gap-[9px]
                bg-accent text-white border-none rounded-[11px]
                font-hanken font-semibold text-[14px] cursor-pointer
                transition-all duration-150
                hover:brightness-[0.93] hover:-translate-y-[1px]
                disabled:opacity-60 disabled:cursor-not-allowed disabled:translate-y-0
              "
            >
              {loading ? (
                <Loader2 size={18} strokeWidth={2} className="animate-spin" />
              ) : (
                <>
                  Entrar
                  <ArrowRight size={17} strokeWidth={1.7} />
                </>
              )}
            </button>
          </form>

          <p className="text-center font-hanken text-[12px] text-text-faint mt-[28px]">
            Problemas para acessar? Fale com o{' '}
            <button className="text-accent hover:text-[#8a2e1b] transition-colors duration-150 border-none bg-transparent cursor-pointer font-hanken text-[12px]">
              Suporte & TI
            </button>
          </p>
        </div>
      </div>

    </div>
  )
}

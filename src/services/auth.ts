export interface LoginCredentials {
  email: string
  password: string
}

export interface AuthUser {
  id: string
  name: string
  role: string
  initials: string
  email: string
}

// Substitua esta função pela chamada real ao seu backend
export async function login(credentials: LoginCredentials): Promise<AuthUser> {
  // TODO: trocar por fetch/axios para sua API
  // Exemplo:
  // const res = await fetch('/api/auth/login', {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify(credentials),
  // })
  // if (!res.ok) throw new Error('Credenciais inválidas')
  // return res.json()

  await new Promise(r => setTimeout(r, 900)) // simula latência

  if (credentials.email === 'mariana@exto.com.br' && credentials.password === '123456') {
    return {
      id: '1',
      name: 'Mariana Alves',
      role: 'Coordenadora de Obras',
      initials: 'MA',
      email: credentials.email,
    }
  }

  throw new Error('E-mail ou senha incorretos.')
}

export async function logout(): Promise<void> {
  // TODO: chamar endpoint de logout se necessário
}

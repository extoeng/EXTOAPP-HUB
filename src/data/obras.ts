// AUTO-GERADO — não editar à mão.
// Fonte: "Exto - Tabela de Obras - R34.xls" (revisão R34); gerado por scripts/parse_obras.py.
// Para atualizar quando Suprimentos publicar uma revisão nova:
//   1. rode  python scripts/parse_obras.py src/data/obras.ts  apontando o SRC pro novo .xls
//   2. confira o diff e faça o build/deploy.

export interface EquipeMembro { cargo: string; nome: string; telefone: string }

export interface Obra {
  nome: string
  numero: string
  organizacao: string
  categoria: string
  aba: string
  documentos: Record<string, string>
  enderecos: Record<string, string>
  email: string
  telefones: string[]
  equipe: EquipeMembro[]
}

export const OBRAS_FONTE = "Exto - Tabela de Obras - R34.xls"
export const OBRAS_REVISAO = "R34"

export const OBRAS: Obra[] = [
  {
    "nome": "Exto Engenharia",
    "numero": "162",
    "organizacao": "Exto Engenharia e Construções Ltda.",
    "categoria": "EXTO - GERAL - STANDS FIXOS",
    "aba": "Geral / Sedes",
    "documentos": {
      "CNPJ": "51.945.632/0001-69",
      "IE": "110248887111"
    },
    "enderecos": {
      "Fatura": "Av. Eliseu de Almeida nº 1415 - Butantã - São Paulo/SP, CEP: 05533-000",
      "Entrega": "Av. Eliseu de Almeida nº 1415 - Butantã - São Paulo/SP, CEP: 05533-000"
    },
    "email": "",
    "telefones": [
      "11-3724-9500"
    ],
    "equipe": []
  },
  {
    "nome": "Exto Incorporações",
    "numero": "160",
    "organizacao": "Exto Incorporações e Empr. Imob. SA.",
    "categoria": "EXTO - GERAL - STANDS FIXOS",
    "aba": "Geral / Sedes",
    "documentos": {
      "CNPJ": "03.142.682/0001-65",
      "IE": "Isenta"
    },
    "enderecos": {
      "Fatura": "Av. Eliseu de Almeida nº 1415 - Butantã - São Paulo/SP, CEP: 05533-000",
      "Entrega": "Av. Eliseu de Almeida nº 1415 - Butantã - São Paulo/SP, CEP: 05533-000"
    },
    "email": "",
    "telefones": [
      "11-3724-9500"
    ],
    "equipe": []
  },
  {
    "nome": "GR8",
    "numero": "200",
    "organizacao": "GR8 Engenharia e Construções Ltda.",
    "categoria": "EXTO - GERAL - STANDS FIXOS",
    "aba": "Geral / Sedes",
    "documentos": {
      "CNPJ": "11.420.920/0001-85",
      "IE": "147.525.750-117"
    },
    "enderecos": {
      "Fatura": "Av. Eliseu de Almeida nº 1415 - Butantã - São Paulo/SP, CEP: 05533-000",
      "Entrega": "Av. Eliseu de Almeida nº 1415 - Butantã - São Paulo/SP, CEP: 05533-000"
    },
    "email": "",
    "telefones": [
      "11-3724-9606"
    ],
    "equipe": [
      {
        "cargo": "",
        "nome": "Flavio G.",
        "telefone": "11950585243"
      }
    ]
  },
  {
    "nome": "Casa Viva",
    "numero": "164",
    "organizacao": "Casa Viva Inc. e Construtora Ltda.",
    "categoria": "EXTO - GERAL - STANDS FIXOS",
    "aba": "Geral / Sedes",
    "documentos": {
      "CNPJ": "30.001.765/0001-07",
      "IE": "131476587113"
    },
    "enderecos": {
      "Fatura": "Av. Eliseu de Almeida nº 1415 - Butantã - São Paulo/SP, CEP: 05533-000",
      "Entrega": "Av. Eliseu de Almeida nº 1415 - Butantã - São Paulo/SP, CEP: 05533-000"
    },
    "email": "",
    "telefones": [
      "11-4710-3050"
    ],
    "equipe": []
  },
  {
    "nome": "Espaço Exto Morumbi",
    "numero": "",
    "organizacao": "Espaço Exto Morumbi",
    "categoria": "EXTO - GERAL - STANDS FIXOS",
    "aba": "Geral / Sedes",
    "documentos": {
      "CNPJ": "13.250.604/0001-38"
    },
    "enderecos": {
      "Fatura": "Av. Eliseu de Almeida nº 1415 - Butantã - São Paulo/SP, CEP: 05533-000",
      "Entrega": "Rua Nelson Gama de Oliveira nº 1411 - SP - 05734-150"
    },
    "email": "",
    "telefones": [
      "11-3740-4554"
    ],
    "equipe": []
  },
  {
    "nome": "Espaço Exto Perdizes",
    "numero": "",
    "organizacao": "Espaço Exto Perdizes",
    "categoria": "EXTO - GERAL - STANDS FIXOS",
    "aba": "Geral / Sedes",
    "documentos": {
      "CNPJ": "31.938.457/0001-75"
    },
    "enderecos": {
      "Fatura": "Av. Eliseu de Almeida nº 1415 - Butantã - São Paulo/SP, CEP: 05533-000",
      "Entrega": "Rua Dr. Homem de Melo, 867 - SP - 05007-002"
    },
    "email": "",
    "telefones": [
      "11- 4710-2200"
    ],
    "equipe": []
  },
  {
    "nome": "Blue Home Resort",
    "numero": "308",
    "organizacao": "Exto Bel",
    "categoria": "OBRAS EM ANDAMENTO",
    "aba": "Geral / Sedes",
    "documentos": {
      "CNPJ": "32.219.146/0001-19",
      "CNO": "90.013.43135/78",
      "IE": "Isenta"
    },
    "enderecos": {
      "Fatura": "Av. Eliseu de Almeida n° 1415 - Butantã - São Paulo/SP - CEP: 05533-000",
      "Entrega": "Avenida Pirajussara, 4123 - SP - 05534-000",
      "Cobrança": "Avenida Pirajussara, 4123 - SP - 05534-000"
    },
    "email": "rodrigo@exto.com.br",
    "telefones": [
      "1196638-0557"
    ],
    "equipe": [
      {
        "cargo": "",
        "nome": "Gerente:",
        "telefone": "Rodrigo"
      },
      {
        "cargo": "",
        "nome": "Engº Coord.:",
        "telefone": "Andre"
      },
      {
        "cargo": "",
        "nome": "Engº Resid.:",
        "telefone": "Bianca"
      },
      {
        "cargo": "",
        "nome": "Administr.:",
        "telefone": "Francisco"
      },
      {
        "cargo": "",
        "nome": "Administr.:",
        "telefone": "Andre B."
      }
    ]
  },
  {
    "nome": "Terraro",
    "numero": "312",
    "organizacao": "Exto Golden",
    "categoria": "OBRAS EM ANDAMENTO",
    "aba": "Geral / Sedes",
    "documentos": {
      "CNPJ": "34.908.022/0001-76",
      "CNO": "90.017.11025/75",
      "IE": "Isenta"
    },
    "enderecos": {
      "Fatura": "Av. Eliseu de Almeida n° 1415 - Butantã - São Paulo/SP - CEP: 05533-000",
      "Entrega": "Rua Tito, 837 - SP - 05051-000",
      "Cobrança": "Rua Tito, 837 - SP - 05051-000"
    },
    "email": "rodrigo@exto.com.br",
    "telefones": [
      "1196638-0557"
    ],
    "equipe": [
      {
        "cargo": "",
        "nome": "Gerente:",
        "telefone": "Rodrigo"
      },
      {
        "cargo": "",
        "nome": "Engº Coord.:",
        "telefone": "Rodrigo"
      },
      {
        "cargo": "",
        "nome": "Engº Resid.:",
        "telefone": "Augusto"
      },
      {
        "cargo": "",
        "nome": "Administr.:",
        "telefone": "Eronildo"
      }
    ]
  },
  {
    "nome": "Ledge",
    "numero": "342",
    "organizacao": "TGSP-85",
    "categoria": "OBRAS EM ANDAMENTO",
    "aba": "Geral / Sedes",
    "documentos": {
      "CNPJ": "34.583.560/0001-38",
      "CNO": "90.017.49873/75",
      "IE": "Isenta"
    },
    "enderecos": {
      "Fatura": "Av. Eliseu de Almeida n° 1415 - Butantã - São Paulo/SP - CEP: 05533-000",
      "Entrega": "Rua Caribe, 53 - SP - 04562-060",
      "Cobrança": "(Rua Andiroba, 34 - SP - 0462-070"
    },
    "email": "alberto@exto.com.br",
    "telefones": [
      "1196631-2632"
    ],
    "equipe": [
      {
        "cargo": "",
        "nome": "Gerente:",
        "telefone": "Alberto"
      },
      {
        "cargo": "",
        "nome": "Engº Coord.:",
        "telefone": "Leandro"
      },
      {
        "cargo": "",
        "nome": "Engº Resid.:",
        "telefone": "Felipe"
      },
      {
        "cargo": "",
        "nome": "Administr.:",
        "telefone": "J. Demerson"
      }
    ]
  },
  {
    "nome": "Excellence Guedala",
    "numero": "330",
    "organizacao": "Exto Line",
    "categoria": "OBRAS EM ANDAMENTO",
    "aba": "Geral / Sedes",
    "documentos": {
      "CNPJ": "43.026.339/0001-70",
      "IE": "Isenta",
      "IM": "70260915"
    },
    "enderecos": {
      "Fatura": "Av. Eliseu de Almeida nº 1415 - Butantã - São Paulo/SP - CEP: 05533-000",
      "Entrega": "Rua Tres Irmaos, 176 - SP - 05615-190",
      "Cobrança": "Rua Tres Irmaos, 176 - SP - 05615-190"
    },
    "email": "rodrigo@exto.com.br",
    "telefones": [
      "1196638-0557"
    ],
    "equipe": [
      {
        "cargo": "",
        "nome": "Gerente:",
        "telefone": "Rodrigo"
      },
      {
        "cargo": "",
        "nome": "Engº Coord.:",
        "telefone": "Rodrigo"
      },
      {
        "cargo": "",
        "nome": "Engº Resid.:",
        "telefone": "Renan"
      },
      {
        "cargo": "",
        "nome": "Administr.:",
        "telefone": "Adailson"
      }
    ]
  },
  {
    "nome": "Excellence Perdizes",
    "numero": "316",
    "organizacao": "Exto Blue",
    "categoria": "OBRAS EM ANDAMENTO",
    "aba": "Geral / Sedes",
    "documentos": {
      "CNPJ": "35.251.181/0001--03",
      "CNO": "90.013.43135/78",
      "IE": "Isenta"
    },
    "enderecos": {
      "Fatura": "Av. Eliseu de Almeida nº 1415 - Butantã - São Paulo/SP - CEP: 05533-000",
      "Entrega": "Rua Itapicuru, 849 - SP - 05006-000",
      "Cobrança": "Rua Itapicuru, 849 - SP - 05006-000"
    },
    "email": "rodrigo@exto.com.br",
    "telefones": [
      "1196638-0557"
    ],
    "equipe": [
      {
        "cargo": "",
        "nome": "Gerente:",
        "telefone": "Rodrigo"
      },
      {
        "cargo": "",
        "nome": "Engº Coord.:",
        "telefone": "Augusto"
      },
      {
        "cargo": "",
        "nome": "Engº Resid.:",
        "telefone": "Gabriel Armada"
      },
      {
        "cargo": "",
        "nome": "Administr.:",
        "telefone": "J. Augusto"
      }
    ]
  },
  {
    "nome": "Splend",
    "numero": "304",
    "organizacao": "Exto Mar",
    "categoria": "OBRAS EM ANDAMENTO",
    "aba": "Geral / Sedes",
    "documentos": {
      "CNPJ": "31.994.680/0001-30",
      "IE": "Isenta"
    },
    "enderecos": {
      "Fatura": "Av. Eliseu de Almeida nº 1415 - Butantã - São Paulo/SP - CEP: 05533-000",
      "Entrega": "Alameda Juriti, 648 / Arapanes,  SP - 04520-001",
      "Cobrança": "Av. Eliseu de Almeida nº 1415 - Butantã - SP - 05533-000"
    },
    "email": "alberto@exto.com.br",
    "telefones": [
      "1196631-2632"
    ],
    "equipe": [
      {
        "cargo": "",
        "nome": "Gerente:",
        "telefone": "Alberto"
      },
      {
        "cargo": "",
        "nome": "Engº Coord.:",
        "telefone": "Alberto"
      },
      {
        "cargo": "",
        "nome": "Engº Resid.:",
        "telefone": "Murilo"
      },
      {
        "cargo": "",
        "nome": "Administr.:",
        "telefone": "Daiana"
      }
    ]
  },
  {
    "nome": "The View",
    "numero": "328",
    "organizacao": "Exto Land",
    "categoria": "OBRAS EM ANDAMENTO",
    "aba": "Geral / Sedes",
    "documentos": {
      "CNPJ": "43.026.634/0001-26",
      "IE": "Isenta"
    },
    "enderecos": {
      "Fatura": "Av. Eliseu de Almeida n° 1415 - Butantã - São Paulo/SP - 05533-000",
      "Entrega": "Av. Ascendino Reis, 603 - SP - 04027-000",
      "Cobrança": "Av. Ascendino Reis, 603 - SP - 04027-000"
    },
    "email": "alberto@exto.com.br",
    "telefones": [
      "1196631-2632"
    ],
    "equipe": [
      {
        "cargo": "",
        "nome": "Gerente:",
        "telefone": "Alberto"
      },
      {
        "cargo": "",
        "nome": "Engº Coord.:",
        "telefone": "Alberto"
      },
      {
        "cargo": "",
        "nome": "Engº Resid.:",
        "telefone": "J. Fernandes"
      },
      {
        "cargo": "",
        "nome": "Administr.:",
        "telefone": "Ana"
      }
    ]
  },
  {
    "nome": "Legacy Guedala",
    "numero": "338",
    "organizacao": "Exto Time",
    "categoria": "OBRAS EM ANDAMENTO",
    "aba": "Geral / Sedes",
    "documentos": {
      "CNPJ": "43.026.615/0001-08",
      "IE": "Isenta"
    },
    "enderecos": {
      "Fatura": "Av. Eliseu de Almeida n° 1415 - Butantã - São Paulo/SP - 05533-000",
      "Entrega": "Carlos Lima Morel, 85 - SP - 05615-040",
      "Cobrança": "Carlos Lima Morel, 85 - SP - 05615-040"
    },
    "email": "",
    "telefones": [
      "11966323742"
    ],
    "equipe": [
      {
        "cargo": "",
        "nome": "Gerente:",
        "telefone": "Fabrício"
      },
      {
        "cargo": "",
        "nome": "Engº Coord.:",
        "telefone": "André Colli"
      },
      {
        "cargo": "",
        "nome": "Engº Resid.:",
        "telefone": ""
      },
      {
        "cargo": "",
        "nome": "Administr.:",
        "telefone": "André Barros"
      }
    ]
  },
  {
    "nome": "Soul of Madalena",
    "numero": "332",
    "organizacao": "Exto Led",
    "categoria": "OBRAS EM ANDAMENTO",
    "aba": "Geral / Sedes",
    "documentos": {
      "CNPJ": "43.026.373/0001-44",
      "IE": "Isenta"
    },
    "enderecos": {
      "Fatura": "Av. Eliseu de Almeida nº 1415 - Butantã - São Paulo/SP - 05533-000",
      "Entrega": "Rua Paulistania, 220 - SP  - SP - 05440-000",
      "Cobrança": "Rua Paulistania, 220 - SP  - SP - 05440-000"
    },
    "email": "led@exto.com.br",
    "telefones": [
      "11966323742"
    ],
    "equipe": [
      {
        "cargo": "",
        "nome": "Gerente:",
        "telefone": "Fabrício"
      },
      {
        "cargo": "",
        "nome": "Engº Coord.:",
        "telefone": "Engº Augusto"
      },
      {
        "cargo": "",
        "nome": "Engº Resid.:",
        "telefone": "Mariane Valver"
      },
      {
        "cargo": "",
        "nome": "Administr.:",
        "telefone": "Ronaldo"
      }
    ]
  },
  {
    "nome": "Chateau Jardin",
    "numero": "362 e 364",
    "organizacao": "Chateau Jardin",
    "categoria": "OBRAS EM ANDAMENTO",
    "aba": "Geral / Sedes",
    "documentos": {
      "CNPJ": "42.447.379/0001-22",
      "IE": "Isenta"
    },
    "enderecos": {},
    "email": "",
    "telefones": [
      "11966323742"
    ],
    "equipe": [
      {
        "cargo": "",
        "nome": "Gerente:",
        "telefone": "Fabrício"
      },
      {
        "cargo": "",
        "nome": "Engº Coord.:",
        "telefone": ""
      },
      {
        "cargo": "",
        "nome": "Engº Resid.:",
        "telefone": ""
      },
      {
        "cargo": "",
        "nome": "Administr.:",
        "telefone": ""
      }
    ]
  },
  {
    "nome": "Maracatins - Selection",
    "numero": "344",
    "organizacao": "Exto Key",
    "categoria": "PRÓXIMOS LANÇAMENTOS",
    "aba": "Próximos Lançamentos",
    "documentos": {
      "CNPJ": "52.347.670/0001-82",
      "IE": "Isenta"
    },
    "enderecos": {
      "Fatura": "Av. Eliseu de Almeida n° 1415 - Butantã - São Paulo/SP - 05533-000",
      "Entrega": "Alameda dos Maracatins, nº 857 - 04089-012",
      "Cobrança": "Alameda dos Maracatins, nº 857 - 04089-012"
    },
    "email": "",
    "telefones": [],
    "equipe": [
      {
        "cargo": "Gerente",
        "nome": "Fabrício",
        "telefone": "11966323742"
      }
    ]
  },
  {
    "nome": "Turiassu - Palm",
    "numero": "326",
    "organizacao": "Exto Foco",
    "categoria": "PRÓXIMOS LANÇAMENTOS",
    "aba": "Próximos Lançamentos",
    "documentos": {
      "CNPJ": "22.108.904/0001-78",
      "IE": "Isenta"
    },
    "enderecos": {
      "Fatura": "Av. Eliseu de Almeida n° 1415 - Butantã - São Paulo/SP - 05533-000",
      "Entrega": "Rua Turiassu, 59 - SP - 05005-001",
      "Cobrança": "Rua Turiassu, 59 - SP - 05005-001"
    },
    "email": "",
    "telefones": [],
    "equipe": [
      {
        "cargo": "Gerente",
        "nome": "Fabrício",
        "telefone": "11966323742"
      }
    ]
  },
  {
    "nome": "Pinto Gonçalves",
    "numero": "296",
    "organizacao": "Exto Cor",
    "categoria": "PRÓXIMOS LANÇAMENTOS",
    "aba": "Próximos Lançamentos",
    "documentos": {
      "CNPJ": "29.773.258/0001-02",
      "IE": "Isenta"
    },
    "enderecos": {
      "Fatura": "Av. Eliseu de Almeida n° 1415 - Butantã - São Paulo/SP - 05533-000",
      "Entrega": "Rua Pinto Gonçalves, 123 - SP - 05005-010",
      "Cobrança": "Rua Pinto Gonçalves, 123 - SP-  05005-010"
    },
    "email": "",
    "telefones": [],
    "equipe": [
      {
        "cargo": "Gerente",
        "nome": "Fabrício",
        "telefone": "11966323742"
      }
    ]
  },
  {
    "nome": "Ativa (usada para patrimonio - cirquinho)",
    "numero": "248",
    "organizacao": "Exto Forma",
    "categoria": "SPEs EM ABERTO",
    "aba": "SPEs no Aguardo",
    "documentos": {
      "CNPJ": "19.082.397/0001-36",
      "CNO": "90.002.77.185/75",
      "IE": "Isenta"
    },
    "enderecos": {
      "Fatura": "Av. Eliseu de Almeida nº 1415 - Butantã - São Paulo/SP - 05533-000",
      "Entrega": "Av. Ulisses Reis de Matos, 155 - SP - 05686-020",
      "Cobrança": "Av. Ulisses Reis de Matos, 155 - SP - 05686-020"
    },
    "email": "",
    "telefones": [],
    "equipe": [
      {
        "cargo": "Gerente",
        "nome": "Fabrício",
        "telefone": "11966323742"
      }
    ]
  },
  {
    "nome": "Abdo Ambuba",
    "numero": "254",
    "organizacao": "Exto Fla",
    "categoria": "SPEs EM ABERTO",
    "aba": "SPEs no Aguardo",
    "documentos": {
      "CNPJ": "19.269.498/0001-10",
      "IE": "Isenta"
    },
    "enderecos": {
      "Fatura": "Av. Eliseu de Almeida nº 1415 - Butantã - São Paulo/SP - 05533-000",
      "Entrega": "Rua Abdo Ambuba, 263 - SP - 05725-030",
      "Cobrança": "Rua Abdo Ambuba, 263 - SP - 05725-030"
    },
    "email": "",
    "telefones": [],
    "equipe": [
      {
        "cargo": "Gerente",
        "nome": "Fabrício",
        "telefone": "11966323742"
      }
    ]
  },
  {
    "nome": "Av. Pompeia",
    "numero": "258",
    "organizacao": "Exto Terra",
    "categoria": "SPEs EM ABERTO",
    "aba": "SPEs no Aguardo",
    "documentos": {
      "CNPJ": "19.269.584/0001-23",
      "IE": "Isenta"
    },
    "enderecos": {
      "Fatura": "Av. Eliseu de Almeida nº 1415 - Butantã - São Paulo/SP - 05533-000",
      "Entrega": "Av Pompéia, 2195 - SP - 05023-001",
      "Cobrança": "Av Pompéia, 2195 - SP - 05023-001"
    },
    "email": "",
    "telefones": [],
    "equipe": [
      {
        "cargo": "Gerente",
        "nome": "Fabrício",
        "telefone": "11966323742"
      }
    ]
  },
  {
    "nome": "Gastão Mesquita, 791",
    "numero": "238",
    "organizacao": "Exto Amarilis",
    "categoria": "SPEs EM ABERTO",
    "aba": "SPEs no Aguardo",
    "documentos": {
      "CNPJ": "15.772.372/0001-03",
      "IE": "Isenta"
    },
    "enderecos": {
      "Fatura": "Av. Eliseu de Almeida n° 1415 - Butantã - São Paulo/SP - 05533-000",
      "Entrega": "Rua Ministro G. Mesquita, 791 - SP - 05012-010",
      "Cobrança": "Rua Ministro G. Mesquita, 791 - SP - 05012-010"
    },
    "email": "",
    "telefones": [],
    "equipe": [
      {
        "cargo": "Gerente",
        "nome": "Fabrício",
        "telefone": "11966323742"
      }
    ]
  },
  {
    "nome": "L.A",
    "numero": "276",
    "organizacao": "L.A",
    "categoria": "SPEs EM ABERTO",
    "aba": "SPEs no Aguardo",
    "documentos": {
      "CNPJ": "21.376.036/0001-44",
      "CNO": "90.010.497.27/76",
      "IE": "isenta"
    },
    "enderecos": {
      "Fatura": "Av. Eliseu de Almeida nº 1415 - Butantã - São Paulo/SP - 05533-000",
      "Entrega": "Rua Lincoln de Albuquerque, 73 - SP - 05004-010",
      "Cobrança": "Rua Lincoln de Albuquerque, 73 - SP - 05004-010"
    },
    "email": "",
    "telefones": [],
    "equipe": [
      {
        "cargo": "Gerente",
        "nome": "Fabrício",
        "telefone": "11966323742"
      }
    ]
  },
  {
    "nome": "Em aberto (futura compra)",
    "numero": "252",
    "organizacao": "Exto Sami",
    "categoria": "SPEs EM ABERTO",
    "aba": "SPEs no Aguardo",
    "documentos": {
      "CNPJ": "19.267.686/0001-00",
      "IE": "Isenta"
    },
    "enderecos": {
      "Fatura": "Av. Eliseu de Almeida nº 1415 - Butantã - São Paulo/SP - 05533-000"
    },
    "email": "",
    "telefones": [],
    "equipe": [
      {
        "cargo": "Gerente",
        "nome": "Fabrício",
        "telefone": "11966323742"
      }
    ]
  },
  {
    "nome": "Gastão Mesquita, 772",
    "numero": "240",
    "organizacao": "Exto Bali",
    "categoria": "SPEs EM ABERTO",
    "aba": "SPEs no Aguardo",
    "documentos": {
      "CNPJ": "18.342.702/0001-19",
      "IE": "Isenta"
    },
    "enderecos": {
      "Fatura": "Av. Eliseu de Almeida n° 1415 - Butantã - São Paulo/SP - 05533-000",
      "Entrega": "Rua Ministro Gastão Mesquita, 772 - SP - 05012-010",
      "Cobrança": "Rua Ministro Gastão Mesquita, 772 - SP - 05012-010"
    },
    "email": "",
    "telefones": [],
    "equipe": [
      {
        "cargo": "Gerente",
        "nome": "Fabrício",
        "telefone": "11966323742"
      }
    ]
  },
  {
    "nome": "Leandro Dupret",
    "numero": "298",
    "organizacao": "Exto Vila",
    "categoria": "SPEs EM ABERTO",
    "aba": "SPEs no Aguardo",
    "documentos": {
      "CNPJ": "29.787.339/0001-61",
      "IE": "Isenta"
    },
    "enderecos": {
      "Fatura": "Av. Eliseu de Almeida n° 1415 - Butantã - São Paulo/SP - 05533-000",
      "Entrega": "Rua Leandro Dupret, 643/645 - SP - 04025-012",
      "Cobrança": "Rua Leandro Dupret, 643/645 - SP - 04025-012"
    },
    "email": "",
    "telefones": [],
    "equipe": [
      {
        "cargo": "Gerente",
        "nome": "Fabrício",
        "telefone": "11966323742"
      }
    ]
  },
  {
    "nome": "Andre Ampere",
    "numero": "314",
    "organizacao": "Exto Greta",
    "categoria": "SPEs EM ABERTO",
    "aba": "SPEs no Aguardo",
    "documentos": {
      "CNPJ": "35.034.431/0001-53",
      "IE": "Isenta"
    },
    "enderecos": {
      "Fatura": "Av. Eliseu de Almeida n° 1415 - Butantã - São Paulo/SP - 05533-000",
      "Entrega": "Rua Andre Ampere, 190 - SP - 04562-080",
      "Cobrança": "Rua Andre Ampere, 190 - SP - 04562-080"
    },
    "email": "",
    "telefones": [],
    "equipe": [
      {
        "cargo": "Gerente",
        "nome": "Fabrício",
        "telefone": "11966323742"
      }
    ]
  },
  {
    "nome": "Bartira",
    "numero": "320",
    "organizacao": "Exto Sky",
    "categoria": "SPEs EM ABERTO",
    "aba": "SPEs no Aguardo",
    "documentos": {
      "CNPJ": "37.851.279/0001-27",
      "IE": "Isenta"
    },
    "enderecos": {
      "Fatura": "Av. Eliseu de Almeida n° 1415 - Butantã - São Paulo/SP - 05533-000",
      "Entrega": "Rua Bartira, 373 - SP - 05009-000",
      "Cobrança": "Rua Bartira, 373 - SP - 05009-000"
    },
    "email": "",
    "telefones": [],
    "equipe": [
      {
        "cargo": "Gerente",
        "nome": "Fabrício",
        "telefone": "11966323742"
      }
    ]
  },
  {
    "nome": "Pedro de Toledo",
    "numero": "322",
    "organizacao": "Exto Soul",
    "categoria": "SPEs EM ABERTO",
    "aba": "SPEs no Aguardo",
    "documentos": {
      "CNPJ": "37.851.259/0001-56",
      "IE": "Isenta"
    },
    "enderecos": {
      "Fatura": "Av. Eliseu de Almeida n° 1415 - Butantã - São Paulo/SP - 05533-000",
      "Entrega": "Rua Pedro de Toledo, 443 - SP - 04039-031",
      "Cobrança": "Rua Pedro de Toledo, 443 - SP - 04039-031"
    },
    "email": "",
    "telefones": [],
    "equipe": [
      {
        "cargo": "Gerente",
        "nome": "Fabrício",
        "telefone": "11966323742"
      }
    ]
  },
  {
    "nome": "Em aberto (futura compra)",
    "numero": "324",
    "organizacao": "Exto Blanc",
    "categoria": "SPEs EM ABERTO",
    "aba": "SPEs no Aguardo",
    "documentos": {
      "CNPJ": "37.851.239/0001-85",
      "IE": "Isenta"
    },
    "enderecos": {
      "Fatura": "Av. Eliseu de Almeida n° 1415 - Butantã - São Paulo/SP - 05533-000"
    },
    "email": "",
    "telefones": [],
    "equipe": [
      {
        "cargo": "Gerente",
        "nome": "Fabrício",
        "telefone": "11966323742"
      }
    ]
  },
  {
    "nome": "Em aberto (futura compra)",
    "numero": "334",
    "organizacao": "Exto Air",
    "categoria": "SPEs EM ABERTO",
    "aba": "SPEs no Aguardo",
    "documentos": {
      "CNPJ": "43.026.450/0001-66",
      "IE": "Isenta"
    },
    "enderecos": {
      "Fatura": "Av. Eliseu de Almeida n° 1415 - Butantã - São Paulo/SP - 05533-000"
    },
    "email": "",
    "telefones": [],
    "equipe": [
      {
        "cargo": "Gerente",
        "nome": "Fabrício",
        "telefone": "11966323742"
      }
    ]
  },
  {
    "nome": "Em aberto (futura compra)",
    "numero": "346",
    "organizacao": "Exto Franc",
    "categoria": "SPEs EM ABERTO",
    "aba": "SPEs no Aguardo",
    "documentos": {
      "CNPJ": "52.358.680/0001-13",
      "IE": "Isenta"
    },
    "enderecos": {
      "Fatura": "Av. Eliseu de Almeida n° 1415 - Butantã - São Paulo/SP - 05533-000"
    },
    "email": "",
    "telefones": [],
    "equipe": [
      {
        "cargo": "Gerente",
        "nome": "Fabrício",
        "telefone": "11966323742"
      }
    ]
  },
  {
    "nome": "Em aberto (futura compra)",
    "numero": "348",
    "organizacao": "Exto Eco",
    "categoria": "SPEs EM ABERTO",
    "aba": "SPEs no Aguardo",
    "documentos": {
      "CNPJ": "52.347.60/0001-24",
      "IE": "Isenta"
    },
    "enderecos": {
      "Fatura": "Av. Eliseu de Almeida n° 1415 - Butantã - São Paulo/SP - 05533-000"
    },
    "email": "",
    "telefones": [],
    "equipe": [
      {
        "cargo": "Gerente",
        "nome": "Fabrício",
        "telefone": "11966323742"
      }
    ]
  },
  {
    "nome": "Lamp - STAND",
    "numero": "306",
    "organizacao": "Exto Rubi",
    "categoria": "OBRAS RECÉM FINALIZADAS - ASSITENCIA TECNICA",
    "aba": "Obras / SPEs Finalizadas",
    "documentos": {
      "CNPJ": "31.968.572/0001-92",
      "CNO": "90.011.95345/79",
      "IE": "Isenta"
    },
    "enderecos": {
      "Fatura": "Av. Eliseu de Almeida n° 1415 - Butantã - São Paulo/SP - CEP: 05533-000",
      "Entrega": "R. Campevas, 300 - SP - 05016-010",
      "Cobrança": "R. Campevas, 300 - SP - 05016-010"
    },
    "email": "rubi@exto.com.br",
    "telefones": [],
    "equipe": [
      {
        "cargo": "Gerente",
        "nome": "Roger",
        "telefone": "11989156810"
      },
      {
        "cargo": "Engº Coord.",
        "nome": "Roger",
        "telefone": "11989156810"
      },
      {
        "cargo": "Engº Resid.",
        "nome": "Guilherme",
        "telefone": ""
      },
      {
        "cargo": "Administr.",
        "nome": "Cida",
        "telefone": "11974313067"
      }
    ]
  },
  {
    "nome": "Upper East - EXTO STORE",
    "numero": "318",
    "organizacao": "Exto Corner",
    "categoria": "OBRAS RECÉM FINALIZADAS - ASSITENCIA TECNICA",
    "aba": "Obras / SPEs Finalizadas",
    "documentos": {
      "CNPJ": "31.059.077/0001-60",
      "CNO": "90.010.48062/79",
      "IE": "Isenta"
    },
    "enderecos": {
      "Fatura": "Av. Eliseu de Almeida n° 1415 - Butantã - São Paulo/SP - CEP: 05533-000",
      "Entrega": "Rua Minerva, 241 - SP - 05007-031",
      "Cobrança": "Rua Minerva, 241 - SP - 05007-031"
    },
    "email": "corner@exto.com.br",
    "telefones": [],
    "equipe": [
      {
        "cargo": "Gerente",
        "nome": "Alberto",
        "telefone": "11966312632"
      },
      {
        "cargo": "Engº Coord.",
        "nome": "Alberto",
        "telefone": "11966312632"
      },
      {
        "cargo": "Engº Resid.",
        "nome": "Murilo",
        "telefone": "11984063238"
      },
      {
        "cargo": "Administr.",
        "nome": "Jose A.",
        "telefone": "11972322008"
      }
    ]
  },
  {
    "nome": "Upper West - EXTO STORE",
    "numero": "302",
    "organizacao": "Exto Sun",
    "categoria": "OBRAS RECÉM FINALIZADAS - ASSITENCIA TECNICA",
    "aba": "Obras / SPEs Finalizadas",
    "documentos": {
      "CNPJ": "31.938.457/0001-75",
      "CNO": "90.010.48062/79",
      "IE": "Isenta"
    },
    "enderecos": {
      "Fatura": "Av. Eliseu de Almeida n° 1415 - Butantã - São Paulo/SP - CEP: 05533-000",
      "Entrega": "Rua Minerva, 268 - SP - 05007-031",
      "Cobrança": "Rua Minerva, 268 - SP - 05007-031"
    },
    "email": "sun@exto.com.br",
    "telefones": [],
    "equipe": [
      {
        "cargo": "Gerente",
        "nome": "Alberto",
        "telefone": "11966312632"
      },
      {
        "cargo": "Engº Coord.",
        "nome": "Alberto",
        "telefone": "11966312632"
      },
      {
        "cargo": "Engº Resid.",
        "nome": "Leonardo",
        "telefone": "11989501056"
      },
      {
        "cargo": "Administr.",
        "nome": "Daiana",
        "telefone": "11976844926"
      }
    ]
  },
  {
    "nome": "Mondo",
    "numero": "234",
    "organizacao": "Exto Milos",
    "categoria": "OBRAS RECÉM FINALIZADAS - ASSITENCIA TECNICA",
    "aba": "Obras / SPEs Finalizadas",
    "documentos": {
      "CNPJ": "13.250.604/0001-38",
      "CNO": "51.222.20370/79",
      "IE": "Isenta"
    },
    "enderecos": {
      "Fatura": "Av. Eliseu de Almeida n° 1415 - Butantã - São Paulo/SP - CEP: 05533-000",
      "Entrega": "R. Carvalho de Freitas, 285 - Morumbi, São Paulo - SP - 05728-030",
      "Cobrança": "R. Carvalho de Freitas, 285 - Morumbi, São Paulo - SP - 05728-030"
    },
    "email": "milos@exto.com.br",
    "telefones": [],
    "equipe": [
      {
        "cargo": "Gerente",
        "nome": "Rodrigo",
        "telefone": "11966380557"
      },
      {
        "cargo": "Eng° Coord.",
        "nome": "Rodrigo",
        "telefone": "11966380557"
      },
      {
        "cargo": "Eng° Resid.",
        "nome": "Renan",
        "telefone": "11997619545"
      },
      {
        "cargo": "Administr.",
        "nome": "Adailson",
        "telefone": "11976990076"
      }
    ]
  },
  {
    "nome": "Sintonia",
    "numero": "310",
    "organizacao": "Alto das Perdizes",
    "categoria": "OBRAS RECÉM FINALIZADAS - ASSITENCIA TECNICA",
    "aba": "Obras / SPEs Finalizadas",
    "documentos": {
      "CNPJ": "28.113.239/0001-97",
      "CNO": "90.006.03973/78",
      "IE": "Isenta"
    },
    "enderecos": {
      "Fatura": "Av. Eliseu de Almeida n° 1415 - Butantã - São Paulo/SP - CEP: 05533-000",
      "Entrega": "Rua Campevas, 238 - Perdizes - SP - 05016-010",
      "Cobrança": "Rua Campevas, 238 - Perdizes - SP - 05016-010"
    },
    "email": "altodasperdizes@exto.com.br",
    "telefones": [],
    "equipe": [
      {
        "cargo": "Gerente",
        "nome": "Roger",
        "telefone": "11989156810"
      },
      {
        "cargo": "Eng° Resid.",
        "nome": "Augusto",
        "telefone": "11997874142"
      },
      {
        "cargo": "Eng° Resid.",
        "nome": "Alexandre",
        "telefone": "11947622458"
      },
      {
        "cargo": "Administr.",
        "nome": "Jose D.",
        "telefone": "11988615703"
      }
    ]
  },
  {
    "nome": "Only Cidade Jardim",
    "numero": "266",
    "organizacao": "Exto Vista",
    "categoria": "OBRAS RECÉM FINALIZADAS - ASSITENCIA TECNICA",
    "aba": "Obras / SPEs Finalizadas",
    "documentos": {
      "CNPJ": "20.391.698/0001-20",
      "CNO": "51.242.56576/78",
      "IE": "Isenta"
    },
    "enderecos": {
      "Fatura": "Av. Eliseu de Almeida n° 1415 - Butantã - São Paulo/SP - 05533-000",
      "Entrega": "Rua Duquesa de Goias, 825 - SP - 05686-002",
      "Cobrança": "Rua Duquesa de Goias, 825 - SP - 05686-002"
    },
    "email": "",
    "telefones": [],
    "equipe": [
      {
        "cargo": "Gerente",
        "nome": "Alberto",
        "telefone": "11966312632"
      },
      {
        "cargo": "Engº Coord.",
        "nome": "Alberto",
        "telefone": "11966312632"
      },
      {
        "cargo": "Engº Resid.",
        "nome": "André",
        "telefone": "11966234609"
      },
      {
        "cargo": "Administr.",
        "nome": "Francisco",
        "telefone": "11989074535"
      }
    ]
  },
  {
    "nome": "Etern",
    "numero": "278",
    "organizacao": "Exto Red",
    "categoria": "OBRAS RECÉM FINALIZADAS - ASSITENCIA TECNICA",
    "aba": "Obras / SPEs Finalizadas",
    "documentos": {
      "CNPJ": "22.108.885/0001-80",
      "CNO": "90.001.64930/78",
      "IE": "Isenta"
    },
    "enderecos": {
      "Fatura": "Av. Eliseu de Almeida n° 1415 - Butantã - São Paulo/SP - 05533-000",
      "Entrega": "Rua Jauaperi, 411 - SP - 04523-011",
      "Cobrança": "Rua Jauaperi, 411 - SP - 04523-011"
    },
    "email": "",
    "telefones": [],
    "equipe": [
      {
        "cargo": "Gerente",
        "nome": "Willian",
        "telefone": "11966374116"
      },
      {
        "cargo": "Engº Coord.",
        "nome": "Alberto",
        "telefone": "11966312632"
      },
      {
        "cargo": "Engº Resid.",
        "nome": "Julia",
        "telefone": "11976649509"
      },
      {
        "cargo": "Administr.",
        "nome": "Carlito",
        "telefone": "11976844926"
      }
    ]
  },
  {
    "nome": "Green",
    "numero": "246",
    "organizacao": "Exto Zeta",
    "categoria": "OBRAS RECÉM FINALIZADAS - ASSITENCIA TECNICA",
    "aba": "Obras / SPEs Finalizadas",
    "documentos": {
      "CNPJ": "19.082.377/0001-65",
      "CNO": "90.003.06764/70",
      "IE": "Isenta"
    },
    "enderecos": {
      "Fatura": "Av. Eliseu de Almeida n° 1415 - Butantã - São Paulo/SP - 05533-000",
      "Entrega": "Rua Carlos Lima Morel, 180 - SP - 05612-040",
      "Cobrança": "Rua Carlos Lima Morel, 180 - SP - 05612-040"
    },
    "email": "",
    "telefones": [],
    "equipe": [
      {
        "cargo": "Gerente",
        "nome": "Rodrigo",
        "telefone": "11966380557"
      },
      {
        "cargo": "Engº Coord.",
        "nome": "Rodrigo",
        "telefone": "11966380557"
      },
      {
        "cargo": "Engº Resid.",
        "nome": "Leandro",
        "telefone": "11976608029"
      },
      {
        "cargo": "Administr.",
        "nome": "Adailson",
        "telefone": "11976990076"
      }
    ]
  },
  {
    "nome": "Le Reve",
    "numero": "115",
    "organizacao": "Exto Ecu",
    "categoria": "OBRAS RECÉM FINALIZADAS - ASSITENCIA TECNICA",
    "aba": "Obras / SPEs Finalizadas",
    "documentos": {
      "CNPJ": "08.824.299/0001-00",
      "CNO": "90.001.64934/77",
      "IE": "Isenta"
    },
    "enderecos": {
      "Fatura": "Av. Eliseu de Almeida n° 1415 - Butantã - São Paulo/SP - CEP: 05533-000",
      "Entrega": "Rua Cuevas n° 100 - SP - 05076-050",
      "Cobrança": "Rua Cuevas n° 100 - SP - 05076-050"
    },
    "email": "ecu@exto.com.br",
    "telefones": [],
    "equipe": [
      {
        "cargo": "Gerente",
        "nome": "Rodrigo",
        "telefone": "11966380557"
      },
      {
        "cargo": "Engº Coord.",
        "nome": "Rodrigo",
        "telefone": "11966380557"
      },
      {
        "cargo": "Engº Resid.",
        "nome": "Gabi",
        "telefone": "11980207505"
      },
      {
        "cargo": "Administr.",
        "nome": "Ronaldo",
        "telefone": "11976914758"
      }
    ]
  },
  {
    "nome": "Inspire",
    "numero": "260",
    "organizacao": "Exto Bra",
    "categoria": "OBRAS RECÉM FINALIZADAS - ASSITENCIA TECNICA",
    "aba": "Obras / SPEs Finalizadas",
    "documentos": {
      "CNPJ": "19.269.530/0001-68",
      "CNO": "90.004.53907/71",
      "IE": "Isenta"
    },
    "enderecos": {
      "Fatura": "Av. Eliseu de Almeida n° 1415 - Butantã - São Paulo/SP - 05533-000",
      "Entrega": "Rua Eça de Queiroz,247 - SP - 04011-050",
      "Cobrança": "Rua Eça de Queiroz,247 - SP - 04011-050"
    },
    "email": "",
    "telefones": [],
    "equipe": [
      {
        "cargo": "Gerente",
        "nome": "Roger",
        "telefone": "11989156810"
      },
      {
        "cargo": "Engº Coord.",
        "nome": "Roger",
        "telefone": "11989156810"
      },
      {
        "cargo": "Engº Resid.",
        "nome": "André",
        "telefone": "11966234609"
      },
      {
        "cargo": "Administr.",
        "nome": "Cida",
        "telefone": "11974313067"
      }
    ]
  },
  {
    "nome": "Essencia",
    "numero": "280",
    "organizacao": "Exto Seta",
    "categoria": "OBRAS RECÉM FINALIZADAS - ASSITENCIA TECNICA",
    "aba": "Obras / SPEs Finalizadas",
    "documentos": {
      "CNPJ": "22.109.801/0001-22",
      "CNO": "90.001.47542/77",
      "IE": "Isenta"
    },
    "enderecos": {
      "Fatura": "Av. Eliseu de Almeida n° 1415 - Butantã - São Paulo/SP - 05533-000",
      "Entrega": "Rua Dr Fabricio Vampre, 111 - SP - 04014-020",
      "Cobrança": "Rua Dr Fabricio Vampre, 111 - SP - 04014-020"
    },
    "email": "seta@exto.com.br",
    "telefones": [],
    "equipe": [
      {
        "cargo": "Gerente",
        "nome": "Roger",
        "telefone": "11989156810"
      },
      {
        "cargo": "Engº Coord.",
        "nome": "Roger",
        "telefone": "11989156810"
      },
      {
        "cargo": "Engº Resid.",
        "nome": "Renato",
        "telefone": "11966348927"
      },
      {
        "cargo": "Administr.",
        "nome": "Jose A.",
        "telefone": "11972322008"
      }
    ]
  },
  {
    "nome": "Selective Morumbi",
    "numero": "126",
    "organizacao": "Exto Domi",
    "categoria": "OBRAS RECÉM FINALIZADAS - ASSITENCIA TECNICA",
    "aba": "Obras / SPEs Finalizadas",
    "documentos": {
      "CNPJ": "11.303.471/0001-95",
      "CNO": "51.207.43833/78",
      "IE": "Isenta"
    },
    "enderecos": {
      "Fatura": "Av. Eliseu de Almeida n° 1415 - Butantã - São Paulo/SP - CEP: 05533-000",
      "Entrega": "Rua Domingos Lopes da Silva n°560 - Vila Suzana - SP - 05641-030",
      "Cobrança": "Rua Domingos Lopes da Silva n°560 - Vila Suzana -  SP - 05641-030"
    },
    "email": "",
    "telefones": [],
    "equipe": [
      {
        "cargo": "Gerente",
        "nome": "William",
        "telefone": "11966374116"
      },
      {
        "cargo": "Engº Coord.",
        "nome": "Alberto",
        "telefone": "11966312632"
      },
      {
        "cargo": "Administr.",
        "nome": "Max",
        "telefone": "11976662908"
      }
    ]
  },
  {
    "nome": "Être",
    "numero": "130",
    "organizacao": "Exto Nova",
    "categoria": "OBRAS RECÉM FINALIZADAS - ASSITENCIA TECNICA",
    "aba": "Obras / SPEs Finalizadas",
    "documentos": {
      "CNPJ": "11.305.796/0001-07",
      "CNO": "51.211.43134/71",
      "IE": "Isenta"
    },
    "enderecos": {
      "Fatura": "Av. Eliseu de Almeida n ° 1415 - Butantã - São Paulo/SP - CEP: 05533-000",
      "Entrega": "Rua Aimberê, 938 - Perdizes - SP - 05018-010",
      "Cobrança": "Rua Aimberê, 938 - Perdizes - SP - 05018-010"
    },
    "email": "",
    "telefones": [],
    "equipe": [
      {
        "cargo": "Gerente",
        "nome": "Roger",
        "telefone": "11989156810"
      },
      {
        "cargo": "Engº Coord.",
        "nome": "Roger",
        "telefone": "11989156810"
      },
      {
        "cargo": "Engº Resid.",
        "nome": "Leticia",
        "telefone": "11963314821"
      },
      {
        "cargo": "Administr.",
        "nome": "Maria",
        "telefone": "11976808368"
      }
    ]
  },
  {
    "nome": "Clublife",
    "numero": "112",
    "organizacao": "Exto Elo",
    "categoria": "OBRAS RECÉM FINALIZADAS - ASSITENCIA TECNICA",
    "aba": "Obras / SPEs Finalizadas",
    "documentos": {
      "CNPJ": "09.099.455/0001-45",
      "IE": "Isenta"
    },
    "enderecos": {
      "Fatura": "Av. Eliseu de Almeida n° 1415 - Butantã - São Paulo/SP - CEP: 05533-000",
      "Entrega": "Rua Jose Carlos de Toledo Piza, n° 100 / 150 Lotes 3, 4 - Pq. Bairro Morumbi - SP - 05712-070",
      "Cobrança": "Rua Jose Carlos de Toledo Piza, n° 100 / 150 Lotes 3, 4 - Pq. Bairro Morumbi - SP - 05712-070"
    },
    "email": "",
    "telefones": [],
    "equipe": [
      {
        "cargo": "Gerente",
        "nome": "William",
        "telefone": "11966374116"
      },
      {
        "cargo": "Engº Coord.",
        "nome": "Rodrigo",
        "telefone": "11966380557"
      },
      {
        "cargo": "Engº Resid.",
        "nome": "Renato",
        "telefone": "11966348927"
      },
      {
        "cargo": "Administr.",
        "nome": "Daiana",
        "telefone": "11991158712"
      }
    ]
  },
  {
    "nome": "Parc Devant",
    "numero": "124",
    "organizacao": "Exto 38",
    "categoria": "OBRAS RECÉM FINALIZADAS - ASSITENCIA TECNICA",
    "aba": "Obras / SPEs Finalizadas",
    "documentos": {
      "CNPJ": "11.305.805/0001-60",
      "CNO": "51.214.57597/78",
      "IE": "Isenta"
    },
    "enderecos": {
      "Fatura": "Av. Eliseu de Almeida n ° 1415 - Butantã - São Paulo/SP - CEP: 05533-000",
      "Entrega": "Rua Doutor Costa Junior n° 324 e 338 - SP - 05002-000",
      "Cobrança": "Rua Doutor Costa Junior n° 324 e 338 - SP  - 05002-000"
    },
    "email": "",
    "telefones": [],
    "equipe": [
      {
        "cargo": "Gerente",
        "nome": "Roger",
        "telefone": "11989156810"
      },
      {
        "cargo": "Engº Coord.",
        "nome": "Roger",
        "telefone": "11989156810"
      },
      {
        "cargo": "Engº Resid.",
        "nome": "Letícia",
        "telefone": "11963314821"
      },
      {
        "cargo": "Administr.",
        "nome": "Maria",
        "telefone": "11976808368"
      }
    ]
  },
  {
    "nome": "Scène",
    "numero": "216",
    "organizacao": "Exto Beta",
    "categoria": "OBRAS RECÉM FINALIZADAS - ASSITENCIA TECNICA",
    "aba": "Obras / SPEs Finalizadas",
    "documentos": {
      "CNPJ": "13.618.771/0001-99",
      "CNO": "51.223.78366/70",
      "IE": "Isenta"
    },
    "enderecos": {
      "Fatura": "Av. Eliseu de Almeida n° 1415 - Butantã - São Paulo/SP - CEP: 05533-000",
      "Entrega": "Rua Catão nº 626 - SP - 05049-000",
      "Cobrança": "Rua Catão nº 626 - SP - 05049-000"
    },
    "email": "",
    "telefones": [],
    "equipe": [
      {
        "cargo": "Gerente",
        "nome": "Roger",
        "telefone": "11989156810"
      },
      {
        "cargo": "Engº Coord.",
        "nome": "Roger",
        "telefone": "11989156810"
      },
      {
        "cargo": "Engº Resid.",
        "nome": "Stella",
        "telefone": "11976586175"
      }
    ]
  },
  {
    "nome": "Sense Botanic",
    "numero": "202",
    "organizacao": "Exto Melo",
    "categoria": "OBRAS RECÉM FINALIZADAS - ASSITENCIA TECNICA",
    "aba": "Obras / SPEs Finalizadas",
    "documentos": {
      "CNPJ": "13.250.343/0001-56",
      "CNO": "51.213.76422/79",
      "IE": "Isenta"
    },
    "enderecos": {
      "Fatura": "Av. Eliseu de Almeida n° 1415 - Butantã - São Paulo/SP - CEP: 05533-000",
      "Entrega": "Rua Nelson Gama de Oliveira nº 1360 - SP - 05734-150",
      "Cobrança": "Rua Nelson Gama de Oliveira nº 1360 - SP - 05734-150"
    },
    "email": "",
    "telefones": [],
    "equipe": [
      {
        "cargo": "Gerente",
        "nome": "William",
        "telefone": "11966374116"
      },
      {
        "cargo": "Engº Coord.",
        "nome": "Alberto",
        "telefone": "11966312632"
      },
      {
        "cargo": "Engº Resid.",
        "nome": "Renato",
        "telefone": "11966348927"
      },
      {
        "cargo": "Administr.",
        "nome": "Ronaldo",
        "telefone": "11976620841"
      }
    ]
  },
  {
    "nome": "Parc Exclusif",
    "numero": "128",
    "organizacao": "Exto Caetés",
    "categoria": "OBRAS RECÉM FINALIZADAS - ASSITENCIA TECNICA",
    "aba": "Obras / SPEs Finalizadas",
    "documentos": {
      "CNPJ": "11.306.031/0001-91",
      "CNO": "60.014.04715/70",
      "IE": "Isenta"
    },
    "enderecos": {
      "Fatura": "Av. Eliseu de Almeida n° 1415 - Butantã - São Paulo/SP - CEP: 05533-000",
      "Entrega": "Rua Caetés n° 84/100/106/116 - SP - 05016-080",
      "Cobrança": "Rua Caetés n° 84/100/106/116 - SP - 05016-080"
    },
    "email": "",
    "telefones": [],
    "equipe": [
      {
        "cargo": "Gerente",
        "nome": "Roger",
        "telefone": "11989156810"
      },
      {
        "cargo": "Engº Coord.",
        "nome": "Roger",
        "telefone": "11989156810"
      },
      {
        "cargo": "Engº Resid.",
        "nome": "André",
        "telefone": "11966234609"
      },
      {
        "cargo": "Administr.",
        "nome": "José",
        "telefone": "11994965619"
      }
    ]
  },
  {
    "nome": "Perfil",
    "numero": "204",
    "organizacao": "Exto Milos",
    "categoria": "OBRAS RECÉM FINALIZADAS - ASSITENCIA TECNICA",
    "aba": "Obras / SPEs Finalizadas",
    "documentos": {
      "CNPJ": "13.250.604/0001-38",
      "CNO": "51.220.33111/79",
      "IE": "Isenta"
    },
    "enderecos": {
      "Fatura": "Av. Eliseu de Almeida n° 1415 - Butantã - São Paulo/SP - CEP: 05533-000",
      "Entrega": "Rua Carvalho de Freitas, 255 - SP - 05728-030",
      "Cobrança": "Rua Carvalho de Freitas, 255 - SP - 05728-030"
    },
    "email": "",
    "telefones": [],
    "equipe": [
      {
        "cargo": "Gerente",
        "nome": "William",
        "telefone": "11966374116"
      },
      {
        "cargo": "Engº Coord.",
        "nome": "Rodrigo",
        "telefone": "11966380557"
      },
      {
        "cargo": "Administr.",
        "nome": "Carlito",
        "telefone": "11976844926"
      }
    ]
  },
  {
    "nome": "Reservê",
    "numero": "222",
    "organizacao": "Exto Parque",
    "categoria": "OBRAS RECÉM FINALIZADAS - ASSITENCIA TECNICA",
    "aba": "Obras / SPEs Finalizadas",
    "documentos": {
      "CNPJ": "13.618.512/0001-68",
      "CNO": "51.222.52552/78",
      "IE": "Isenta"
    },
    "enderecos": {
      "Fatura": "Av. Eliseu de Almeida n° 1415 - Butantã - São Paulo/SP - CEP: 05533-000",
      "Entrega": "Rua Deputado João Sussumu Hirata, 650 - SP - 05715-010",
      "Cobrança": "Rua Deputado João Sussumu Hirata, 650 - SP -  05715-010"
    },
    "email": "",
    "telefones": [],
    "equipe": [
      {
        "cargo": "Gerente",
        "nome": "William",
        "telefone": "11966374116"
      },
      {
        "cargo": "Engº Coord.",
        "nome": "Alberto",
        "telefone": "11966312632"
      },
      {
        "cargo": "Engº Resid.",
        "nome": "Arley",
        "telefone": "11976625470"
      },
      {
        "cargo": "Administr.",
        "nome": "Daiana",
        "telefone": "11991158712"
      }
    ]
  },
  {
    "nome": "Converge",
    "numero": "208",
    "organizacao": "Exto Roma",
    "categoria": "OBRAS RECÉM FINALIZADAS - ASSITENCIA TECNICA",
    "aba": "Obras / SPEs Finalizadas",
    "documentos": {
      "CNPJ": "09.520.683/0001-82",
      "CNO": "51.223.78332/71",
      "IE": "Isenta"
    },
    "enderecos": {
      "Fatura": "Av. Eliseu de Almeida n° 1415 - Butantã - São Paulo/SP - CEP: 05533-000",
      "Entrega": "Rua Clelia, 2208 - SP - 05042-001",
      "Cobrança": "Rua Clelia, 2208 - SP -  05042-001"
    },
    "email": "",
    "telefones": [],
    "equipe": [
      {
        "cargo": "Gerente",
        "nome": "Roger",
        "telefone": "11989156810"
      },
      {
        "cargo": "Engº Coord.",
        "nome": "Roger",
        "telefone": "11989156810"
      },
      {
        "cargo": "Engº Resid.",
        "nome": "Renato",
        "telefone": "11966348927"
      },
      {
        "cargo": "Administr.",
        "nome": "Maria",
        "telefone": "11976808368"
      }
    ]
  },
  {
    "nome": "Ext Campo Belo",
    "numero": "218",
    "organizacao": "Exto Terrara",
    "categoria": "OBRAS RECÉM FINALIZADAS - ASSITENCIA TECNICA",
    "aba": "Obras / SPEs Finalizadas",
    "documentos": {
      "CNPJ": "13.618.492/0001-25",
      "CNO": "51.224.57438/78",
      "IE": "Isenta"
    },
    "enderecos": {
      "Fatura": "Av. Eliseu de Almeida n° 1415 - Butantã - São Paulo/SP - CEP: 05533-000",
      "Entrega": "Av. Vereador Jose de Diniz, 3130 - SP - 04.603-005",
      "Cobrança": "Av. Vereador Jose de Diniz, 3130 - SP - 04.603-005"
    },
    "email": "",
    "telefones": [],
    "equipe": [
      {
        "cargo": "Gerente",
        "nome": "William",
        "telefone": "11966374116"
      },
      {
        "cargo": "Engº Coord.",
        "nome": "Rodrigo",
        "telefone": "11966380557"
      },
      {
        "cargo": "Engº Resid.",
        "nome": "Leandro",
        "telefone": "11976608029"
      },
      {
        "cargo": "Administr.",
        "nome": "Ronaldo",
        "telefone": "11976914758"
      }
    ]
  },
  {
    "nome": "Ext Praça Morumbi",
    "numero": "228",
    "organizacao": "Exto Iris",
    "categoria": "OBRAS RECÉM FINALIZADAS - ASSITENCIA TECNICA",
    "aba": "Obras / SPEs Finalizadas",
    "documentos": {
      "CNPJ": "15.772.438/0001-65",
      "CNO": "51.236.53959/76",
      "IE": "Isenta"
    },
    "enderecos": {
      "Fatura": "Av. Eliseu de Almeida n° 1415 - Butantã - São Paulo/SP - CEP: 05533-000",
      "Entrega": "Rua Francisco Jose da Silva, 438 - SP - 05726-100",
      "Cobrança": "Rua Francisco Jose da Silva, 438 - SP - 05726-100"
    },
    "email": "",
    "telefones": [],
    "equipe": [
      {
        "cargo": "Gerente",
        "nome": "Willian",
        "telefone": "11966374116"
      },
      {
        "cargo": "Engº Coord.",
        "nome": "Rodrigo",
        "telefone": "11966380557"
      },
      {
        "cargo": "Engº Resid.",
        "nome": "Arley",
        "telefone": "11976625470"
      },
      {
        "cargo": "Administr.",
        "nome": "Francisco",
        "telefone": "11989074535"
      }
    ]
  },
  {
    "nome": "RG Domigos",
    "numero": "232",
    "organizacao": "Exto Gama",
    "categoria": "OBRAS RECÉM FINALIZADAS - ASSITENCIA TECNICA",
    "aba": "Obras / SPEs Finalizadas",
    "documentos": {
      "CNPJ": "13.618.914/0001-62",
      "CNO": "60.017.92647/77",
      "IE": "Isenta"
    },
    "enderecos": {
      "Fatura": "Av. Eliseu de Almeida n° 1415 - Butantã - São Paulo/SP - CEP: 05533-000",
      "Entrega": "Rua Domingos Lopes da Silva, 911 - SP - 05641-030",
      "Cobrança": "Rua Domingos Lopes da Silva, 911 - SP - 05641-030"
    },
    "email": "",
    "telefones": [],
    "equipe": [
      {
        "cargo": "Gerente",
        "nome": "Willian",
        "telefone": "11966374116"
      },
      {
        "cargo": "Engº Coord.",
        "nome": "Alberto",
        "telefone": "11966374116"
      },
      {
        "cargo": "Engº Resid.",
        "nome": "Mario",
        "telefone": "11966312632"
      },
      {
        "cargo": "Administr.",
        "nome": "Max",
        "telefone": "11976662908"
      }
    ]
  },
  {
    "nome": "RG Oscar",
    "numero": "244",
    "organizacao": "Exto Multi",
    "categoria": "OBRAS RECÉM FINALIZADAS - ASSITENCIA TECNICA",
    "aba": "Obras / SPEs Finalizadas",
    "documentos": {
      "CNPJ": "18.342.670/0001-51",
      "CNO": "51.229.84051/71",
      "IE": "Isenta"
    },
    "enderecos": {
      "Fatura": "Av. Eliseu de Almeida n° 1415 - Butantã - São Paulo/SP - CEP: 05533-000",
      "Entrega": "Rua Dr Oscar Monteiro de Barros, 434 - SP - 05641-010",
      "Cobrança": "Rua Dr Oscar Monteiro de Barros, 434 - SP - 05641-010"
    },
    "email": "",
    "telefones": [],
    "equipe": [
      {
        "cargo": "Gerente",
        "nome": "Willian",
        "telefone": "11966374116"
      },
      {
        "cargo": "Engº Coord.",
        "nome": "Rodrigo",
        "telefone": "11966374116"
      },
      {
        "cargo": "Engº Resid.",
        "nome": "Andre",
        "telefone": "11966234609"
      },
      {
        "cargo": "Administr.",
        "nome": "Carlito",
        "telefone": "11976844926"
      }
    ]
  },
  {
    "nome": "Merite",
    "numero": "242",
    "organizacao": "Exto Alpha",
    "categoria": "OBRAS RECÉM FINALIZADAS - ASSITENCIA TECNICA",
    "aba": "Obras / SPEs Finalizadas",
    "documentos": {
      "CNPJ": "18.342.684/0001-75",
      "CNO": "60.022.30871/75",
      "IE": "Isenta"
    },
    "enderecos": {
      "Fatura": "Av. Eliseu de Almeida n° 1415 - Butantã - São Paulo/SP - CEP: 05533-000",
      "Entrega": "Rua Fábia, 1050 - SP - 05051-050",
      "Cobrança": "Rua Fábia, 1050 - SP - 05051-050"
    },
    "email": "",
    "telefones": [],
    "equipe": [
      {
        "cargo": "Gerente",
        "nome": "Roger",
        "telefone": "11989156810"
      },
      {
        "cargo": "Engº Coord.",
        "nome": "Roger",
        "telefone": "11989156810"
      },
      {
        "cargo": "Engº Resid.",
        "nome": "Renato",
        "telefone": "11966348927"
      },
      {
        "cargo": "Administr.",
        "nome": "Maria",
        "telefone": "11976808368"
      }
    ]
  },
  {
    "nome": "Clock",
    "numero": "250",
    "organizacao": "Exto Live",
    "categoria": "OBRAS RECÉM FINALIZADAS - ASSITENCIA TECNICA",
    "aba": "Obras / SPEs Finalizadas",
    "documentos": {
      "CNPJ": "19.138.899/0001-31",
      "CNO": "51.240.60080/70",
      "IE": "Isenta"
    },
    "enderecos": {
      "Fatura": "Av. Eliseu de Almeida nº 1415 - Butantã - São Paulo/SP - CEP: 05533-000",
      "Entrega": "Rua Vespasiano 650 - SP - 05044-050",
      "Cobrança": "Rua Vespasiano 650 - SP - 05044-050"
    },
    "email": "",
    "telefones": [],
    "equipe": [
      {
        "cargo": "Gerente",
        "nome": "Willian",
        "telefone": "11966374116"
      },
      {
        "cargo": "Engº Coord.",
        "nome": "Willian",
        "telefone": "11966374116"
      },
      {
        "cargo": "Engº Resid.",
        "nome": "Arley",
        "telefone": "11976625470"
      },
      {
        "cargo": "Administr.",
        "nome": "Max",
        "telefone": "11976662908"
      }
    ]
  },
  {
    "nome": "Authentic - Madalena",
    "numero": "274",
    "organizacao": "Exto Plano",
    "categoria": "OBRAS RECÉM FINALIZADAS - ASSITENCIA TECNICA",
    "aba": "Obras / SPEs Finalizadas",
    "documentos": {
      "CNPJ": "20.383.371/0001-07",
      "CNO": "60.025.08688/72",
      "IE": "Isenta"
    },
    "enderecos": {
      "Fatura": "Av. Eliseu de Almeida nº 1415 - Butantã - São Paulo/SP - CEP: 05533-000",
      "Entrega": "Rua Paulistânia, 111 - SP - 05440-000",
      "Cobrança": "Rua Paulistânia, 111 - SP - 05440-000"
    },
    "email": "",
    "telefones": [],
    "equipe": [
      {
        "cargo": "Gerente",
        "nome": "Roger",
        "telefone": "11989156810"
      },
      {
        "cargo": "Engº Coord.",
        "nome": "Roger",
        "telefone": "11989156810"
      },
      {
        "cargo": "Engº Resid.",
        "nome": "Leandro",
        "telefone": "11976608029"
      },
      {
        "cargo": "Administr.",
        "nome": "Maria",
        "telefone": "11976808368"
      }
    ]
  },
  {
    "nome": "Authentic - WE",
    "numero": "268",
    "organizacao": "Exto Petra",
    "categoria": "OBRAS RECÉM FINALIZADAS - ASSITENCIA TECNICA",
    "aba": "Obras / SPEs Finalizadas",
    "documentos": {
      "CNPJ": "20.420.804/0001-57",
      "CNO": "51.241.19234/78",
      "IE": "Isenta"
    },
    "enderecos": {
      "Fatura": "Av. Eliseu de Almeida nº 1415 - Butantã - São Paulo/SP - CEP: 05533-000",
      "Entrega": "Rua Paulistania, 600 - SP - 05440-001",
      "Cobrança": "Rua Paulistania, 600 - SP - 05440-001"
    },
    "email": "",
    "telefones": [],
    "equipe": [
      {
        "cargo": "Gerente",
        "nome": "Roger",
        "telefone": "11989156810"
      },
      {
        "cargo": "Engº Coord.",
        "nome": "Roger",
        "telefone": "11989156810"
      },
      {
        "cargo": "Engº Resid.",
        "nome": "Mario",
        "telefone": "11976929442"
      },
      {
        "cargo": "Administr.",
        "nome": "José",
        "telefone": "11994965619"
      }
    ]
  },
  {
    "nome": "Provenance",
    "numero": "236",
    "organizacao": "Exto Anis",
    "categoria": "OBRAS RECÉM FINALIZADAS - ASSITENCIA TECNICA",
    "aba": "Obras / SPEs Finalizadas",
    "documentos": {
      "CNPJ": "15.772.410/0001-28",
      "CNO": "60.024.19171/74",
      "IE": "Isenta"
    },
    "enderecos": {
      "Fatura": "Av. Eliseu de Almeida n° 1415 - Butantã - São Paulo/SP - CEP: 05533-000",
      "Entrega": "Rua Carvalho de Freitas, 420 - SP - 05728-030",
      "Cobrança": "Rua Carvalho de Freitas, 420 - SP - 05728-030"
    },
    "email": "",
    "telefones": [],
    "equipe": [
      {
        "cargo": "Gerente",
        "nome": "Rodrigo",
        "telefone": "11966380557"
      },
      {
        "cargo": "Engº Coord.",
        "nome": "Rodrigo",
        "telefone": "11966380557"
      },
      {
        "cargo": "Administr.",
        "nome": "Ronaldo",
        "telefone": "11976914758"
      }
    ]
  },
  {
    "nome": "Ekoara I",
    "numero": "34",
    "organizacao": "E.P.G. Incorporações",
    "categoria": "OBRAS FINALIZADAS",
    "aba": "Obras / SPEs Finalizadas",
    "documentos": {
      "CNPJ": "07.491.750/0001-52",
      "CNO": "46.030.00886/71",
      "IE": "148190724113"
    },
    "enderecos": {
      "Fatura": "Av. Eliseu de Almeida - 1415 - Butantã - São Paulo/SP - CEP: 05533-000",
      "Entrega": "Rodovia PE 09, km 04 - Muro Alto - Municipio Ipojuca - PE - 55590-000",
      "Cobrança": "Rodovia PE 09, km 04 - Muro Alto - Municipio Ipojuca - PE - 55590-000"
    },
    "email": "",
    "telefones": [],
    "equipe": [
      {
        "cargo": "Gerente",
        "nome": "Marcela (GR8)",
        "telefone": "11994175745"
      },
      {
        "cargo": "Engº Coord.",
        "nome": "Marcela (GR8)",
        "telefone": "11994175745"
      }
    ]
  },
  {
    "nome": "Ekoara II",
    "numero": "120",
    "organizacao": "Exto Eko",
    "categoria": "OBRAS FINALIZADAS",
    "aba": "Obras / SPEs Finalizadas",
    "documentos": {
      "CNPJ": "10.496.893/0001-61",
      "CNO": "46.030.00886-71",
      "IE": "Isenta"
    },
    "enderecos": {
      "Fatura": "Av. Eliseu de Almeida n° 1415 - Butantã - São Paulo/SP - CEP: 05533-000",
      "Entrega": "Rodovia PE 09, PE, CEP: 55590-000",
      "Cobrança": "Rodovia PE 09, PE, CEP: 55590-000"
    },
    "email": "",
    "telefones": [],
    "equipe": [
      {
        "cargo": "Gerente",
        "nome": "Fabrício",
        "telefone": "11966323742"
      }
    ]
  },
  {
    "nome": "Maison La Frontière",
    "numero": "122",
    "organizacao": "Exto Humaitá",
    "categoria": "OBRAS FINALIZADAS",
    "aba": "Obras / SPEs Finalizadas",
    "documentos": {
      "CNPJ": "10.829.878/0001-98",
      "CNO": "51.207.40931/70",
      "IE": "Isenta"
    },
    "enderecos": {
      "Fatura": "Av. Eliseu de Almeida - 1415 - Butantã - São Paulo/SP - CEP: 05533-000",
      "Entrega": "Rua Alvorada n° 153 - Vila Olimpia - SP - 08582-785",
      "Cobrança": "Rua Alvorada n° 153 - Vila Olimpia - SP - 08582-785"
    },
    "email": "",
    "telefones": [],
    "equipe": [
      {
        "cargo": "Gerente",
        "nome": "William",
        "telefone": "11966374116"
      },
      {
        "cargo": "Engº Coord.",
        "nome": "William",
        "telefone": "11966374116"
      },
      {
        "cargo": "Engº Resid.",
        "nome": "André Colli",
        "telefone": "11966234609"
      }
    ]
  },
  {
    "nome": "Verde    Morumbi",
    "numero": "134",
    "organizacao": "Bonnaire Residencial",
    "categoria": "OBRAS FINALIZADAS",
    "aba": "Obras / SPEs Finalizadas",
    "documentos": {
      "CNPJ": "09.259.333/0001-04",
      "CNO": "70.002.08221/78",
      "IE": "Isenta"
    },
    "enderecos": {
      "Fatura": "Av. Nações Unidas n° 8501 - Pinheiros - São Paulo/SP - CEP: 05425-070",
      "Entrega": "Rua João Simões de Souza n° 391 - Pq. Rebouças - SP - 05734-140",
      "Cobrança": "Rua João Simões de Souza n° 391 - Pq. Rebouças - SP -  05734-140"
    },
    "email": "",
    "telefones": [],
    "equipe": [
      {
        "cargo": "Gerente",
        "nome": "William",
        "telefone": "11966374116"
      },
      {
        "cargo": "Engº Coord.",
        "nome": "Alberto",
        "telefone": "11966312632"
      },
      {
        "cargo": "Engº Resid.",
        "nome": "Raphael",
        "telefone": "11966234609"
      },
      {
        "cargo": "Administr.",
        "nome": "Francisco",
        "telefone": "11989074535"
      }
    ]
  },
  {
    "nome": "Paesaggio Villa-Lobos",
    "numero": "212",
    "organizacao": "Exto Mor",
    "categoria": "OBRAS FINALIZADAS",
    "aba": "Obras / SPEs Finalizadas",
    "documentos": {
      "CNPJ": "13.250.324/0001-20",
      "CNO": "51.229.49854/79",
      "IE": "Isenta"
    },
    "enderecos": {
      "Fatura": "Av. Eliseu de Almeida n° 1415 - Butantã - São Paulo/SP - CEP: 05533-000",
      "Entrega": "Rua Paulo Franco, 472 - SP - 05305-031",
      "Cobrança": "Rua Paulo Franco, 472 - SP - 05305-031"
    },
    "email": "",
    "telefones": [],
    "equipe": [
      {
        "cargo": "Gerente",
        "nome": "Roger",
        "telefone": "11989156810"
      },
      {
        "cargo": "Engº Coord.",
        "nome": "Roger",
        "telefone": "11989156810"
      },
      {
        "cargo": "Engº Resid.",
        "nome": "Augusto",
        "telefone": "11966463827"
      },
      {
        "cargo": "Administr.",
        "nome": "Daiana",
        "telefone": "11991158712"
      }
    ]
  },
  {
    "nome": "G.E.O",
    "numero": "206",
    "organizacao": "Exto Sim",
    "categoria": "OBRAS FINALIZADAS",
    "aba": "Obras / SPEs Finalizadas",
    "documentos": {
      "CNPJ": "13.250.615/0001-18",
      "CNO": "51.240.18303/75",
      "IE": "Isenta"
    },
    "enderecos": {
      "Fatura": "Av. Eliseu de Almeida n° 1415  - Butantã - São Paulo/SP - CEP: 05533-000",
      "Entrega": "Rua Antártica nº687 - SP - 01141-060",
      "Cobrança": "Rua Antartica nº687 - SP - 01141-060"
    },
    "email": "",
    "telefones": [],
    "equipe": [
      {
        "cargo": "Gerente",
        "nome": "Roger",
        "telefone": "11989156810"
      },
      {
        "cargo": "Engº Coord.",
        "nome": "Roger",
        "telefone": "11989156810"
      },
      {
        "cargo": "Engº Resid.",
        "nome": "Mario",
        "telefone": "11976929442"
      },
      {
        "cargo": "Administr.",
        "nome": "José",
        "telefone": "11994965619"
      }
    ]
  },
  {
    "nome": "PQ.TEC",
    "numero": "256",
    "organizacao": "Exto Era",
    "categoria": "OBRAS FINALIZADAS",
    "aba": "Obras / SPEs Finalizadas",
    "documentos": {
      "CNPJ": "19.269.510/0001-97",
      "CNO": "90.000.81056/79",
      "IE": "Isenta"
    },
    "enderecos": {
      "Fatura": "Av. Eliseu de Almeida nº 1415 - Butantã - São Paulo/SP - CEP: 05533-000",
      "Entrega": "Estrada Joel de Paula - SJC - 12247-015",
      "Cobrança": "Estrada Joel de Paula - SJC - 12247-015"
    },
    "email": "",
    "telefones": [],
    "equipe": [
      {
        "cargo": "Gerente",
        "nome": "Rodrigo",
        "telefone": "11966380557"
      },
      {
        "cargo": "Engº Coord.",
        "nome": "Rodrigo",
        "telefone": "11966380557"
      }
    ]
  },
  {
    "nome": "Encerrada (manobra fiscal, exto vista)",
    "numero": "262",
    "organizacao": "Exto Rod",
    "categoria": "SPEs FINALIZADAS / NÃO UTILIZADAS",
    "aba": "Obras / SPEs Finalizadas",
    "documentos": {
      "CNPJ": "22.108.885/0001-80",
      "IE": "Isenta"
    },
    "enderecos": {
      "Fatura": "Av. Eliseu de Almeida nº 1415 - Butantã - São Paulo/SP - 05533-000"
    },
    "email": "",
    "telefones": [],
    "equipe": [
      {
        "cargo": "Gerente",
        "nome": "Fabrício",
        "telefone": "11966323742"
      }
    ]
  }
]

# -*- coding: utf-8 -*-
"""Parseia 'Exto - Tabela de Obras - R34.xls' -> JSON estruturado por obra.
Layout: cada obra e um bloco de linhas; campos sao label-driven (col3/col5/col7),
o que funciona tanto pra aba GERAL (2 linhas) quanto pras abas de projeto (4 linhas).
"""
import xlrd, json, datetime, sys

SRC = r"J:\Suprimentos\Exto - Tabela de Obras - R34.xls"


def cell(sh, r, c):
    if c >= sh.ncols:
        return ""
    v = sh.cell_value(r, c)
    if isinstance(v, float):
        if v == int(v):
            v = int(v)
    s = str(v).replace("\n", " ").strip()
    return "" if s in ("-", "") else s


def norm_label(s):
    return s.rstrip(":").strip()


def is_blank_row(sh, r):
    return all(cell(sh, r, c) == "" for c in range(sh.ncols))


ABAS = {
    0: "Geral / Sedes",
    1: "Próximos Lançamentos",
    2: "SPEs no Aguardo",
    3: "Obras / SPEs Finalizadas",
}


def parse():
    b = xlrd.open_workbook(SRC)
    obras = []
    for idx, aba_label in ABAS.items():
        sh = b.sheet_by_index(idx)
        section = ""
        r = 0
        while r < sh.nrows:
            c0 = cell(sh, r, 0)
            c1 = cell(sh, r, 1)
            c2 = cell(sh, r, 2)
            # cabecalho de secao: col0 preenchido, sem organizacao nem numero
            if c0 and not c2 and not c1:
                # ignora titulos genericos de cabecalho de tabela
                up = c0.upper()
                if up not in ("EMPREENDIMENTOS", "OBRA / PROJETO"):
                    section = c0
                r += 1
                continue
            # inicio de obra: col0 + organizacao (ignora linha de cabecalho da tabela)
            if c0 and c2 and c0.upper() not in ("OBRA / PROJETO",):
                block = [r]
                rr = r + 1
                while rr < sh.nrows and cell(sh, rr, 0) == "" and not is_blank_row(sh, rr):
                    block.append(rr)
                    rr += 1
                obras.append(parse_block(sh, block, aba_label, section))
                r = rr
                continue
            r += 1
    return obras


def parse_block(sh, rows, aba, section):
    r0 = rows[0]
    rec = {
        "nome": cell(sh, r0, 0),
        "numero": cell(sh, r0, 1),
        "organizacao": cell(sh, r0, 2),
        "categoria": section,
        "aba": aba,
        "documentos": {},
        "enderecos": {},
        "email": "",
        "telefones": [],
        "equipe": [],
    }
    tel_geral = cell(sh, r0, 9)      # aba GERAL: telefone da empresa na col9
    email_geral = cell(sh, r0, 10)   # aba GERAL: email na col10
    if email_geral:
        rec["email"] = email_geral
    if tel_geral and sh.ncols >= 11:
        rec["telefones"].append(tel_geral)

    for r in rows:
        dl, dv = norm_label(cell(sh, r, 3)), cell(sh, r, 4)
        if dl and dv:
            rec["documentos"][dl] = dv
        el, ev = norm_label(cell(sh, r, 5)), cell(sh, r, 6)
        if el and ev:
            if el.lower().startswith("e-mail") or el.lower() == "email":
                if not rec["email"]:
                    rec["email"] = ev
            else:
                rec["enderecos"][el] = ev
        # equipe: abas de projeto tem label em col7, nome col8, tel col9
        ql, qn, qt = norm_label(cell(sh, r, 7)), cell(sh, r, 8), cell(sh, r, 9)
        if sh.ncols <= 10:  # abas de projeto
            if qn:
                rec["equipe"].append({"cargo": ql, "nome": qn, "telefone": qt})
        else:  # aba GERAL: col7 nome, col8 tel (sem label), col9 ja e tel_geral
            nome7, tel8 = cell(sh, r, 7), cell(sh, r, 8)
            if nome7:
                rec["equipe"].append({"cargo": "", "nome": nome7, "telefone": tel8})
    return rec


TS_HEADER = '''// AUTO-GERADO — não editar à mão.
// Fonte: "{fonte}" (revisão {rev}); gerado por scripts/parse_obras.py.
// Para atualizar quando Suprimentos publicar uma revisão nova:
//   1. rode  python scripts/parse_obras.py src/data/obras.ts  apontando o SRC pro novo .xls
//   2. confira o diff e faça o build/deploy.

export interface EquipeMembro {{ cargo: string; nome: string; telefone: string }}

export interface Obra {{
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
}}

export const OBRAS_FONTE = {fonte_js}
export const OBRAS_REVISAO = {rev_js}

export const OBRAS: Obra[] = '''


def emit_ts(obras, path):
    body = json.dumps(obras, ensure_ascii=False, indent=2)
    header = TS_HEADER.format(
        fonte="Exto - Tabela de Obras - R34.xls", rev="R34",
        fonte_js=json.dumps("Exto - Tabela de Obras - R34.xls", ensure_ascii=False),
        rev_js=json.dumps("R34", ensure_ascii=False),
    )
    with open(path, "w", encoding="utf-8", newline="\n") as f:
        f.write(header + body + "\n")


if __name__ == "__main__":
    obras = parse()
    if len(sys.argv) > 1:
        target = sys.argv[1]
        if target.endswith(".ts"):
            emit_ts(obras, target)
        else:
            out = {"fonte": "Exto - Tabela de Obras - R34.xls", "revisao": "R34", "obras": obras}
            with open(target, "w", encoding="utf-8") as f:
                f.write(json.dumps(out, ensure_ascii=False, indent=2))
        print(f"{len(obras)} obras -> {target}")
    else:
        print(f"TOTAL OBRAS: {len(obras)}")
        from collections import Counter
        print("Por aba:", dict(Counter(o["aba"] for o in obras)))
        print("Por categoria:", dict(Counter(o["categoria"] for o in obras)))
        print("\n--- amostra (3) ---")
        for o in obras[:3]:
            print(json.dumps(o, ensure_ascii=False, indent=2))

import json

ot_books = [
    ("Gênesis", 50), ("Êxodo", 40), ("Levítico", 27), ("Números", 36),
    ("Deuteronômio", 34), ("Josué", 24), ("Juízes", 21), ("Rute", 4),
    ("1 Samuel", 31), ("2 Samuel", 24), ("1 Reis", 22), ("2 Reis", 25),
    ("1 Crônicas", 29), ("2 Crônicas", 36), ("Esdras", 10), ("Neemias", 13),
    ("Ester", 10), ("Jó", 42), ("Isaías", 66), ("Jeremias", 52),
    ("Lamentações", 5), ("Ezequiel", 48), ("Daniel", 12), ("Oséias", 14),
    ("Joel", 3), ("Amós", 9), ("Obadias", 1), ("Jonas", 4),
    ("Miqueias", 7), ("Naum", 3), ("Habacuque", 3), ("Sofonias", 3),
    ("Ageu", 2), ("Zacarias", 14), ("Malaquias", 4)
]

nt_books = [
    ("Mateus", 28), ("Marcos", 16), ("Lucas", 24), ("João", 21),
    ("Atos", 28), ("Romanos", 16), ("1 Coríntios", 16), ("2 Coríntios", 13),
    ("Gálatas", 6), ("Efésios", 6), ("Filipenses", 4), ("Colossenses", 4),
    ("1 Tessalonicenses", 5), ("2 Tessalonicenses", 3), ("1 Timóteo", 6),
    ("2 Timóteo", 4), ("Tito", 3), ("Filemom", 1), ("Hebreus", 13),
    ("Tiago", 5), ("1 Pedro", 5), ("2 Pedro", 3), ("1 João", 5),
    ("2 João", 1), ("3 João", 1), ("Judas", 1), ("Apocalipse", 22)
]

def gerar_plano():
    ot_refs = []
    for book, chapters in ot_books:
        for ch in range(1, chapters + 1, 2):
            end_ch = min(ch + 1, chapters)
            if end_ch == ch:
                ot_refs.append(f"{book} {ch}")
            else:
                ot_refs.append(f"{book} {ch}-{end_ch}")
    
    while len(ot_refs) < 365:
        ot_refs.extend(ot_refs[-30:])
    ot_refs = ot_refs[:365]

    nt_refs = []
    for book, chapters in nt_books:
        for ch in range(1, chapters + 1):
            nt_refs.append(f"{book} {ch}")
    while len(nt_refs) < 365:
        nt_refs.extend(nt_refs)
    nt_refs = nt_refs[:365]

    psalms = [f"Salmos {i}" for i in range(1, 151)]
    while len(psalms) < 365:
        psalms.extend(psalms)
    psalms = psalms[:365]

    proverbs = [f"Provérbios {(i % 31) + 1}" for i in range(365)]

    days = []
    for i in range(365):
        days.append({
            "day": i + 1,
            "title": f"Dia {i + 1}",
            "passages": [ot_refs[i], nt_refs[i], psalms[i], proverbs[i]]
        })

    plan = {
        "id": "biblia-365",
        "title": "Bíblia 365",
        "description": "Leia a Bíblia completa em um ano com passagens do Antigo Testamento, Novo Testamento, Salmos e Provérbios.",
        "totalDays": 365,
        "progress": 0,
        "icon": "BookOpen",
        "gradient": "from-blue-600 to-cyan-600",
        "type": "canonical",
        "color": "blue",
        "dayReadings": days
    }
    return plan

plano = gerar_plano()
with open("plano_biblia365.json", "w", encoding="utf-8") as f:
    json.dump(plano, f, ensure_ascii=False, indent=2)

print("Arquivo 'plano_biblia365.json' gerado com sucesso!")
print(f"Total de dias: {len(plano['dayReadings'])}")
# Sorteador Premium - Henlau Química

Este projeto é uma aplicação web moderna e segura para realização de sorteios, desenvolvida com foco total em **transparência e imparcialidade**.

## 🛡️ Transparência e Segurança (Auditabilidade)

O código deste sorteador é aberto para auditoria. A lógica de sorteio reside exclusivamente no servidor (Backend), garantindo que o resultado não possa ser manipulado pelo navegador do usuário.

### Como funciona o sorteio (Código Fonte)

O sorteio utiliza o módulo de criptografia pseudo-aleatória padrão do Python (`random`), que é amplamente auditado e seguro para esta finalidade.

**Arquivo:** `backend/main_app.py`

```python
# Trecho real do código (linhas 80-95)
@app.get("/api/draw")
def draw_winner():
    # ... verificações ...

    # SELEÇÃO ALEATÓRIA
    # A função choice seleciona um item aleatório da lista sem viés.
    winner = random.choice(state.participants)

    # ... lógica de histórico ...

    return {"winner": winner, "remaining_count": len(state.participants)}
```

Não existem "pesos", condicionais ocultas ou qualquer mecanismo que favoreça um participante específico. Todos os participantes na lista têm matematicamente a mesma probabilidade de serem escolhidos.

## 🚀 Funcionalidades

1.  **Modos de Sorteio**:
    - **Nomes**: Cole uma lista de nomes (ex: funcionários, clientes).
    - **Números**: Defina um intervalo (ex: 1 a 300).
2.  **Configurações**:
    - Permitir ou não repetição de vencedores.
    - Sorteio único ou acumulativo.
3.  **Histórico**:
    - Sidebar lateral que registra todos os sorteados em tempo real.
4.  **Interface Premium**:
    - Animações de sorteio para criar expectativa.
    - Design responsivo e focado na experiência do usuário.

## 🛠️ Tecnologias Utilizadas

- **Frontend**: Next.js 14, React, Tailwind CSS.
- **Backend**: Python, FastAPI.

## ▶️ Como Rodar Localmente

### Backend (API)

```bash
cd backend
python -m venv venv
# Windows
.\venv\Scripts\Activate
pip install -r requirements.txt
uvicorn main_app:app --reload
```

### Frontend (Interface)

```bash
cd frontend
npm install
npm run dev
```

---

_Desenvolvido para garantir a integridade dos sorteios da Henlau Química._

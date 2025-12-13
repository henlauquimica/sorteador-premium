# Guia de Uso Local (Urgência)

Para rodar o sorteio localmente no seu computador, eu criei um facilitador.

## Passo Único (Se já tiver tudo instalado)

1.  Dê dois cliques no arquivo `start_local.bat` na pasta do projeto.
2.  Aguarde as duas janelas pretas abrirem e carregarem.
3.  Acesse **`http://localhost:3000`** no seu navegador.

---

## Se for a primeira vez rodando nesse PC:

Você precisa garantir que o Python e o Node.js estão instalados e as dependências baixadas.

### 1. Preparar Backend

Abra o terminal na pasta `backend` e rode:

```bash
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
```

### 2. Preparar Frontend

Abra o terminal na pasta `frontend` e rode:

```bash
npm install
```

Depois disso, o `start_local.bat` funcionará para sempre.

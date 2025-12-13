# Guia de Implantação (Deployment)

Esta aplicação consiste em um frontend Next.js e um backend FastAPI.

## Pré-requisitos

- Node.js 18+
- Python 3.9+

## Estrutura de Domínios Sugerida

- **Frontend (O App):** `https://sorteios.henlau.com.br`
- **Backend (A API):** `https://api.sorteios.henlau.com.br`

## Backend (API)

1.  Navegue até o diretório `backend`.
2.  Instale as dependências:
    ```bash
    pip install -r requirements.txt
    ```
3.  Execute o servidor:
    ```bash
    uvicorn main_app:app --host 0.0.0.0 --port 8000
    ```

## Frontend

1.  Navegue até o diretório `frontend`.
2.  Instale as dependências:
    ```bash
    npm install
    ```
3.  Crie/Atualize o arquivo `.env.production`:

    ```
    NEXT_PUBLIC_API_URL=https://api.sorteios.henlau.com.br
    ```

    _(Nota: A equipe de TI deve criar o subdomínio `api.sorteios.henlau.com.br` apontando para o servidor backend)_

4.  Compile a aplicação (Build):
    ```bash
    npm run build
    ```
5.  Inicie o servidor de produção:
    ```bash
    npm start
    ```

## Arquitetura de Produção

O aplicativo espera que o frontend faça requisições para o backend. Certifique-se de que o CORS esteja configurado corretamente em `backend/main_app.py` se eles estiverem em domínios ou portas diferentes.

Origens CORS configuradas atualmente (Permitidas):

- `http://localhost:3000`
- `https://sorteios.henlau.com.br`

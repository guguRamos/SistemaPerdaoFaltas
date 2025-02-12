# Projeto

**Projeto Full Stack** utilizando Python (Django) no backend e Node.js (React) no frontend. Siga as instruções abaixo para configurar e rodar o projeto corretamente.

---

## 📌 Requisitos
Certifique-se de ter os seguintes itens instalados em sua máquina antes de iniciar:
- [Python](https://www.python.org/downloads/)
- [Node.js](https://nodejs.org/en/download/)
- [Poetry](https://python-poetry.org/docs/)

---

## ⚙️ Configuração e Execução

### 1️⃣ Clonando o repositório
```sh
git clone https://github.com/guguRamos/SistemaPerdaoFaltas.git
cd SistemaPerdaoFaltas
```

### 2️⃣ Configuração do Backend
Na raiz do projeto, ative o ambiente virtual do Poetry:
```sh
poetry shell
```
Selecione o ambiente virtual criado com o interpreador python ( Cntl + Shift + p)
e instale as dependências:
```sh
poetry install
```

### 3️⃣ Configuração do Frontend
Entre na pasta do frontend e instale as dependências do Node.js:
```sh
cd frontend
npm install
```

### 4️⃣ Iniciando o Frontend
Para rodar o frontend, execute:
```sh
npm run dev
```

### 5️⃣ Iniciando o Backend
Volte para a raiz do projeto e entre na pasta do backend:
```sh
cd ..
cd backend
```
Execute o servidor:
```sh
python manage.py runserver
```



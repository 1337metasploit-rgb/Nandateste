# Sorveteria

## Deploy Vercel

1. Criar conta MongoDB Atlas (mongodb.com/cloud/atlas)
2. Criar cluster gratuito
3. Copiar connection string
4. Fazer push no GitHub
5. Conectar repositório no Vercel
6. Adicionar variáveis de ambiente:
   - MONGODB_URI: connection string do MongoDB Atlas
   - SESSION_SECRET: chave aleatória
7. Deploy

## Local

```bash
npm install
node index.js
```

## Credenciais
- Admin: admin / admin123
- User: usuario / user123

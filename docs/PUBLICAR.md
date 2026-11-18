# Abrir no celular e publicar o GestorIA

## 1. No celular, pela rede de casa (sem publicar)

1. Celular e computador na **mesma rede Wi-Fi**.
2. No computador, rode `npm run dev`. O terminal mostra:

   ```text
   - Local:    http://localhost:3000
   - Network:  http://192.168.0.15:3000
   ```

3. No navegador do celular, abra o endereço da linha **Network** (com os números do seu computador).
4. Se o Windows perguntar se o Node.js pode acessar a rede, clique em **Permitir**.

Tudo funciona, **menos o microfone**: o navegador só libera o microfone em HTTPS. O app avisa e a digitação continua.

**Se a página abrir mas os botões não responderem**, e o terminal mostrar algo como `Cross origin request detected from 192.168.0.15`, acrescente o endereço do seu computador em `next.config.ts` e reinicie o `npm run dev`:

```ts
const nextConfig: NextConfig = {
  reactStrictMode: true,
  allowedDevOrigins: ["192.168.0.15"], // o número que aparece na linha "Network"
};
```

## 2. Publicar na Vercel (gratuito, com HTTPS)

A Vercel é a plataforma dos criadores do Next.js. O plano gratuito (*Hobby*) é para uso pessoal e não comercial, o que atende a este protótipo. Para uso comercial, a Vercel exige um plano pago.

Depois de publicado, o app ganha um endereço como `https://gestoria.vercel.app`, que abre em qualquer celular, de qualquer lugar, **com o microfone funcionando** (Chrome no Android, Safari no iPhone).

### Antes de começar

No computador, na pasta `gestoria`, confirme que a versão de produção é gerada sem erros:

```bash
npm run build
```

### Passo 1 — Colocar o projeto no GitHub

1. Crie uma conta em <https://github.com> e um repositório novo chamado `gestoria` (pode ser **privado**). Não marque a opção de criar README.
2. Instale o Git (<https://git-scm.com>), se ainda não tiver.
3. No terminal, dentro da pasta `gestoria`:

   ```bash
   git init
   git add .
   git commit -m "GestorIA: MVP com dados fictícios"
   git branch -M main
   git remote add origin https://github.com/SEU-USUARIO/gestoria.git
   git push -u origin main
   ```

   Troque `SEU-USUARIO` pelo seu usuário do GitHub. O arquivo `.gitignore` já impede o envio de `node_modules` e de arquivos gerados.

> Alternativa sem terminal: o **GitHub Desktop** (<https://desktop.github.com>) faz o mesmo com cliques.

### Passo 2 — Importar na Vercel

1. Acesse <https://vercel.com> e entre com a conta do GitHub (**Continue with GitHub**).
2. Clique em **Add New… → Project**.
3. Escolha o repositório `gestoria` e clique em **Import**.
4. A Vercel reconhece o Next.js sozinha. Não é preciso configurar nada nem cadastrar variáveis de ambiente.
5. Clique em **Deploy** e aguarde cerca de 1 a 2 minutos.
6. Pronto: o endereço aparece na tela. Abra no celular.

### Atualizações

A cada `git push` para o GitHub, a Vercel publica a nova versão sozinha:

```bash
git add .
git commit -m "Descreva a mudança"
git push
```

### Cuidados

- O endereço é **público**: quem tiver o link consegue abrir. Hoje isso não é um problema, porque os dados são fictícios.
- **Nunca** publique dados reais da empresa nesta versão: os perfis não têm senha. Veja *Login e permissões de verdade* em [ARQUITETURA.md](ARQUITETURA.md#login-e-permissões-de-verdade).
- Quando houver chaves de API (ex.: Claude API), elas devem ser cadastradas em **Project → Settings → Environment Variables** na Vercel, nunca escritas no código.

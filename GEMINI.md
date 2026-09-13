# Diretrizes de Desenvolvimento do Projeto

## Testes de Navegador e Interface
- **NUNCA abrir o navegador para testes automatizados:** é expressamente proibido disparar subagentes de navegador (`browser_subagent`) ou comandos de abertura de navegador.
- **Validação com o Usuário:** Caso seja necessário testar ou validar qualquer funcionalidade de interface, solicite sempre que o Fulvio realize o teste no próprio navegador.
- **Validações do Agente:** Utilize apenas validações em terminal (`npm run build`, lint, typecheck).
